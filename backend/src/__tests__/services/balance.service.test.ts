/**
 * @fileoverview Unit tests for Balance Service
 * @author Offer Hub Team
 */

// Mock dependencies
jest.mock('@/lib/supabase/supabase', () => ({
  supabase: {
    rpc: jest.fn(),
    from: jest.fn(),
  },
}));

jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn()
  }
}));

import { balanceService } from '@/services/balance.service';
import { supabase } from '@/lib/supabase/supabase';
import { logger } from '@/utils/logger';
import { ValidationError, BadRequestError, InternalServerError, BusinessLogicError } from '@/utils/AppError';

const mockSupabase = supabase as jest.Mocked<typeof supabase>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('BalanceService - creditAvailable', () => {
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockRef = { id: 'tx-123', type: 'topup' as const };

  const mockBalanceData = {
    id: 'bal-123',
    user_id: mockUserId,
    currency: 'USD',
    available: 150.00000000,
    held: 0.00000000,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call RPC and return updated balance on success', async () => {
    (mockSupabase.rpc as jest.Mock).mockResolvedValue({
      data: mockBalanceData,
      error: null,
    });

    const result = await balanceService.creditAvailable(
      mockUserId,
      50.00,
      'USD',
      mockRef,
      'Top up'
    );

    expect(mockSupabase.rpc).toHaveBeenCalledWith('credit_available_balance', {
      p_user_id: mockUserId,
      p_amount: 50.00,
      p_currency: 'USD',
      p_ref_id: mockRef.id,
      p_ref_type: mockRef.type,
      p_description: 'Top up',
    });

    expect(result).toEqual(mockBalanceData);
  });

  it('should throw ValidationError for non-positive amount', async () => {
    await expect(
      balanceService.creditAvailable(mockUserId, -10, 'USD', mockRef)
    ).rejects.toThrow(ValidationError);
    expect(mockSupabase.rpc).not.toHaveBeenCalled();
  });

  it('should throw BadRequestError for invalid UUID', async () => {
    await expect(
      balanceService.creditAvailable('bad-id', 50, 'USD', mockRef)
    ).rejects.toThrow(BadRequestError);
  });

  it('should throw InternalServerError on RPC failure', async () => {
    (mockSupabase.rpc as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: 'DB Error' },
    });

    await expect(
      balanceService.creditAvailable(mockUserId, 50, 'USD', mockRef)
    ).rejects.toThrow(InternalServerError);

    expect(mockLogger.error).toHaveBeenCalled();
  });
});

