/**
 * @fileoverview Unit tests for Balance Service
 * @author Offer Hub Team
 */

// Mock dependencies
jest.mock('@/lib/supabase/supabase', () => ({
  supabase: {
    rpc: jest.fn(),
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