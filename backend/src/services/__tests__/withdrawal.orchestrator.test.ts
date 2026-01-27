import { WithdrawalOrchestrator, withdrawalOrchestrator } from "../withdrawal.orchestrator";
import { balanceService } from "../balance.service";
import { airtmUserClient } from "../../lib/airtm.client";
import { supabase } from "../../lib/supabase/supabase";
import { WithdrawalStatus } from "../../types/withdrawal.types";
import { InsufficientFundsError, ValidationError } from "../../utils/AppError";

// Mock dependencies
jest.mock("../balance.service");
jest.mock("../../lib/airtm.client");
jest.mock("../../lib/supabase/supabase", () => ({
    supabase: {
        from: jest.fn(() => ({
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn(),
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
        })),
    },
}));

describe("WithdrawalOrchestrator", () => {
    const userId = "123e4567-e89b-12d3-a456-426614174000";
    const validAmount = 100;
    const currency = "USD";
    const email = "user@example.com";

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("initiateWithdrawal", () => {
        it("should successfully initiate a withdrawal", async () => {
            // Mock balance check
            (balanceService.getUserBalances as jest.Mock).mockResolvedValue([
                { currency: "USD", available: "200" }
            ]);

            // Mock Airtm eligibility
            (airtmUserClient.verifyUserEligibility as jest.Mock).mockResolvedValue(true);

            // Mock Supabase insert (Step 4)
            const mockWithdrawal = { id: "w-123", status: WithdrawalStatus.WITHDRAWAL_CREATED };
            const insertMock = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: mockWithdrawal, error: null })
                })
            });
            (supabase.from as jest.Mock).mockImplementation((table) => {
                if (table === 'withdrawals') {
                    return {
                        insert: insertMock,
                        select: jest.fn().mockReturnThis(),
                        update: jest.fn().mockReturnThis(),
                        eq: jest.fn().mockReturnThis(),
                        single: jest.fn().mockResolvedValue({
                            data: { ...mockWithdrawal, status: WithdrawalStatus.WITHDRAWAL_PENDING_VERIFICATION },
                            error: null
                        })
                    };
                }
                return { select: jest.fn().mockReturnThis() };
            });

            // Mock Hold Balance
            (balanceService.holdBalance as jest.Mock).mockResolvedValue({});

            const result = await withdrawalOrchestrator.initiateWithdrawal(userId, validAmount, currency, email);

            expect(result.status).toBe(WithdrawalStatus.WITHDRAWAL_PENDING_VERIFICATION);
            expect(balanceService.holdBalance).toHaveBeenCalledWith(
                userId, validAmount, currency, expect.objectContaining({ id: "w-123" }), expect.any(String)
            );
        });

        it("should fail if amount is below minimum", async () => {
            await expect(
                withdrawalOrchestrator.initiateWithdrawal(userId, 1, currency, email)
            ).rejects.toThrow(ValidationError);
        });

        it("should fail if amount is above maximum", async () => {
            await expect(
                withdrawalOrchestrator.initiateWithdrawal(userId, 600, currency, email)
            ).rejects.toThrow(ValidationError);
        });

        it("should fail if balance is insufficient", async () => {
            (balanceService.getUserBalances as jest.Mock).mockResolvedValue([
                { currency: "USD", available: "50" }
            ]);

            await expect(
                withdrawalOrchestrator.initiateWithdrawal(userId, 100, currency, email)
            ).rejects.toThrow(InsufficientFundsError);
        });

        it("should fail if user is not eligible on Airtm", async () => {
            (balanceService.getUserBalances as jest.Mock).mockResolvedValue([
                { currency: "USD", available: "200" }
            ]);
            (airtmUserClient.verifyUserEligibility as jest.Mock).mockResolvedValue(false);

            await expect(
                withdrawalOrchestrator.initiateWithdrawal(userId, 100, currency, email)
            ).rejects.toThrow(ValidationError);
        });

        it("should rollback status to FAILED if holdBalance fails", async () => {
            (balanceService.getUserBalances as jest.Mock).mockResolvedValue([
                { currency: "USD", available: "200" }
            ]);
            (airtmUserClient.verifyUserEligibility as jest.Mock).mockResolvedValue(true);

            const mockWithdrawal = { id: "w-123", status: WithdrawalStatus.WITHDRAWAL_CREATED };

            // Mock insert
            const insertChain = {
                select: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: mockWithdrawal, error: null })
                })
            };

            // Mock update for rollback
            const updateSpy = jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ error: null })
            });

            (supabase.from as jest.Mock).mockImplementation((table) => {
                if (table === 'withdrawals') {
                    return {
                        insert: jest.fn().mockReturnValue(insertChain),
                        update: updateSpy,
                        eq: jest.fn().mockReturnThis(),
                        select: jest.fn().mockReturnThis(),
                        single: jest.fn()
                    };
                }
                return {};
            });

            (balanceService.holdBalance as jest.Mock).mockRejectedValue(new Error("Hold failed"));

            await expect(
                withdrawalOrchestrator.initiateWithdrawal(userId, 100, currency, email)
            ).rejects.toThrow("Hold failed");

            // Verify rollback update
            expect(updateSpy).toHaveBeenCalledWith(
                expect.objectContaining({ status: WithdrawalStatus.FAILED })
            );
        });
    });
});
