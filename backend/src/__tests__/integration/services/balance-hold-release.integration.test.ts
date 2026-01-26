/**
 * @fileoverview Integration tests for Balance Service - holdBalance and releaseBalance methods
 * @author Offer Hub Team
 */

// Mock Supabase to avoid requiring environment variables
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
import { ValidationError, BadRequestError, InternalServerError, InsufficientFundsError, BusinessLogicError } from '@/utils/AppError';

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('BalanceService - holdBalance Integration Tests', () => {
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockRef = { id: 'contract-123', type: 'contract' as const };

  const mockBalanceBefore = {
    id: 'bal-123',
    user_id: mockUserId,
    currency: 'USD',
    available: 100.00000000,
    held: 0.00000000,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockBalanceAfter = {
    ...mockBalanceBefore,
    available: 50.00000000,
    held: 50.00000000,
    updated_at: '2024-01-01T01:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Hold Operations', () => {
    it('should successfully hold available balance', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: mockBalanceAfter,
        error: null,
      });

      const result = await balanceService.holdBalance(
        mockUserId,
        50.00,
        'USD',
        mockRef,
        'Hold funds for contract'
      );

      expect(mockSupabase.rpc).toHaveBeenCalledWith('hold_balance', {
        p_user_id: mockUserId,
        p_amount: 50.00,
        p_currency: 'USD',
        p_ref_id: mockRef.id,
        p_ref_type: mockRef.type,
        p_description: 'Hold funds for contract',
      });

      expect(result).toEqual(mockBalanceAfter);
      expect(result.available).toBe(50.00000000);
      expect(result.held).toBe(50.00000000);
    });

    it('should handle contract reference type', async () => {
      const contractRef = { id: 'contract-456', type: 'contract' as const };
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: { ...mockBalanceAfter, available: 75.00000000, held: 25.00000000 },
        error: null,
      });

      const result = await balanceService.holdBalance(
        mockUserId,
        25.00,
        'USD',
        contractRef
      );

      expect(result.available).toBe(75.00000000);
      expect(result.held).toBe(25.00000000);
    });

    it('should handle escrow reference type', async () => {
      const escrowRef = { id: 'escrow-789', type: 'escrow' as const };
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: { ...mockBalanceAfter, available: 90.00000000, held: 10.00000000 },
        error: null,
      });

      const result = await balanceService.holdBalance(
        mockUserId,
        10.00,
        'USD',
        escrowRef,
        'Escrow hold'
      );

      expect(result.available).toBe(90.00000000);
      expect(result.held).toBe(10.00000000);
    });

    it('should work with XLM currency', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: {
          ...mockBalanceBefore,
          currency: 'XLM',
          available: 150.00000000,
          held: 50.00000000,
        },
        error: null,
      });

      const result = await balanceService.holdBalance(
        mockUserId,
        50.00,
        'XLM',
        mockRef
      );

      expect(result.currency).toBe('XLM');
      expect(result.available).toBe(150.00000000);
      expect(result.held).toBe(50.00000000);
    });

    it('should handle holding entire available balance', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: {
          ...mockBalanceBefore,
          available: 0.00000000,
          held: 100.00000000,
        },
        error: null,
      });

      const result = await balanceService.holdBalance(
        mockUserId,
        100.00,
        'USD',
        mockRef
      );

      expect(result.available).toBe(0.00000000);
      expect(result.held).toBe(100.00000000);
    });

    it('should handle small amounts', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: {
          ...mockBalanceBefore,
          available: 99.99000000,
          held: 0.01000000,
        },
        error: null,
      });

      const result = await balanceService.holdBalance(
        mockUserId,
        0.01,
        'USD',
        mockRef
      );

      expect(result.available).toBe(99.99000000);
      expect(result.held).toBe(0.01000000);
    });

    it('should handle large amounts', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: {
          ...mockBalanceBefore,
          available: 0.00000000,
          held: 10000.00000000,
        },
        error: null,
      });

      const result = await balanceService.holdBalance(
        mockUserId,
        10000.00,
        'USD',
        mockRef
      );

      expect(result.held).toBe(10000.00000000);
    });
  });

  describe('Error Handling - Insufficient Available Funds', () => {
    it('should throw InsufficientFundsError when available balance is insufficient', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: {
          message: 'Insufficient available balance: required 150, but only 100 available',
        },
      });

      await expect(
        balanceService.holdBalance(mockUserId, 150, 'USD', mockRef)
      ).rejects.toThrow(InsufficientFundsError);
    });

    it('should throw InsufficientFundsError when user has no balance record', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: {
          message: 'Insufficient available balance: user has no balance record for currency USD',
        },
      });

      await expect(
        balanceService.holdBalance(mockUserId, 50, 'USD', mockRef)
      ).rejects.toThrow(InsufficientFundsError);
    });

    it('should include correlation ID in error details', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: {
          message: 'Insufficient available balance: required 150, but only 100 available',
        },
      });

      try {
        await balanceService.holdBalance(mockUserId, 150, 'USD', mockRef);
        fail('Should have thrown InsufficientFundsError');
      } catch (error: any) {
        expect(error).toBeInstanceOf(InsufficientFundsError);
        expect(error.details.correlationId).toBeDefined();
      }
    });
  });

  describe('Error Handling - Validation', () => {
    it('should throw ValidationError for negative amount', async () => {
      await expect(
        balanceService.holdBalance(mockUserId, -10, 'USD', mockRef)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for zero amount', async () => {
      await expect(
        balanceService.holdBalance(mockUserId, 0, 'USD', mockRef)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw BadRequestError for invalid UUID', async () => {
      await expect(
        balanceService.holdBalance('invalid-uuid', 50, 'USD', mockRef)
      ).rejects.toThrow(BadRequestError);
    });

    it('should throw ValidationError for unsupported currency', async () => {
      await expect(
        balanceService.holdBalance(mockUserId, 50, 'EUR', mockRef)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid reference', async () => {
      const invalidRef = { id: '', type: 'contract' as const };
      await expect(
        balanceService.holdBalance(mockUserId, 50, 'USD', invalidRef)
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('Error Handling - RPC Failures', () => {
    it('should throw InternalServerError on database error', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Database connection error' },
      });

      await expect(
        balanceService.holdBalance(mockUserId, 50, 'USD', mockRef)
      ).rejects.toThrow(InternalServerError);
    });

    it('should throw InternalServerError when no data is returned', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(
        balanceService.holdBalance(mockUserId, 50, 'USD', mockRef)
      ).rejects.toThrow(InternalServerError);
    });

    it('should handle unexpected RPC errors', async () => {
      (mockSupabase.rpc as jest.Mock).mockRejectedValue(
        new Error('Unexpected database error')
      );

      await expect(
        balanceService.holdBalance(mockUserId, 50, 'USD', mockRef)
      ).rejects.toThrow(InternalServerError);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple concurrent hold operations', async () => {
      (mockSupabase.rpc as jest.Mock)
        .mockResolvedValueOnce({
          data: { ...mockBalanceAfter, available: 75.00000000, held: 25.00000000 },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { ...mockBalanceAfter, available: 50.00000000, held: 50.00000000 },
          error: null,
        });

      const [result1, result2] = await Promise.all([
        balanceService.holdBalance(mockUserId, 25, 'USD', { id: 'contract-1', type: 'contract' }),
        balanceService.holdBalance(mockUserId, 25, 'USD', { id: 'contract-2', type: 'contract' }),
      ]);

      expect(result1.held).toBe(25.00000000);
      expect(result2.held).toBe(50.00000000);
      expect(mockSupabase.rpc).toHaveBeenCalledTimes(2);
    });
  });
});

describe('BalanceService - releaseBalance Integration Tests', () => {
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockRef = { id: 'contract-123', type: 'contract' as const };

  const mockBalanceBefore = {
    id: 'bal-123',
    user_id: mockUserId,
    currency: 'USD',
    available: 50.00000000,
    held: 50.00000000,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockBalanceAfter = {
    ...mockBalanceBefore,
    available: 100.00000000,
    held: 0.00000000,
    updated_at: '2024-01-01T01:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Release Operations', () => {
    it('should successfully release held balance', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: mockBalanceAfter,
        error: null,
      });

      const result = await balanceService.releaseBalance(
        mockUserId,
        50.00,
        'USD',
        mockRef,
        'Release funds from cancelled contract'
      );

      expect(mockSupabase.rpc).toHaveBeenCalledWith('release_balance', {
        p_user_id: mockUserId,
        p_amount: 50.00,
        p_currency: 'USD',
        p_ref_id: mockRef.id,
        p_ref_type: mockRef.type,
        p_description: 'Release funds from cancelled contract',
      });

      expect(result).toEqual(mockBalanceAfter);
      expect(result.available).toBe(100.00000000);
      expect(result.held).toBe(0.00000000);
    });

    it('should handle contract reference type', async () => {
      const contractRef = { id: 'contract-456', type: 'contract' as const };
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: { ...mockBalanceAfter, available: 75.00000000, held: 25.00000000 },
        error: null,
      });

      const result = await balanceService.releaseBalance(
        mockUserId,
        25.00,
        'USD',
        contractRef
      );

      expect(result.available).toBe(75.00000000);
      expect(result.held).toBe(25.00000000);
    });

    it('should handle escrow reference type', async () => {
      const escrowRef = { id: 'escrow-789', type: 'escrow' as const };
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: { ...mockBalanceAfter, available: 60.00000000, held: 40.00000000 },
        error: null,
      });

      const result = await balanceService.releaseBalance(
        mockUserId,
        10.00,
        'USD',
        escrowRef,
        'Escrow release'
      );

      expect(result.available).toBe(60.00000000);
      expect(result.held).toBe(40.00000000);
    });

    it('should work with XLM currency', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: {
          ...mockBalanceBefore,
          currency: 'XLM',
          available: 150.00000000,
          held: 0.00000000,
        },
        error: null,
      });

      const result = await balanceService.releaseBalance(
        mockUserId,
        50.00,
        'XLM',
        mockRef
      );

      expect(result.currency).toBe('XLM');
      expect(result.available).toBe(150.00000000);
      expect(result.held).toBe(0.00000000);
    });

    it('should handle releasing entire held balance', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: {
          ...mockBalanceBefore,
          available: 100.00000000,
          held: 0.00000000,
        },
        error: null,
      });

      const result = await balanceService.releaseBalance(
        mockUserId,
        50.00,
        'USD',
        mockRef
      );

      expect(result.available).toBe(100.00000000);
      expect(result.held).toBe(0.00000000);
    });

    it('should handle small amounts', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: {
          ...mockBalanceBefore,
          available: 50.01000000,
          held: 49.99000000,
        },
        error: null,
      });

      const result = await balanceService.releaseBalance(
        mockUserId,
        0.01,
        'USD',
        mockRef
      );

      expect(result.available).toBe(50.01000000);
      expect(result.held).toBe(49.99000000);
    });

    it('should handle large amounts', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: {
          ...mockBalanceBefore,
          available: 10000.00000000,
          held: 0.00000000,
        },
        error: null,
      });

      const result = await balanceService.releaseBalance(
        mockUserId,
        10000.00,
        'USD',
        mockRef
      );

      expect(result.available).toBe(10000.00000000);
    });
  });

  describe('Error Handling - Insufficient Held Funds', () => {
    it('should throw BusinessLogicError when held balance is insufficient', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: {
          message: 'Insufficient held balance: required 150, but only 50 held',
        },
      });

      await expect(
        balanceService.releaseBalance(mockUserId, 150, 'USD', mockRef)
      ).rejects.toThrow(BusinessLogicError);
    });

    it('should throw BusinessLogicError when user has no balance record', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: {
          message: 'Insufficient held balance: user has no balance record for currency USD',
        },
      });

      await expect(
        balanceService.releaseBalance(mockUserId, 50, 'USD', mockRef)
      ).rejects.toThrow(BusinessLogicError);
    });

    it('should include error code in BusinessLogicError', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: {
          message: 'Insufficient held balance: required 150, but only 50 held',
        },
      });

      try {
        await balanceService.releaseBalance(mockUserId, 150, 'USD', mockRef);
        fail('Should have thrown BusinessLogicError');
      } catch (error: any) {
        expect(error).toBeInstanceOf(BusinessLogicError);
        expect(error.errorCode).toBe('INSUFFICIENT_HELD_FUNDS');
      }
    });
  });

  describe('Error Handling - Validation', () => {
    it('should throw ValidationError for negative amount', async () => {
      await expect(
        balanceService.releaseBalance(mockUserId, -10, 'USD', mockRef)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for zero amount', async () => {
      await expect(
        balanceService.releaseBalance(mockUserId, 0, 'USD', mockRef)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw BadRequestError for invalid UUID', async () => {
      await expect(
        balanceService.releaseBalance('invalid-uuid', 50, 'USD', mockRef)
      ).rejects.toThrow(BadRequestError);
    });

    it('should throw ValidationError for unsupported currency', async () => {
      await expect(
        balanceService.releaseBalance(mockUserId, 50, 'EUR', mockRef)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid reference', async () => {
      const invalidRef = { id: '', type: 'contract' as const };
      await expect(
        balanceService.releaseBalance(mockUserId, 50, 'USD', invalidRef)
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('Error Handling - RPC Failures', () => {
    it('should throw InternalServerError on database error', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Database connection error' },
      });

      await expect(
        balanceService.releaseBalance(mockUserId, 50, 'USD', mockRef)
      ).rejects.toThrow(InternalServerError);
    });

    it('should throw InternalServerError when no data is returned', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(
        balanceService.releaseBalance(mockUserId, 50, 'USD', mockRef)
      ).rejects.toThrow(InternalServerError);
    });

    it('should handle unexpected RPC errors', async () => {
      (mockSupabase.rpc as jest.Mock).mockRejectedValue(
        new Error('Unexpected database error')
      );

      await expect(
        balanceService.releaseBalance(mockUserId, 50, 'USD', mockRef)
      ).rejects.toThrow(InternalServerError);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple concurrent release operations', async () => {
      (mockSupabase.rpc as jest.Mock)
        .mockResolvedValueOnce({
          data: { ...mockBalanceAfter, available: 75.00000000, held: 25.00000000 },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { ...mockBalanceAfter, available: 100.00000000, held: 0.00000000 },
          error: null,
        });

      const [result1, result2] = await Promise.all([
        balanceService.releaseBalance(mockUserId, 25, 'USD', { id: 'contract-1', type: 'contract' }),
        balanceService.releaseBalance(mockUserId, 25, 'USD', { id: 'contract-2', type: 'contract' }),
      ]);

      expect(result1.available).toBe(75.00000000);
      expect(result2.available).toBe(100.00000000);
      expect(mockSupabase.rpc).toHaveBeenCalledTimes(2);
    });
  });

  describe('Hold and Release Workflow', () => {
    it('should handle sequential hold and release operations', async () => {
      // First hold funds
      (mockSupabase.rpc as jest.Mock).mockResolvedValueOnce({
        data: {
          id: 'bal-123',
          user_id: mockUserId,
          currency: 'USD',
          available: 50.00000000,
          held: 50.00000000,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T01:00:00Z',
        },
        error: null,
      });

      const holdResult = await balanceService.holdBalance(
        mockUserId,
        50.00,
        'USD',
        { id: 'contract-123', type: 'contract' }
      );

      expect(holdResult.available).toBe(50.00000000);
      expect(holdResult.held).toBe(50.00000000);

      // Then release funds
      (mockSupabase.rpc as jest.Mock).mockResolvedValueOnce({
        data: {
          id: 'bal-123',
          user_id: mockUserId,
          currency: 'USD',
          available: 100.00000000,
          held: 0.00000000,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T02:00:00Z',
        },
        error: null,
      });

      const releaseResult = await balanceService.releaseBalance(
        mockUserId,
        50.00,
        'USD',
        { id: 'contract-123', type: 'contract' }
      );

      expect(releaseResult.available).toBe(100.00000000);
      expect(releaseResult.held).toBe(0.00000000);
      expect(mockSupabase.rpc).toHaveBeenCalledTimes(2);
    });
  });
});
