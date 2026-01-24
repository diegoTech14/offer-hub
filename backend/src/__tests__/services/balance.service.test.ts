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
import { ValidationError, BadRequestError, InternalServerError } from '@/utils/AppError';

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