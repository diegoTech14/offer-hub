import { profileService } from '@/services/profile.service';
import { supabase } from '@/lib/supabase/supabase';
import { NotFoundError, BadRequestError, InternalServerError } from '@/utils/AppError';

// Mock Supabase
jest.mock('@/lib/supabase/supabase');

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('ProfileService - updateProfile', () => {
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockProfileId = '456e7890-e89b-12d3-a456-426614174001';

  const mockProfileData = {
    id: mockProfileId,
    user_id: mockUserId,
    display_name: 'John Doe',
    bio: 'Software developer',
    avatar_url: 'https://example.com/avatar.jpg',
    date_of_birth: '1990-01-01',
    location: 'San Francisco, CA',
    skills: ['JavaScript', 'TypeScript'],
    website: 'https://johndoe.com',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  };

  const expectedProfile = {
    id: mockProfileId,
    userId: mockUserId,
    displayName: 'John Doe',
    bio: 'Software developer',
    avatarUrl: 'https://example.com/avatar.jpg',
    dateOfBirth: new Date('1990-01-01'),
    location: 'San Francisco, CA',
    skills: ['JavaScript', 'TypeScript'],
    website: 'https://johndoe.com',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful profile update', () => {
    it('should update profile with valid data', async () => {
      // Mock getProfileByUserId
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfileData,
              error: null,
            }),
          }),
        }),
      } as any);

      // Mock update
      const updatedProfileData = {
        ...mockProfileData,
        display_name: 'Jane Doe',
        bio: 'Updated bio',
        updated_at: '2024-01-16T10:00:00Z',
      };

      mockSupabase.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: updatedProfileData,
                error: null,
              }),
            }),
          }),
        }),
      } as any);

      const updateData = {
        displayName: 'Jane Doe',
        bio: 'Updated bio',
      };

      const result = await profileService.updateProfile(mockUserId, updateData);

      expect(result.displayName).toBe('Jane Doe');
      expect(result.bio).toBe('Updated bio');
    });

    it('should handle empty strings by converting to null', async () => {
      // Mock getProfileByUserId
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfileData,
              error: null,
            }),
          }),
        }),
      } as any);

      // Mock update
      const updatedProfileData = {
        ...mockProfileData,
        bio: null,
        website: null,
        updated_at: '2024-01-16T10:00:00Z',
      };

      mockSupabase.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: updatedProfileData,
                error: null,
              }),
            }),
          }),
        }),
      } as any);

      const updateData = {
        bio: '',
        website: '',
      };

      const result = await profileService.updateProfile(mockUserId, updateData);

      expect(result.bio).toBeNull();
      expect(result.website).toBeNull();
    });

    it('should update only provided fields', async () => {
      // Mock getProfileByUserId
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfileData,
              error: null,
            }),
          }),
        }),
      } as any);

      // Mock update
      const updatedProfileData = {
        ...mockProfileData,
        location: 'New York, NY',
        updated_at: '2024-01-16T10:00:00Z',
      };

      mockSupabase.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: updatedProfileData,
                error: null,
              }),
            }),
          }),
        }),
      } as any);

      const updateData = {
        location: 'New York, NY',
      };

      const result = await profileService.updateProfile(mockUserId, updateData);

      expect(result.location).toBe('New York, NY');
      expect(result.displayName).toBe('John Doe'); // Unchanged
    });
  });

  describe('Profile not found', () => {
    it('should throw NotFoundError when profile does not exist', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'No rows found' },
            }),
          }),
        }),
      } as any);

      const updateData = {
        bio: 'Updated bio',
      };

      await expect(profileService.updateProfile(mockUserId, updateData))
        .rejects
        .toThrow(NotFoundError);
    });
  });

  describe('Protected fields', () => {
    it('should throw BadRequestError when trying to update userId', async () => {
      // Mock getProfileByUserId
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfileData,
              error: null,
            }),
          }),
        }),
      } as any);

      const updateData = {
        userId: 'different-user-id',
        bio: 'Updated bio',
      };

      await expect(profileService.updateProfile(mockUserId, updateData))
        .rejects
        .toThrow(BadRequestError);
    });

    it('should throw BadRequestError when trying to update id', async () => {
      // Mock getProfileByUserId
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfileData,
              error: null,
            }),
          }),
        }),
      } as any);

      const updateData = {
        id: 'different-profile-id',
        bio: 'Updated bio',
      };

      await expect(profileService.updateProfile(mockUserId, updateData))
        .rejects
        .toThrow(BadRequestError);
    });
  });

  describe('Database errors', () => {
    it('should throw InternalServerError on database update failure', async () => {
      // Mock getProfileByUserId
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfileData,
              error: null,
            }),
          }),
        }),
      } as any);

      // Mock update error
      mockSupabase.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database connection failed' },
              }),
            }),
          }),
        }),
      } as any);

      const updateData = {
        bio: 'Updated bio',
      };

      await expect(profileService.updateProfile(mockUserId, updateData))
        .rejects
        .toThrow(InternalServerError);
    });
  });
});
