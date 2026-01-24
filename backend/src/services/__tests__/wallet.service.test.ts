import { getStellarBalance } from "../wallet.service";
import { Horizon } from "@stellar/stellar-sdk";
import { supabase } from "@/lib/supabase/supabase";

// Mock dependencies
jest.mock("@/lib/supabase/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock("@stellar/stellar-sdk", () => ({
  Horizon: {
    Server: jest.fn(),
  },
  Keypair: {
    random: jest.fn(),
  },
  StrKey: {
    isValidEd25519PublicKey: jest.fn(),
  },
}));

// Mock wallet.service helpers that interface with DB directly
// We need to spy on internal functions or mock the supabase calls they make
// Since getStellarBalance calls getWalletById, we can mock getWalletById if it was exported/easily mockable
// But here we are testing appropriate service integration, so let's mock the supabase response used by getWalletById

const mockedSupabase = supabase as jest.Mocked<typeof supabase>;
const MockHorizonServer = Horizon.Server as jest.Mock;

describe("WalletService - getStellarBalance", () => {
  const mockWalletId = "123e4567-e89b-12d3-a456-426614174000";
  const mockUserId = "user-uuid-123";
  const mockWalletAddress =
    "GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQRSTUV";

  const mockWallet = {
    id: mockWalletId,
    user_id: mockUserId,
    address: mockWalletAddress,
    type: "external",
    created_at: new Date().toISOString(),
  };

  const mockHorizonBalances = [
    { asset_type: "native", balance: "100.5000000" },
    {
      asset_type: "credit_alphanum4",
      asset_code: "USDC",
      asset_issuer: "ISSUER",
      balance: "50.0000000",
    },
  ];

  let mockLoadAccount: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup Horizon Mock
    mockLoadAccount = jest.fn();
    MockHorizonServer.mockImplementation(() => ({
      loadAccount: mockLoadAccount,
    }));

    // Setup Supabase Mock for getWalletById
    const mockFrom = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockWallet,
            error: null,
          }),
        }),
      }),
    });
    mockedSupabase.from = mockFrom as any;
  });

  it("should successfully fetch balance from Stellar Horizon", async () => {
    const testWalletId = "11111111-1111-1111-1111-111111111111";

    // Setup Supabase Mock for this specific call
    const mockFrom = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { ...mockWallet, id: testWalletId },
            error: null,
          }),
        }),
      }),
    });
    mockedSupabase.from = mockFrom as any;

    // Mock Horizon response
    mockLoadAccount.mockResolvedValue({
      balances: mockHorizonBalances,
    });

    const result = await getStellarBalance(testWalletId, mockUserId);

    expect(result.public_key).toBe(mockWalletAddress);
    expect(result.balances).toHaveLength(2);
    expect(result.balances[0].asset_code).toBe("XLM"); // native gets converted to XLM
    expect(result.balances[1].asset_code).toBe("USDC");

    expect(MockHorizonServer).toHaveBeenCalledWith(
      "https://horizon.stellar.org",
    );
    expect(mockLoadAccount).toHaveBeenCalledWith(mockWalletAddress);
  });

  it("should use cached data on subsequent calls", async () => {
    const testWalletId = "22222222-2222-2222-2222-222222222222";

    // Setup Supabase Mock
    const mockFrom = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { ...mockWallet, id: testWalletId },
            error: null,
          }),
        }),
      }),
    });
    mockedSupabase.from = mockFrom as any;

    mockLoadAccount.mockResolvedValue({
      balances: mockHorizonBalances,
    });

    // First call
    await getStellarBalance(testWalletId, mockUserId);

    // Second call
    const result = await getStellarBalance(testWalletId, mockUserId);

    // Verify Horizon was only called once
    expect(mockLoadAccount).toHaveBeenCalledTimes(1);
    expect(result.balances).toHaveLength(2);
  });

  it("should throw 403 if wallet belongs to another user", async () => {
    const testWalletId = "33333333-3333-3333-3333-333333333333";

    // Mock wallet returning different user_id
    const mockFrom = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { ...mockWallet, id: testWalletId, user_id: "other-user" },
            error: null,
          }),
        }),
      }),
    });
    mockedSupabase.from = mockFrom as any;

    await expect(getStellarBalance(testWalletId, mockUserId)).rejects.toThrow(
      "Access denied",
    );
  });

  it("should throw 404 if wallet does not exist", async () => {
    const testWalletId = "44444444-4444-4444-4444-444444444444";

    const mockFrom = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: "PGRST116" },
          }),
        }),
      }),
    });
    mockedSupabase.from = mockFrom as any;

    await expect(getStellarBalance(testWalletId, mockUserId)).rejects.toThrow(
      "Wallet not found",
    );
  });

  it("should throw 404 if Horizon returns Account Not Found", async () => {
    const error: any = new Error("Not Found");
    error.response = { status: 404 };
    mockLoadAccount.mockRejectedValue(error);

    // We need to bypass cache for this test to ensure it hits Horizon
    // Or we can use a different wallet ID
    const newWalletId = "999e4567-e89b-12d3-a456-426614174999";

    // Setup Supabase Mock for new wallet
    const mockFrom = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { ...mockWallet, id: newWalletId },
            error: null,
          }),
        }),
      }),
    });
    mockedSupabase.from = mockFrom as any;

    await expect(getStellarBalance(newWalletId, mockUserId)).rejects.toThrow(
      "Account not found on Stellar network",
    );
  });
});
