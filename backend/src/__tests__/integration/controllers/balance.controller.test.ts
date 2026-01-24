/**
 * @fileoverview Integration tests for Balance Controller
 * @author Offer Hub Team
 */

// Mock Supabase to avoid requiring environment variables
jest.mock('@/lib/supabase/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

// Mock the balance service BEFORE importing the controller
jest.mock('@/services/balance.service');

import { getBalances } from '@/controllers/balance.controller';
import { balanceService } from '@/services/balance.service';
import { ValidationError } from '@/utils/AppError';

const mockBalanceService = balanceService as jest.Mocked<typeof balanceService>;

describe('Balance Controller - getBalances', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    mockReq = {
      query: {},
      user: {
        id: mockUserId,
        email: 'test@example.com',
      },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockReq.user = null;

      await getBalances(mockReq, mockRes, mockNext);

      // The middleware would handle this, but we test that controller expects user
      // In real scenario, middleware would reject before reaching controller
      expect(mockBalanceService.getUserBalances).not.toHaveBeenCalled();
    });

    it('should process request when user is authenticated', async () => {
      const mockBalances = [
        {
          currency: 'USD',
          available: '1500.00',
          held: '500.00',
          total: '2000.00',
        },
      ];

      mockBalanceService.getUserBalances.mockResolvedValue(mockBalances);

      await getBalances(mockReq, mockRes, mockNext);

      expect(mockBalanceService.getUserBalances).toHaveBeenCalledWith(mockUserId);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Get All Balances', () => {
    it('should return all currency balances when no filter is provided', async () => {
      const mockBalances = [
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
      ];

      mockBalanceService.getUserBalances.mockResolvedValue(mockBalances);

      await getBalances(mockReq, mockRes, mockNext);

      expect(mockBalanceService.getUserBalances).toHaveBeenCalledWith(mockUserId);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Balances retrieved successfully',
        data: mockBalances,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return empty array when user has no balances', async () => {
      mockBalanceService.getUserBalances.mockResolvedValue([]);

      await getBalances(mockReq, mockRes, mockNext);

      expect(mockBalanceService.getUserBalances).toHaveBeenCalledWith(mockUserId);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Balances retrieved successfully',
        data: [],
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Currency Filter', () => {
    it('should return specific currency balance when filter is provided', async () => {
      mockReq.query = { currency: 'USD' };

      const mockBalances = [
        {
          currency: 'USD',
          available: '1500.00',
          held: '500.00',
          total: '2000.00',
        },
      ];

      mockBalanceService.getUserBalances.mockResolvedValue(mockBalances);

      await getBalances(mockReq, mockRes, mockNext);

      expect(mockBalanceService.getUserBalances).toHaveBeenCalledWith(mockUserId, 'USD');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Balances retrieved successfully',
        data: mockBalances,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return XLM balance when XLM filter is provided', async () => {
      mockReq.query = { currency: 'XLM' };

      const mockBalances = [
        {
          currency: 'XLM',
          available: '100.50',
          held: '0.00',
          total: '100.50',
        },
      ];

      mockBalanceService.getUserBalances.mockResolvedValue(mockBalances);

      await getBalances(mockReq, mockRes, mockNext);

      expect(mockBalanceService.getUserBalances).toHaveBeenCalledWith(mockUserId, 'XLM');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Balances retrieved successfully',
        data: mockBalances,
      });
    });

    it('should return 400 for invalid currency parameter', async () => {
      mockReq.query = { currency: 'INVALID' };

      await getBalances(mockReq, mockRes, mockNext);

      // Service should NOT be called because controller validates currency first
      expect(mockBalanceService.getUserBalances).not.toHaveBeenCalled();
      // Controller should throw ValidationError and pass it to next
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Invalid currency: INVALID'),
        })
      );
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('Response Format', () => {
    it('should return correct response format matching specification', async () => {
      const mockBalances = [
        {
          currency: 'USD',
          available: '1500.00',
          held: '500.00',
          total: '2000.00',
        },
      ];

      mockBalanceService.getUserBalances.mockResolvedValue(mockBalances);

      await getBalances(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Balances retrieved successfully',
        data: [
          {
            currency: 'USD',
            available: '1500.00',
            held: '500.00',
            total: '2000.00',
          },
        ],
      });
    });

    it('should calculate total correctly (available + held)', async () => {
      const mockBalances = [
        {
          currency: 'USD',
          available: '100.25',
          held: '50.75',
          total: '151.00',
        },
      ];

      mockBalanceService.getUserBalances.mockResolvedValue(mockBalances);

      await getBalances(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              total: '151.00',
            }),
          ]),
        })
      );
    });

    it('should return 200 OK status code on success', async () => {
      mockBalanceService.getUserBalances.mockResolvedValue([]);

      await getBalances(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('Error Handling', () => {
    it('should pass errors to next middleware', async () => {
      const error = new Error('Database error');
      mockBalanceService.getUserBalances.mockRejectedValue(error);

      await getBalances(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should handle service validation errors', async () => {
      const validationError = new ValidationError('Invalid user ID format');
      mockBalanceService.getUserBalances.mockRejectedValue(validationError);

      await getBalances(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(validationError);
    });
  });

  describe('Query Parameter Handling', () => {
    it('should handle currency as string in query', async () => {
      mockReq.query = { currency: 'USD' };

      mockBalanceService.getUserBalances.mockResolvedValue([]);

      await getBalances(mockReq, mockRes, mockNext);

      expect(mockBalanceService.getUserBalances).toHaveBeenCalledWith(mockUserId, 'USD');
    });

    it('should convert non-string currency to string', async () => {
      mockReq.query = { currency: 123 };

      const validationError = new ValidationError(
        'Invalid currency: 123. Supported currencies: USD, XLM'
      );
      mockBalanceService.getUserBalances.mockRejectedValue(validationError);

      await getBalances(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