describe('BalanceService - getUserBalances', () => {
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';

  // Mock query builder chain
  const createMockQuery = (mockData: any[], mockError: any = null, hasCurrencyFilter: boolean = false) => {
    // Create the result object
    const result = {
      data: mockData,
      error: mockError,
    };

    // Track how many times eq is called
    let eqCallCount = 0;
    const expectedEqCalls = hasCurrencyFilter ? 2 : 1; // user_id + currency if filtered

    const mockQuery: any = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockImplementation((...args) => {
        eqCallCount++;
        // On the last eq call, return a Promise that resolves to the result
        if (eqCallCount === expectedEqCalls) {
          return Promise.resolve(result);
        }
        // Otherwise return the query builder for chaining
        return mockQuery;
      }),
    };

    return mockQuery;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all balances when no currency filter is provided', async () => {
    const mockBalances = [
      { currency: 'USD', available: 1500.00, held: 500.00 },
      { currency: 'XLM', available: 100.50, held: 0.00 },
    ];

    const mockQuery = createMockQuery(mockBalances);
    (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

    const result = await balanceService.getUserBalances(mockUserId);

    expect(mockSupabase.from).toHaveBeenCalledWith('balances');
    expect(mockQuery.select).toHaveBeenCalledWith('currency, available, held');
    expect(mockQuery.eq).toHaveBeenCalledWith('user_id', mockUserId);
    expect(result).toEqual([
      {
        currency: 'USD',
        available: '1500.00',
        held: '500.00',
        total: '2000.00',
      },
      {
        currency: 'XLM',
        available: '100.50',
        held: '0.00',
        total: '100.50',
      },
    ]);
  });

  it('should return filtered balance when currency is provided', async () => {
    const mockBalances = [
      { currency: 'USD', available: 1500.00, held: 500.00 },
    ];

    const mockQuery = createMockQuery(mockBalances, null, true);
    (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

    const result = await balanceService.getUserBalances(mockUserId, 'USD');

    expect(mockSupabase.from).toHaveBeenCalledWith('balances');
    expect(mockQuery.select).toHaveBeenCalledWith('currency, available, held');
    expect(mockQuery.eq).toHaveBeenCalledWith('user_id', mockUserId);
    expect(mockQuery.eq).toHaveBeenCalledWith('currency', 'USD');
    expect(result).toEqual([
      {
        currency: 'USD',
        available: '1500.00',
        held: '500.00',
        total: '2000.00',
      },
    ]);
  });

  it('should throw ValidationError for invalid currency', async () => {
    await expect(
      balanceService.getUserBalances(mockUserId, 'INVALID')
    ).rejects.toThrow(ValidationError);

    expect(mockSupabase.from).not.toHaveBeenCalled();
  });

  it('should return empty array when user has no balances', async () => {
    const mockQuery = createMockQuery([]);
    (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

    const result = await balanceService.getUserBalances(mockUserId);

    expect(result).toEqual([]);
  });

  it('should calculate total correctly (available + held)', async () => {
    const mockBalances = [
      { currency: 'USD', available: 100.25, held: 50.75 },
    ];

    const mockQuery = createMockQuery(mockBalances);
    (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

    const result = await balanceService.getUserBalances(mockUserId);

    expect(result[0].total).toBe('151.00');
  });

  it('should format amounts as strings with 2 decimal places', async () => {
    const mockBalances = [
      { currency: 'USD', available: 100.5, held: 25.123 },
    ];

    const mockQuery = createMockQuery(mockBalances);
    (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

    const result = await balanceService.getUserBalances(mockUserId);

    expect(typeof result[0].available).toBe('string');
    expect(typeof result[0].held).toBe('string');
    expect(typeof result[0].total).toBe('string');
    expect(result[0].available).toBe('100.50');
    expect(result[0].held).toBe('25.12');
  });

  it('should throw BadRequestError for invalid user ID format', async () => {
    await expect(
      balanceService.getUserBalances('invalid-uuid')
    ).rejects.toThrow(BadRequestError);

    expect(mockSupabase.from).not.toHaveBeenCalled();
  });

  it('should throw InternalServerError on database error', async () => {
    const mockError = { message: 'Database connection failed' };
    const mockQuery = createMockQuery([], mockError);
    (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

    await expect(
      balanceService.getUserBalances(mockUserId)
    ).rejects.toThrow(InternalServerError);

    expect(mockLogger.error).toHaveBeenCalled();
  });

  it('should handle zero values correctly', async () => {
    const mockBalances = [
      { currency: 'USD', available: 0, held: 0 },
    ];

    const mockQuery = createMockQuery(mockBalances);
    (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

    const result = await balanceService.getUserBalances(mockUserId);

    expect(result).toEqual([
      {
        currency: 'USD',
        available: '0.00',
        held: '0.00',
        total: '0.00',
      },
    ]);
  });

  it('should handle null values and convert to 0', async () => {
    const mockBalances = [
      { currency: 'USD', available: null, held: null },
    ];

    const mockQuery = createMockQuery(mockBalances);
    (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

    const result = await balanceService.getUserBalances(mockUserId);

    expect(result).toEqual([
      {
        currency: 'USD',
        available: '0.00',
        held: '0.00',
        total: '0.00',
      },
    ]);
  });
});

describe('BalanceService - settleBalance', () => {
  const mockFromUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockToUserId = '223e4567-e89b-12d3-a456-426614174001';
  const mockRef = { id: 'contract-123', type: 'contract' as const };

  const mockFromBalance = {
    id: 'bal-from-123',
    user_id: mockFromUserId,
    currency: 'USD',
    available: 1000.00,
    held: 500.00,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockToBalance = {
    id: 'bal-to-123',
    user_id: mockToUserId,
    currency: 'USD',
    available: 200.00,
    held: 0.00,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockSettleResponse = {
    fromBalance: {
      ...mockFromBalance,
      held: 400.00, // 500 - 100
    },
    toBalance: {
      ...mockToBalance,
      available: 300.00, // 200 + 100
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Path', () => {
    it('should successfully settle balance when both users have balance records', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: mockSettleResponse,
        error: null,
      });

      const result = await balanceService.settleBalance(
        mockFromUserId,
        mockToUserId,
        100.00,
        'USD',
        mockRef
      );

      expect(mockSupabase.rpc).toHaveBeenCalledWith('settle_balance', {
        p_from_user_id: mockFromUserId,
        p_to_user_id: mockToUserId,
        p_amount: 100.00,
        p_currency: 'USD',
        p_ref_id: mockRef.id,
        p_ref_type: mockRef.type,
        p_description: `Settlement for contract ${mockRef.id}`,
      });

      expect(result).toEqual(mockSettleResponse);
      expect(result.fromBalance.held).toBe(400.00);
      expect(result.toBalance.available).toBe(300.00);
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should successfully settle balance when toUser has no balance record (creates it)', async () => {
      const mockResponseWithNewBalance = {
        fromBalance: {
          ...mockFromBalance,
          held: 400.00,
        },
        toBalance: {
          id: 'bal-new-123',
          user_id: mockToUserId,
          currency: 'USD',
          available: 100.00,
          held: 0.00,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      };

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: mockResponseWithNewBalance,
        error: null,
      });

      const result = await balanceService.settleBalance(
        mockFromUserId,
        mockToUserId,
        100.00,
        'USD',
        mockRef
      );

      expect(result.toBalance.available).toBe(100.00);
      expect(result.toBalance.held).toBe(0.00);
    });

    it('should return both updated balance objects correctly', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: mockSettleResponse,
        error: null,
      });

      const result = await balanceService.settleBalance(
        mockFromUserId,
        mockToUserId,
        100.00,
        'USD',
        mockRef
      );

      expect(result).toHaveProperty('fromBalance');
      expect(result).toHaveProperty('toBalance');
      expect(result.fromBalance.user_id).toBe(mockFromUserId);
      expect(result.toBalance.user_id).toBe(mockToUserId);
    });
  });

  describe('Validation', () => {
    it('should throw ValidationError when amount <= 0', async () => {
      await expect(
        balanceService.settleBalance(mockFromUserId, mockToUserId, -10, 'USD', mockRef)
      ).rejects.toThrow(ValidationError);
      expect(mockSupabase.rpc).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when amount is 0', async () => {
      await expect(
        balanceService.settleBalance(mockFromUserId, mockToUserId, 0, 'USD', mockRef)
      ).rejects.toThrow(ValidationError);
      expect(mockSupabase.rpc).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError when fromUserId is invalid UUID', async () => {
      await expect(
        balanceService.settleBalance('invalid-uuid', mockToUserId, 100, 'USD', mockRef)
      ).rejects.toThrow(BadRequestError);
      expect(mockSupabase.rpc).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError when toUserId is invalid UUID', async () => {
      await expect(
        balanceService.settleBalance(mockFromUserId, 'invalid-uuid', 100, 'USD', mockRef)
      ).rejects.toThrow(BadRequestError);
      expect(mockSupabase.rpc).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when currency is not supported', async () => {
      await expect(
        balanceService.settleBalance(mockFromUserId, mockToUserId, 100, 'INVALID', mockRef)
      ).rejects.toThrow(ValidationError);
      expect(mockSupabase.rpc).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when reference.id is missing', async () => {
      await expect(
        balanceService.settleBalance(mockFromUserId, mockToUserId, 100, 'USD', { id: '', type: 'contract' })
      ).rejects.toThrow(ValidationError);
      expect(mockSupabase.rpc).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when reference.type is missing', async () => {
      await expect(
        balanceService.settleBalance(mockFromUserId, mockToUserId, 100, 'USD', { id: 'contract-123', type: '' as any })
      ).rejects.toThrow(ValidationError);
      expect(mockSupabase.rpc).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when fromUserId === toUserId (self-transfer)', async () => {
      await expect(
        balanceService.settleBalance(mockFromUserId, mockFromUserId, 100, 'USD', mockRef)
      ).rejects.toThrow(ValidationError);
      expect(mockSupabase.rpc).not.toHaveBeenCalled();
    });
  });

  describe('Business Logic', () => {
    it('should throw BusinessLogicError when fromUser has insufficient held balance', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Insufficient held balance: required 1000, but only 500 available' },
      });

      await expect(
        balanceService.settleBalance(mockFromUserId, mockToUserId, 1000, 'USD', mockRef)
      ).rejects.toThrow(BusinessLogicError);

      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should throw BusinessLogicError when fromUser held balance < amount', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Insufficient held balance: required 600, but only 500 available' },
      });

      await expect(
        balanceService.settleBalance(mockFromUserId, mockToUserId, 600, 'USD', mockRef)
      ).rejects.toThrow(BusinessLogicError);
    });

    it('should correctly decrement held balance from fromUser', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: {
          fromBalance: { ...mockFromBalance, held: 400.00 },
          toBalance: mockToBalance,
        },
        error: null,
      });

      const result = await balanceService.settleBalance(
        mockFromUserId,
        mockToUserId,
        100.00,
        'USD',
        mockRef
      );

      expect(result.fromBalance.held).toBe(400.00);
      expect(result.fromBalance.held).toBeLessThan(mockFromBalance.held);
    });

    it('should correctly increment available balance for toUser', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: {
          fromBalance: mockFromBalance,
          toBalance: { ...mockToBalance, available: 300.00 },
        },
        error: null,
      });

      const result = await balanceService.settleBalance(
        mockFromUserId,
        mockToUserId,
        100.00,
        'USD',
        mockRef
      );

      expect(result.toBalance.available).toBe(300.00);
      expect(result.toBalance.available).toBeGreaterThan(mockToBalance.available);
    });
  });

  describe('Error Handling', () => {
    it('should throw InternalServerError on RPC failure', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      });

      await expect(
        balanceService.settleBalance(mockFromUserId, mockToUserId, 100, 'USD', mockRef)
      ).rejects.toThrow(InternalServerError);

      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should throw InternalServerError when RPC returns no data', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(
        balanceService.settleBalance(mockFromUserId, mockToUserId, 100, 'USD', mockRef)
      ).rejects.toThrow(InternalServerError);
    });

    it('should throw InternalServerError when response structure is invalid', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: { fromBalance: null, toBalance: mockToBalance },
        error: null,
      });

      await expect(
        balanceService.settleBalance(mockFromUserId, mockToUserId, 100, 'USD', mockRef)
      ).rejects.toThrow(InternalServerError);
    });

    it('should log errors appropriately', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'RPC Error' },
      });

      await expect(
        balanceService.settleBalance(mockFromUserId, mockToUserId, 100, 'USD', mockRef)
      ).rejects.toThrow();

      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should log success with correlation ID', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: mockSettleResponse,
        error: null,
      });

      await balanceService.settleBalance(mockFromUserId, mockToUserId, 100, 'USD', mockRef);

      expect(mockLogger.info).toHaveBeenCalledTimes(2); // Start and success
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('[BalanceService] Starting settleBalance')
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('[BalanceService] Success')
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero held balance correctly', async () => {
      const zeroHeldBalance = {
        fromBalance: { ...mockFromBalance, held: 0.00 },
        toBalance: mockToBalance,
      };

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: zeroHeldBalance,
        error: null,
      });

      // This should fail validation in the RPC, but test the service handles it
      (mockSupabase.rpc as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: { message: 'Insufficient held balance: required 100, but only 0 available' },
      });

      await expect(
        balanceService.settleBalance(mockFromUserId, mockToUserId, 100, 'USD', mockRef)
      ).rejects.toThrow(BusinessLogicError);
    });

    it('should handle exact amount match (held === amount)', async () => {
      const exactMatchResponse = {
        fromBalance: { ...mockFromBalance, held: 0.00 },
        toBalance: { ...mockToBalance, available: 300.00 },
      };

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: exactMatchResponse,
        error: null,
      });

      const result = await balanceService.settleBalance(
        mockFromUserId,
        mockToUserId,
        500.00, // Exact match
        'USD',
        mockRef
      );

      expect(result.fromBalance.held).toBe(0.00);
      expect(result.toBalance.available).toBe(300.00);
    });

    it('should handle multiple currencies (USD, XLM)', async () => {
      const xlmResponse = {
        fromBalance: {
          ...mockFromBalance,
          currency: 'XLM',
          held: 400.00,
        },
        toBalance: {
          ...mockToBalance,
          currency: 'XLM',
          available: 300.00,
        },
      };

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: xlmResponse,
        error: null,
      });

      const result = await balanceService.settleBalance(
        mockFromUserId,
        mockToUserId,
        100.00,
        'XLM',
        mockRef
      );

      expect(result.fromBalance.currency).toBe('XLM');
      expect(result.toBalance.currency).toBe('XLM');
    });
  });
});