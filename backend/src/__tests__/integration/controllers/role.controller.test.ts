// Mock Supabase before any imports that use it
jest.mock('@/lib/supabase/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Mock the role service
jest.mock('@/services/role.service');

import {
  becomeFreelancerHandler,
  becomeClientHandler,
} from '@/controllers/role.controller';
import { becomeFreelancer, becomeClient } from '@/services/role.service';
import { AuthorizationError, BadRequestError, NotFoundError, AuthenticationError } from '@/utils/AppError';
const mockBecomeFreelancer = becomeFreelancer as jest.MockedFunction<typeof becomeFreelancer>;
const mockBecomeClient = becomeClient as jest.MockedFunction<typeof becomeClient>;

// Helper to create mock user objects
const createMockUser = (overrides: any = {}): any => ({
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  username: 'testuser',
  name: 'Test User',
  bio: null,
  avatar_url: null,
  is_freelancer: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

describe('Role Controller', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    mockReq = {
      params: {},
      body: {},
      user: null,
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('becomeFreelancerHandler', () => {
    describe('Input Validation', () => {
      it('should return 400 if userId is missing', async () => {
        mockReq.params = {};

        await becomeFreelancerHandler(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'User ID is required',
            statusCode: 400,
          })
        );
      });

      it('should return 400 if userId is invalid UUID', async () => {
        mockReq.params = { userId: 'invalid-uuid' };

        await becomeFreelancerHandler(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Invalid user ID format',
            statusCode: 400,
          })
        );
      });

      it('should return 401 if user is not authenticated', async () => {
        mockReq.params = { userId: '123e4567-e89b-12d3-a456-426614174000' };
        mockReq.user = null;

        await becomeFreelancerHandler(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        const error = mockNext.mock.calls[0][0];
        expect(error).toBeInstanceOf(AuthenticationError);
        expect(error.message).toBe('Authentication required');
        expect(error.statusCode).toBe(401);
      });

      it('should return 403 if user tries to switch another user role', async () => {
        mockReq.params = { userId: '123e4567-e89b-12d3-a456-426614174000' };
        mockReq.user = { id: 'different-user-id' };

        await becomeFreelancerHandler(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Access denied. You can only switch your own role.',
            statusCode: 403,
          })
        );
      });
    });

    describe('Success Cases', () => {
      it('should successfully switch user to freelancer role', async () => {
        const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
        const mockUpdatedUser = createMockUser({
          id: mockUserId,
          is_freelancer: true,
          updated_at: '2024-01-02T00:00:00Z',
        });

        mockReq.params = { userId: mockUserId };
        mockReq.user = { id: mockUserId };

        mockBecomeFreelancer.mockResolvedValue(mockUpdatedUser);

        await becomeFreelancerHandler(mockReq, mockRes, mockNext);

        expect(mockBecomeFreelancer).toHaveBeenCalledWith(mockUserId);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            message: 'Role switched to freelancer successfully',
            data: mockUpdatedUser,
          })
        );
        expect(mockNext).not.toHaveBeenCalled();
      });
    });

    describe('Error Handling', () => {
      it('should handle NotFoundError from service', async () => {
        const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
        mockReq.params = { userId: mockUserId };
        mockReq.user = { id: mockUserId };

        mockBecomeFreelancer.mockRejectedValue(
          new NotFoundError('User not found', 'USER_NOT_FOUND')
        );

        await becomeFreelancerHandler(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'User not found',
            statusCode: 404,
          })
        );
      });

      it('should handle InternalServerError from service', async () => {
        const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
        mockReq.params = { userId: mockUserId };
        mockReq.user = { id: mockUserId };

        mockBecomeFreelancer.mockRejectedValue(
          new Error('Database connection failed')
        );

        await becomeFreelancerHandler(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });
    });
  });

  describe('becomeClientHandler', () => {
    describe('Input Validation', () => {
      it('should return 400 if userId is missing', async () => {
        mockReq.params = {};

        await becomeClientHandler(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'User ID is required',
            statusCode: 400,
          })
        );
      });

      it('should return 400 if userId is invalid UUID', async () => {
        mockReq.params = { userId: 'invalid-uuid' };

        await becomeClientHandler(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Invalid user ID format',
            statusCode: 400,
          })
        );
      });

      it('should return 401 if user is not authenticated', async () => {
        mockReq.params = { userId: '123e4567-e89b-12d3-a456-426614174000' };
        mockReq.user = null;

        await becomeClientHandler(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        const error = mockNext.mock.calls[0][0];
        expect(error).toBeInstanceOf(AuthenticationError);
        expect(error.message).toBe('Authentication required');
        expect(error.statusCode).toBe(401);
      });

      it('should return 403 if user tries to switch another user role', async () => {
        mockReq.params = { userId: '123e4567-e89b-12d3-a456-426614174000' };
        mockReq.user = { id: 'different-user-id' };

        await becomeClientHandler(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Access denied. You can only switch your own role.',
            statusCode: 403,
          })
        );
      });
    });

    describe('Success Cases', () => {
      it('should successfully switch user to client role', async () => {
        const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
        const mockUpdatedUser = createMockUser({
          id: mockUserId,
          is_freelancer: false,
          updated_at: '2024-01-02T00:00:00Z',
        });

        mockReq.params = { userId: mockUserId };
        mockReq.user = { id: mockUserId };

        mockBecomeClient.mockResolvedValue(mockUpdatedUser);

        await becomeClientHandler(mockReq, mockRes, mockNext);

        expect(mockBecomeClient).toHaveBeenCalledWith(mockUserId);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            message: 'Role switched to client successfully',
            data: mockUpdatedUser,
          })
        );
        expect(mockNext).not.toHaveBeenCalled();
      });
    });

    describe('Error Handling', () => {
      it('should handle NotFoundError from service', async () => {
        const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
        mockReq.params = { userId: mockUserId };
        mockReq.user = { id: mockUserId };

        mockBecomeClient.mockRejectedValue(
          new NotFoundError('User not found', 'USER_NOT_FOUND')
        );

        await becomeClientHandler(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'User not found',
            statusCode: 404,
          })
        );
      });

      it('should handle InternalServerError from service', async () => {
        const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
        mockReq.params = { userId: mockUserId };
        mockReq.user = { id: mockUserId };

        mockBecomeClient.mockRejectedValue(
          new Error('Database connection failed')
        );

        await becomeClientHandler(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });
    });
  });
});
