import { updateProfileHandler } from '@/controllers/profile.controller';
import { profileService } from '@/services/profile.service';
import { AppError, AuthorizationError, NotFoundError, ValidationError } from '@/utils/AppError';

// Mock the profile service
jest.mock('@/services/profile.service');
const mockProfileService = profileService as jest.Mocked<typeof profileService>;

// Helper to create mock profile objects
const createMockProfile = (overrides: any = {}): any => ({
  id: '456e7890-e89b-12d3-a456-426614174001',
  userId: '123e4567-e89b-12d3-a456-426614174000',
  displayName: 'John Doe',
  bio: 'Software developer',
  avatarUrl: 'https://example.com/avatar.jpg',
  dateOfBirth: new Date('1990-01-01'),
  location: 'San Francisco, CA',
  skills: ['JavaScript', 'TypeScript'],
  website: 'https://johndoe.com',
  createdAt: new Date('2024-01-15T10:00:00Z'),
  updatedAt: new Date('2024-01-15T10:00:00Z'),
  ...overrides,
});

describe('Profile Controller - updateProfileHandler', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    mockReq = {
      params: { userId: mockUserId },
      body: {},
      user: { id: mockUserId },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Input Validation', () => {
    it('should return 422 if userId is missing', async () => {
      mockReq.params = {};

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User ID is required',
        })
      );
    });

    it('should return 400 if userId is invalid UUID', async () => {
      mockReq.params = { userId: 'invalid-uuid' };

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid user ID format',
        })
      );
    });

    it('should return 403 if user is not authenticated', async () => {
      mockReq.user = null;

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
        })
      );
    });

    it('should return 403 if user tries to update another user profile', async () => {
      mockReq.user = { id: 'different-user-id' };

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Access denied'),
          statusCode: 403,
        })
      );
    });
  });

  describe('Authorization Logic', () => {
    it('should allow user to update their own profile', async () => {
      mockReq.body = { bio: 'Updated bio' };
      const mockUpdatedProfile = createMockProfile({
        bio: 'Updated bio',
        updatedAt: new Date('2024-01-16T10:00:00Z'),
      });

      mockProfileService.updateProfile.mockResolvedValue(mockUpdatedProfile);

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockProfileService.updateProfile).toHaveBeenCalledWith(
        mockUserId,
        { bio: 'Updated bio' }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject update when userId does not match authenticated user', async () => {
      mockReq.user = { id: 'different-user-id' };
      mockReq.body = { bio: 'Updated bio' };

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockProfileService.updateProfile).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
        })
      );
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      mockReq.params = { userId: mockUserId };
      mockReq.user = { id: mockUserId };
    });

    it('should reject bio longer than 500 characters', async () => {
      mockReq.body = { bio: 'a'.repeat(501) };

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('validation failed'),
        })
      );
      expect(mockProfileService.updateProfile).not.toHaveBeenCalled();
    });

    it('should reject displayName longer than 100 characters', async () => {
      mockReq.body = { displayName: 'a'.repeat(101) };

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('validation failed'),
        })
      );
      expect(mockProfileService.updateProfile).not.toHaveBeenCalled();
    });

    it('should accept valid update data', async () => {
      mockReq.body = {
        displayName: 'Jane Doe',
        bio: 'Updated bio',
        location: 'New York, NY',
      };

      const mockUpdatedProfile = createMockProfile({
        displayName: 'Jane Doe',
        bio: 'Updated bio',
        location: 'New York, NY',
        updatedAt: new Date('2024-01-16T10:00:00Z'),
      });

      mockProfileService.updateProfile.mockResolvedValue(mockUpdatedProfile);

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockProfileService.updateProfile).toHaveBeenCalledWith(
        mockUserId,
        mockReq.body
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('Service Integration', () => {
    beforeEach(() => {
      mockReq.params = { userId: mockUserId };
      mockReq.user = { id: mockUserId };
      mockReq.body = { bio: 'Updated bio' };
    });

    it('should call profileService.updateProfile with correct parameters', async () => {
      const mockUpdatedProfile = createMockProfile({
        bio: 'Updated bio',
        updatedAt: new Date('2024-01-16T10:00:00Z'),
      });

      mockProfileService.updateProfile.mockResolvedValue(mockUpdatedProfile);

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockProfileService.updateProfile).toHaveBeenCalledWith(
        mockUserId,
        { bio: 'Updated bio' }
      );
      expect(mockProfileService.updateProfile).toHaveBeenCalledTimes(1);
    });

    it('should return 200 with updated profile data on success', async () => {
      const mockUpdatedProfile = createMockProfile({
        bio: 'Updated bio',
        updatedAt: new Date('2024-01-16T10:00:00Z'),
      });

      mockProfileService.updateProfile.mockResolvedValue(mockUpdatedProfile);

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Profile updated successfully',
          data: mockUpdatedProfile,
        })
      );
    });

    it('should handle 404 when profile not found', async () => {
      const notFoundError = new NotFoundError('Profile not found', 'PROFILE_NOT_FOUND');
      mockProfileService.updateProfile.mockRejectedValue(notFoundError);

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(notFoundError);
    });

    it('should handle 403 when unauthorized', async () => {
      const authError = new AuthorizationError('Access denied', 'UNAUTHORIZED');
      mockProfileService.updateProfile.mockRejectedValue(authError);

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(authError);
    });

    it('should handle service errors', async () => {
      const serviceError = new AppError('Database error', 500);
      mockProfileService.updateProfile.mockRejectedValue(serviceError);

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });

    it('should handle unexpected errors', async () => {
      const unexpectedError = new Error('Unexpected error');
      mockProfileService.updateProfile.mockRejectedValue(unexpectedError);

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(unexpectedError);
    });
  });

  describe('Success Scenarios', () => {
    beforeEach(() => {
      mockReq.params = { userId: mockUserId };
      mockReq.user = { id: mockUserId };
    });

    it('should successfully update profile with partial data', async () => {
      mockReq.body = { bio: 'New bio' };
      const mockUpdatedProfile = createMockProfile({
        bio: 'New bio',
        updatedAt: new Date('2024-01-16T10:00:00Z'),
      });

      mockProfileService.updateProfile.mockResolvedValue(mockUpdatedProfile);

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockUpdatedProfile,
        })
      );
    });

    it('should successfully update multiple fields', async () => {
      mockReq.body = {
        displayName: 'Jane Doe',
        bio: 'Updated bio',
        location: 'New York, NY',
        skills: ['Python', 'Django'],
      };

      const mockUpdatedProfile = createMockProfile({
        displayName: 'Jane Doe',
        bio: 'Updated bio',
        location: 'New York, NY',
        skills: ['Python', 'Django'],
        updatedAt: new Date('2024-01-16T10:00:00Z'),
      });

      mockProfileService.updateProfile.mockResolvedValue(mockUpdatedProfile);

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockUpdatedProfile,
        })
      );
    });
  });

  describe('Error Scenarios', () => {
    beforeEach(() => {
      mockReq.params = { userId: mockUserId };
      mockReq.user = { id: mockUserId };
      mockReq.body = { bio: 'Updated bio' };
    });

    it('should return 404 when profile not found', async () => {
      const notFoundError = new NotFoundError('Profile not found', 'PROFILE_NOT_FOUND');
      mockProfileService.updateProfile.mockRejectedValue(notFoundError);

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: 'Profile not found',
        })
      );
    });

    it('should return 403 when user tries to update another user profile', async () => {
      mockReq.user = { id: 'different-user-id' };

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: expect.stringContaining('Access denied'),
        })
      );
      expect(mockProfileService.updateProfile).not.toHaveBeenCalled();
    });
  });
});
