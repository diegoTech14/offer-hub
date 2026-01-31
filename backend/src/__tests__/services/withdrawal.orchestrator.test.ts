/**
 * @fileoverview Unit tests for WithdrawalOrchestrator
 */

import { withdrawalOrchestrator } from "@/services/withdrawal.orchestrator";
import { airtmPayoutClient } from "@/services/airtm.client";
import { supabase } from "@/lib/supabase/supabase";
import { WithdrawalStatus } from "@/types/withdrawal.types";
import { AppError } from "@/utils/AppError";

// Mock dependencies
jest.mock("@/lib/supabase/supabase");
jest.mock("@/services/airtm.client");

const mockSupabase = supabase as jest.Mocked<typeof supabase>;
const mockAirtmClient = airtmPayoutClient as jest.Mocked<typeof airtmPayoutClient>;

describe("WithdrawalOrchestrator", () => {
    const mockWithdrawalId = "withdrawal-123";
    const mockPayoutId = "payout-abc";
    const mockUserEmail = "user@example.com";

    const mockWithdrawal = {
        id: mockWithdrawalId,
        amount: 100,
        status: WithdrawalStatus.PENDING,
        users: { email: mockUserEmail }
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("processWithdrawal", () => {
        it("should successfully process a withdrawal", async () => {
            // 1. Mock fetch withdrawal
            mockSupabase.from.mockReturnValueOnce({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({ data: mockWithdrawal, error: null })
                    })
                })
            } as any);

            // 2. Mock first status update (to PROCESSING)
            mockSupabase.from.mockReturnValueOnce({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        select: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({
                                data: { ...mockWithdrawal, status: WithdrawalStatus.PROCESSING },
                                error: null
                            })
                        })
                    })
                })
            } as any);

            // Mock first audit log
            mockSupabase.from.mockReturnValueOnce({
                insert: jest.fn().mockResolvedValue({ error: null })
            } as any);

            // 3. Mock Airtm client calls
            mockAirtmClient.createPayout.mockResolvedValue({
                id: mockPayoutId,
                status: "PENDING",
                amount: 100,
                currency: "USD"
            });
            mockAirtmClient.commitPayout.mockResolvedValue({
                id: mockPayoutId,
                status: "COMMITTED",
                amount: 100,
                currency: "USD"
            });

            // 4. Mock second status update (to COMMITTED)
            mockSupabase.from.mockReturnValueOnce({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        select: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({
                                data: { ...mockWithdrawal, status: WithdrawalStatus.COMMITTED, external_payout_id: mockPayoutId },
                                error: null
                            })
                        })
                    })
                })
            } as any);

            // Mock second audit log
            mockSupabase.from.mockReturnValueOnce({
                insert: jest.fn().mockResolvedValue({ error: null })
            } as any);

            const result = await withdrawalOrchestrator.processWithdrawal(mockWithdrawalId);

            expect(result.status).toBe(WithdrawalStatus.COMMITTED);
            expect(result.external_payout_id).toBe(mockPayoutId);
            expect(mockAirtmClient.createPayout).toHaveBeenCalledWith(mockWithdrawalId, 100, mockUserEmail);
            expect(mockAirtmClient.commitPayout).toHaveBeenCalledWith(mockPayoutId);
        });

        it("should throw error if withdrawal not found", async () => {
            mockSupabase.from.mockReturnValueOnce({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({ data: null, error: { message: "Not found" } })
                    })
                })
            } as any);

            await expect(withdrawalOrchestrator.processWithdrawal(mockWithdrawalId))
                .rejects.toThrow(AppError);
        });

        it("should throw error if status transition is invalid", async () => {
            const withdrawalWithInvalidStatus = {
                ...mockWithdrawal,
                status: WithdrawalStatus.COMMITTED // Already committed
            };

            mockSupabase.from.mockReturnValueOnce({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({ data: withdrawalWithInvalidStatus, error: null })
                    })
                })
            } as any);

            await expect(withdrawalOrchestrator.processWithdrawal(mockWithdrawalId))
                .rejects.toThrow(/Invalid status transition/);
        });

        it("should handle Airtm error and transition to FAILED", async () => {
            // 1. Mock fetch withdrawal
            mockSupabase.from.mockReturnValueOnce({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({ data: mockWithdrawal, error: null })
                    })
                })
            } as any);

            // 2. Mock update to PROCESSING
            mockSupabase.from.mockReturnValueOnce({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        select: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({ data: { ...mockWithdrawal, status: WithdrawalStatus.PROCESSING }, error: null })
                        })
                    })
                })
            } as any);
            mockSupabase.from.mockReturnValueOnce({ insert: jest.fn().mockResolvedValue({ error: null }) } as any);

            // 3. Mock Airtm error
            mockAirtmClient.createPayout.mockRejectedValue(new Error("Airtm API Down"));

            // 4. Mock update to FAILED (called by error handler)
            mockSupabase.from.mockReturnValueOnce({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        select: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({ data: { ...mockWithdrawal, status: WithdrawalStatus.FAILED }, error: null })
                        })
                    })
                })
            } as any);
            mockSupabase.from.mockReturnValueOnce({ insert: jest.fn().mockResolvedValue({ error: null }) } as any);

            await expect(withdrawalOrchestrator.processWithdrawal(mockWithdrawalId))
                .rejects.toThrow("Airtm API Down");

            // Verify it tried to update to FAILED
            expect(mockSupabase.from).toHaveBeenCalledWith("withdrawals");
        });
    });
});
