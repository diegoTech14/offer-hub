/**
 * @fileoverview Unit tests for Withdrawal Service
 */

// Mock dependencies
jest.mock('@/lib/supabase/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

jest.mock('@/services/balance.service', () => ({
  balanceService: {
    releaseBalance: jest.fn(),
  },
}));

jest.mock('@/services/email.service', () => ({
  emailService: {
    sendWithdrawalRefundEmail: jest.fn(),
  },
}));

jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  },
}));

import { withdrawalService } from '@/services/withdrawal.service';
import { supabase } from '@/lib/supabase/supabase';
import { balanceService } from '@/services/balance.service';
import { emailService } from '@/services/email.service';
import { logger } from '@/utils/logger';
import {
  ValidationError,
  BadRequestError,
  BusinessLogicError,
} from '@/utils/AppError';
import { WithdrawalStatus } from '@/types/withdrawal.types';

const mockSupabase = supabase as jest.Mocked<typeof supabase>;
const mockBalanceService = balanceService as jest.Mocked<typeof balanceService>;
const mockEmailService = emailService as jest.Mocked<typeof emailService>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('WithdrawalService - cancelWithdrawal', () => {
  const mockWithdrawalId = '123e4567-e89b-12d3-a456-426614174000';
  const mockUserId ='223e4567-e89b-12d3-a456-426614174001';

  const mockWithdrawal = {
    id: mockWithdrawalId,
    user_id: mockUserId,
    amount: 100.00,
    currency: 'USD',
    status: WithdrawalStatus.CREATED,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const createMockQuery = (mockData: any, mockError: any = null) => {
    const mockQuery: any = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockData, error: mockError }),
      update: jest.fn().mockReturnThis(),
      insert: jest.fn().mockResolvedValue({ data: null, error: null }),
    };
    return mockQuery;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should successfully cancel withdrawal from CREATED status', async () => {
      const mockQuery = createMockQuery(mockWithdrawal);
      (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);
      
      const updatedWithdrawal = {
        ...mockWithdrawal,
        status: WithdrawalStatus.WITHDRAWAL_CANCELED,
        cancellation_reason: 'User requested cancellation',
      };
      mockQuery.single.mockResolvedValueOnce({ data: mockWithdrawal, error: null });
      mockQuery.single.mockResolvedValueOnce({ data: updatedWithdrawal, error: null });

      (mockBalanceService.releaseBalance as jest.Mock).mockResolvedValue({
        id: 'bal-123',
        user_id: mockUserId,
        currency: 'USD',
        available: 200.00,
        held: 0.00,
      });

      const result = await withdrawalService.cancelWithdrawal(
        mockWithdrawalId,
        'User requested cancellation'
      );

      expect(mockBalanceService.releaseBalance).toHaveBeenCalledWith(
        mockUserId,
        100.00,
        'USD',
        { id: mockWithdrawalId, type: 'withdrawal_cancel' },
        'User requested cancellation'
      );

      expect(result.status).toBe(WithdrawalStatus.WITHDRAWAL_CANCELED);
      expect(result.cancellation_reason).toBe('User requested cancellation');
    });

    it('should successfully cancel withdrawal from PENDING_VERIFICATION status', async () => {
      const pendingWithdrawal = {
        ...mockWithdrawal,
        status: WithdrawalStatus.PENDING_VERIFICATION,
      };

      const mockQuery = createMockQuery(pendingWithdrawal);
      (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValueOnce({ data: pendingWithdrawal, error: null });
      mockQuery.single.mockResolvedValueOnce({
        data: { ...pendingWithdrawal, status: WithdrawalStatus.WITHDRAWAL_CANCELED },
        error: null,
      });

      (mockBalanceService.releaseBalance as jest.Mock).mockResolvedValue({});

      const result = await withdrawalService.cancelWithdrawal(mockWithdrawalId);

      expect(result.status).toBe(WithdrawalStatus.WITHDRAWAL_CANCELED);
      expect(mockBalanceService.releaseBalance).toHaveBeenCalled();
    });

    it('should create audit log entry', async () => {
      const mockQuery = createMockQuery(mockWithdrawal);
      (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValueOnce({ data: mockWithdrawal, error: null });
      mockQuery.single.mockResolvedValueOnce({
        data: { ...mockWithdrawal, status: WithdrawalStatus.WITHDRAWAL_CANCELED },
        error: null,
      });

      (mockBalanceService.releaseBalance as jest.Mock).mockResolvedValue({});

      await withdrawalService.cancelWithdrawal(mockWithdrawalId, 'Test reason');

      // Verify audit log insert was called
      expect(mockSupabase.from).toHaveBeenCalledWith('withdrawal_audit_logs');
      expect(mockQuery.insert).toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    it('should throw BadRequestError for invalid withdrawal ID', async () => {
      await expect(
        withdrawalService.cancelWithdrawal('invalid-id')
      ).rejects.toThrow(BadRequestError);

      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError if withdrawal not found', async () => {
      const mockQuery = createMockQuery(null, { message: 'Not found' });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

      await expect(
        withdrawalService.cancelWithdrawal(mockWithdrawalId)
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe('State Transition Validation', () => {
    it('should throw BusinessLogicError when canceling from WITHDRAWAL_FAILED status', async () => {
      const failedWithdrawal = {
        ...mockWithdrawal,
        status: WithdrawalStatus.WITHDRAWAL_FAILED,
      };

      const mockQuery = createMockQuery(failedWithdrawal);
      (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

      await expect(
        withdrawalService.cancelWithdrawal(mockWithdrawalId)
      ).rejects.toThrow(BusinessLogicError);

      expect(mockBalanceService.releaseBalance).not.toHaveBeenCalled();
    });

    it('should throw BusinessLogicError when canceling from WITHDRAWAL_COMPLETED status', async () => {
      const completedWithdrawal = {
        ...mockWithdrawal,
        status: WithdrawalStatus.WITHDRAWAL_COMPLETED,
      };

      const mockQuery = createMockQuery(completedWithdrawal);
      (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

      await expect(
        withdrawalService.cancelWithdrawal(mockWithdrawalId)
      ).rejects.toThrow(BusinessLogicError);
    });

    it('should throw BusinessLogicError when canceling already canceled withdrawal', async () => {
      const canceledWithdrawal = {
        ...mockWithdrawal,
        status: WithdrawalStatus.WITHDRAWAL_CANCELED,
      };

      const mockQuery = createMockQuery(canceledWithdrawal);
      (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

      await expect(
        withdrawalService.cancelWithdrawal(mockWithdrawalId)
      ).rejects.toThrow(BusinessLogicError);
    });
  });
});

describe('WithdrawalService - refundWithdrawal', () => {
  const mockWithdrawalId = '123e4567-e89b-12d3-a456-426614174000';
  const mockUserId = '223e4567-e89b-12d3-a456-426614174001';

  const mockFailedWithdrawal = {
    id: mockWithdrawalId,
    user_id: mockUserId,
    amount: 250.00,
    currency: 'XLM',
    status: WithdrawalStatus.WITHDRAWAL_FAILED,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockUser = {
    id: mockUserId,
    email: 'test@example.com',
  };

  const createMockQuery = (mockData: any, mockError: any = null) => {
    const mockQuery: any = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockData, error: mockError }),
      update: jest.fn().mockReturnThis(),
      insert: jest.fn().mockResolvedValue({ data: null, error: null }),
    };
    return mockQuery;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should successfully refund failed withdrawal', async () => {
      // Create separate mocks for different from() calls in execution order
      const withdrawalQuery = createMockQuery(mockFailedWithdrawal);
      const updateQuery = createMockQuery(null);
      const auditQuery = createMockQuery(null);
      const userQuery = createMockQuery(mockUser);

      const refundedWithdrawal = {
        ...mockFailedWithdrawal,
        status: WithdrawalStatus.WITHDRAWAL_REFUNDED,
      };

      // Setup mock chain in execution order
      withdrawalQuery.single.mockResolvedValueOnce({ data: mockFailedWithdrawal, error: null });
      updateQuery.single.mockResolvedValueOnce({ data: refundedWithdrawal, error: null });
      userQuery.single.mockResolvedValueOnce({ data: mockUser, error: null });

      (mockSupabase.from as jest.Mock)
        .mockReturnValueOnce(withdrawalQuery) // 1. Fetch withdrawal
        .mockReturnValueOnce(updateQuery)     // 2. Update withdrawal  
        .mockReturnValueOnce(auditQuery)      // 3. Audit log
        .mockReturnValueOnce(userQuery);      // 4. Fetch user (for email)

      (mockBalanceService.releaseBalance as jest.Mock).mockResolvedValue({
        id: 'bal-123',
        user_id: mockUserId,
        currency: 'XLM',
        available: 300.00,
        held: 0.00,
      });

      (mockEmailService.sendWithdrawalRefundEmail as jest.Mock).mockResolvedValue(undefined);

      const result = await withdrawalService.refundWithdrawal(mockWithdrawalId);

      expect(mockBalanceService.releaseBalance).toHaveBeenCalledWith(
        mockUserId,
        250.00,
        'XLM',
        { id: mockWithdrawalId, type: 'withdrawal_refund' },
        'Withdrawal refund - Failed withdrawal'
      );

      expect(result.status).toBe(WithdrawalStatus.WITHDRAWAL_REFUNDED);
    });

    it('should send notification email', async () => {
      const withdrawalQuery = createMockQuery(mockFailedWithdrawal);
      const updateQuery = createMockQuery(null);
      const auditQuery = createMockQuery(null);
      const userQuery = createMockQuery(mockUser);

      const refundedWithdrawal = {
        ...mockFailedWithdrawal,
        status: WithdrawalStatus.WITHDRAWAL_REFUNDED,
      };

      withdrawalQuery.single.mockResolvedValueOnce({ data: mockFailedWithdrawal, error: null });
      updateQuery.single.mockResolvedValueOnce({ data: refundedWithdrawal, error: null });
      userQuery.single.mockResolvedValueOnce({ data: mockUser, error: null });

      (mockSupabase.from as jest.Mock)
        .mockReturnValueOnce(withdrawalQuery)
        .mockReturnValueOnce(updateQuery)
        .mockReturnValueOnce(auditQuery)
        .mockReturnValueOnce(userQuery);

      (mockBalanceService.releaseBalance as jest.Mock).mockResolvedValue({});
      (mockEmailService.sendWithdrawalRefundEmail as jest.Mock).mockResolvedValue(undefined);

      await withdrawalService.refundWithdrawal(mockWithdrawalId);

      expect(mockEmailService.sendWithdrawalRefundEmail).toHaveBeenCalledWith(
        'test@example.com',
        250.00,
        'XLM'
      );
    });

    it('should not fail if email sending fails', async () => {
      const withdrawalQuery = createMockQuery(mockFailedWithdrawal);
      const updateQuery = createMockQuery(null);
      const auditQuery = createMockQuery(null);
      const userQuery = createMockQuery(mockUser);

      const refundedWithdrawal = {
        ...mockFailedWithdrawal,
        status: WithdrawalStatus.WITHDRAWAL_REFUNDED,
      };

      withdrawalQuery.single.mockResolvedValueOnce({ data: mockFailedWithdrawal, error: null });
      updateQuery.single.mockResolvedValueOnce({ data: refundedWithdrawal, error: null });
      userQuery.single.mockResolvedValueOnce({ data: mockUser, error: null });

      (mockSupabase.from as jest.Mock)
        .mockReturnValueOnce(withdrawalQuery)
        .mockReturnValueOnce(updateQuery)
        .mockReturnValueOnce(auditQuery)
        .mockReturnValueOnce(userQuery);

      (mockBalanceService.releaseBalance as jest.Mock).mockResolvedValue({});
      (mockEmailService.sendWithdrawalRefundEmail as jest.Mock).mockRejectedValue(new Error('Email failed'));

      const result = await withdrawalService.refundWithdrawal(mockWithdrawalId);

      expect(result.status).toBe(WithdrawalStatus.WITHDRAWAL_REFUNDED);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should create audit log entry', async () => {
      const mockQuery = createMockQuery(mockFailedWithdrawal);
      (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

      mockQuery.single
        .mockResolvedValueOnce({ data: mockFailedWithdrawal, error: null })
        .mockResolvedValueOnce({ data: mockUser, error: null })
        .mockResolvedValueOnce({
          data: { ...mockFailedWithdrawal, status: WithdrawalStatus.WITHDRAWAL_REFUNDED },
          error: null,
        });

      (mockBalanceService.releaseBalance as jest.Mock).mockResolvedValue({});
      (mockEmailService.sendWithdrawalRefundEmail as jest.Mock).mockResolvedValue(undefined);

      await withdrawalService.refundWithdrawal(mockWithdrawalId);

      expect(mockSupabase.from).toHaveBeenCalledWith('withdrawal_audit_logs');
      expect(mockQuery.insert).toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    it('should throw BadRequestError for invalid withdrawal ID', async () => {
      await expect(
        withdrawalService.refundWithdrawal('invalid-id')
      ).rejects.toThrow(BadRequestError);

      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError if withdrawal not found', async () => {
      const mockQuery = createMockQuery(null, { message: 'Not found' });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

      await expect(
        withdrawalService.refundWithdrawal(mockWithdrawalId)
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe('State Transition Validation', () => {
    it('should throw BusinessLogicError when refunding from CREATED status', async () => {
      const createdWithdrawal = {
        ...mockFailedWithdrawal,
        status: WithdrawalStatus.CREATED,
      };

      const mockQuery = createMockQuery(createdWithdrawal);
      (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

      await expect(
        withdrawalService.refundWithdrawal(mockWithdrawalId)
      ).rejects.toThrow(BusinessLogicError);

      expect(mockBalanceService.releaseBalance).not.toHaveBeenCalled();
    });

    it('should throw BusinessLogicError when refunding from PENDING_VERIFICATION status', async () => {
      const pendingWithdrawal = {
        ...mockFailedWithdrawal,
        status: WithdrawalStatus.PENDING_VERIFICATION,
      };

      const mockQuery = createMockQuery(pendingWithdrawal);
      (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

      await expect(
        withdrawalService.refundWithdrawal(mockWithdrawalId)
      ).rejects.toThrow(BusinessLogicError);
    });

    it('should throw BusinessLogicError when refunding already refunded withdrawal', async () => {
      const refundedWithdrawal = {
        ...mockFailedWithdrawal,
        status: WithdrawalStatus.WITHDRAWAL_REFUNDED,
      };

      const mockQuery = createMockQuery(refundedWithdrawal);
      (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

      await expect(
        withdrawalService.refundWithdrawal(mockWithdrawalId)
      ).rejects.toThrow(BusinessLogicError);
    });

    it('should throw BusinessLogicError when refunding canceled withdrawal', async () => {
      const canceledWithdrawal = {
        ...mockFailedWithdrawal,
        status: WithdrawalStatus.WITHDRAWAL_CANCELED,
      };

      const mockQuery = createMockQuery(canceledWithdrawal);
      (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

      await expect(
        withdrawalService.refundWithdrawal(mockWithdrawalId)
      ).rejects.toThrow(BusinessLogicError);
    });
  });
});
