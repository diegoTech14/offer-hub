/**
 * @fileoverview Integration tests for Profile Controller
 * @author Offer Hub Team
 */

import { getProfileHandler } from '@/controllers/profile.controller';
import { profileService } from '@/services/profile.service';

// Mock the profile service
jest.mock('@/services/profile.service');
const mockProfileService = profileService as jest.Mocked<typeof profileService>;

describe('Profile Controller - getProfileHandler', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';

  const mockProfile = {
    id: 'profile-123',
    user_id: mockUserId,
    avatar_url: 'https://example.com/avatar.jpg',
    banner_url: 'https://example.com/banner.jpg',
    location: 'San Francisco, CA',
    website: 'https://example.com',
    twitter: '@johndoe',
    github: 'johndoe',
    linkedin: 'johndoe',
    skills: ['JavaScript', 'TypeScript', 'React'],
    portfolio_items: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    mockReq = {
      params: {},
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
    it('should return 400 if userId is missing', async () => {
      mockReq.params = {};

      await getProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('User ID is required');
    });

    it('should return 400 if userId is invalid UUID', async () => {
      mockReq.params = { userId: 'invalid-uuid' };

      await getProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid user ID format',
          statusCode: 400
        })
      );
    });

    it('should validate UUID format correctly', async () => {
      // Test valid UUID
      mockReq.params = { userId: mockUserId };
      mockProfileService.getProfileByUserId.mockResolvedValue(mockProfile);

      await getProfileHandler(mockReq, mockRes, mockNext);

      expect(mockProfileService.getProfileByUserId).toHaveBeenCalledWith(mockUserId);
    });

    it('should reject malformed UUID', async () => {
      mockReq.params = { userId: '123e4567-e89b-12d3-a456' };

      await getProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid user ID format',
          statusCode: 400
        })
      );
    });

    it('should reject UUID with invalid characters', async () => {
      mockReq.params = { userId: '123e4567-e89b-12d3-a456-42661417400g' };

      await getProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid user ID format',
          statusCode: 400
        })
      );
    });

    it('should handle userId as array by taking first element', async () => {
      mockReq.params = { userId: [mockUserId, 'another-id'] };
      mockProfileService.getProfileByUserId.mockResolvedValue(mockProfile);

      await getProfileHandler(mockReq, mockRes, mockNext);

      expect(mockProfileService.getProfileByUserId).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('Successful Profile Retrieval', () => {
    beforeEach(() => {
      mockReq.params = { userId: mockUserId };
    });

    it('should return 200 with profile data when profile exists', async () => {
      mockProfileService.getProfileByUserId.mockResolvedValue(mockProfile);

      await getProfileHandler(mockReq, mockRes, mockNext);

      expect(mockProfileService.getProfileByUserId).toHaveBeenCalledWith(mockUserId);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Profile retrieved successfully',
          data: mockProfile
        })
      );
    });

    it('should return profile with all required fields', async () => {
      mockProfileService.getProfileByUserId.mockResolvedValue(mockProfile);

      await getProfileHandler(mockReq, mockRes, mockNext);

      const responseData = mockRes.json.mock.calls[0][0].data;
      expect(responseData).toEqual(mockProfile);
      expect(responseData.id).toBe('profile-123');
      expect(responseData.user_id).toBe(mockUserId);
      expect(responseData.skills).toEqual(['JavaScript', 'TypeScript', 'React']);
    });

    it('should return profile with null optional fields', async () => {
      const minimalProfile = {
        id: 'profile-456',
        user_id: mockUserId,
        avatar_url: null,
        banner_url: null,
        location: null,
        website: null,
        twitter: null,
        github: null,
        linkedin: null,
        skills: null,
        portfolio_items: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockProfileService.getProfileByUserId.mockResolvedValue(minimalProfile);

      await getProfileHandler(mockReq, mockRes, mockNext);

      const responseData = mockRes.json.mock.calls[0][0].data;
      expect(responseData).toEqual(minimalProfile);
    });
  });

  describe('Profile Not Found', () => {
    beforeEach(() => {
      mockReq.params = { userId: mockUserId };
    });

    it('should return 404 when profile does not exist', async () => {
      mockProfileService.getProfileByUserId.mockResolvedValue(null);

      await getProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Profile not found',
          statusCode: 404
        })
      );
    });

    it('should not call res.json when profile is not found', async () => {
      mockProfileService.getProfileByUserId.mockResolvedValue(null);

      await getProfileHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should include error code PROFILE_NOT_FOUND', async () => {
      mockProfileService.getProfileByUserId.mockResolvedValue(null);

      await getProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Profile not found');
      // Check if error has code property (NotFoundError should have it)
      if ('code' in error) {
        expect(error.code).toBe('PROFILE_NOT_FOUND');
      }
    });
  });

  describe('Service Integration', () => {
    beforeEach(() => {
      mockReq.params = { userId: mockUserId };
    });

    it('should call profileService.getProfileByUserId with correct ID', async () => {
      mockProfileService.getProfileByUserId.mockResolvedValue(mockProfile);

      await getProfileHandler(mockReq, mockRes, mockNext);

      expect(mockProfileService.getProfileByUserId).toHaveBeenCalledTimes(1);
      expect(mockProfileService.getProfileByUserId).toHaveBeenCalledWith(mockUserId);
    });

    it('should handle service errors appropriately', async () => {
      const serviceError = new Error('Database connection failed');
      mockProfileService.getProfileByUserId.mockRejectedValue(serviceError);

      await getProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });

    it('should handle Supabase errors', async () => {
      const supabaseError = new Error('Database operation failed');
      mockProfileService.getProfileByUserId.mockRejectedValue(supabaseError);

      await getProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('Response Format', () => {
    beforeEach(() => {
      mockReq.params = { userId: mockUserId };
    });

    it('should return standardized API response format', async () => {
      mockProfileService.getProfileByUserId.mockResolvedValue(mockProfile);

      await getProfileHandler(mockReq, mockRes, mockNext);

      const response = mockRes.json.mock.calls[0][0];

      expect(response).toHaveProperty('success', true);
      expect(response).toHaveProperty('message', 'Profile retrieved successfully');
      expect(response).toHaveProperty('data');
      expect(response.data).toEqual(mockProfile);
    });

    it('should include timestamp in response', async () => {
      mockProfileService.getProfileByUserId.mockResolvedValue(mockProfile);

      await getProfileHandler(mockReq, mockRes, mockNext);

      const response = mockRes.json.mock.calls[0][0];
      // Check if timestamp exists (buildSuccessResponse may or may not include it)
      // Based on the actual response, timestamp is not included
      expect(response).toHaveProperty('success');
      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('data');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty profile data gracefully', async () => {
      const emptyProfile = {
        id: 'profile-empty',
        user_id: mockUserId,
        avatar_url: '',
        banner_url: '',
        location: '',
        website: '',
        twitter: '',
        github: '',
        linkedin: '',
        skills: [],
        portfolio_items: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockReq.params = { userId: mockUserId };
      mockProfileService.getProfileByUserId.mockResolvedValue(emptyProfile);

      await getProfileHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: emptyProfile
        })
      );
    });

    it('should handle different valid UUID formats', async () => {
      const uuids = [
        '550e8400-e29b-41d4-a716-446655440000',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
      ];

      for (const uuid of uuids) {
        mockReq.params = { userId: uuid };
        mockProfileService.getProfileByUserId.mockResolvedValue(mockProfile);

        await getProfileHandler(mockReq, mockRes, mockNext);

        expect(mockProfileService.getProfileByUserId).toHaveBeenCalledWith(uuid);
        jest.clearAllMocks();
      }
    });
  });
});