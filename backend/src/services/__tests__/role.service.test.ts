import { becomeFreelancer, becomeClient } from '../role.service';
import { NotFoundError, InternalServerError } from '@/utils/AppError';

// Mock Supabase before importing the service
jest.mock('@/lib/supabase/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

import { supabase } from '@/lib/supabase/supabase';

const mockedSupabase = supabase as jest.Mocked<typeof supabase>;

describe('Role Service', () => {
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockUser = {
    id: mockUserId,
    email: 'test@example.com',
    username: 'testuser',
    name: 'Test User',
    bio: 'Test bio',
    avatar_url: null,
    is_freelancer: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('becomeFreelancer', () => {
    it('should successfully set is_freelancer to true', async () => {
      // Mock user existence check
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: mockUserId },
            error: null,
          }),
        }),
      });

      // Mock update operation
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                ...mockUser,
                is_freelancer: true,
                updated_at: '2024-01-02T00:00:00Z',
              },
              error: null,
            }),
          }),
        }),
      });

      mockedSupabase.from.mockReturnValueOnce({
        select: mockSelect,
      } as any);

      mockedSupabase.from.mockReturnValueOnce({
        update: mockUpdate,
      } as any);

      const result = await becomeFreelancer(mockUserId);

      expect(result.is_freelancer).toBe(true);
      expect(result.id).toBe(mockUserId);
      expect(mockedSupabase.from).toHaveBeenCalledWith('users');
    });

    it('should throw NotFoundError if user does not exist', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'User not found' },
          }),
        }),
      });

      mockedSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any);

      await expect(becomeFreelancer(mockUserId)).rejects.toThrow(NotFoundError);
      await expect(becomeFreelancer(mockUserId)).rejects.toThrow('User not found');
    });

    it('should throw NotFoundError for invalid UUID format', async () => {
      const invalidUserId = 'invalid-uuid';

      await expect(becomeFreelancer(invalidUserId)).rejects.toThrow(NotFoundError);
      await expect(becomeFreelancer(invalidUserId)).rejects.toThrow('User not found');
    });

    it('should throw InternalServerError if update fails', async () => {
      // Mock user existence check (success) - first call
      const mockSelect1 = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: mockUserId },
            error: null,
          }),
        }),
      });

      // Mock update operation (failure) - second call
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Update failed' },
            }),
          }),
        }),
      });

      mockedSupabase.from
        .mockReturnValueOnce({
          select: mockSelect1,
        } as any)
        .mockReturnValueOnce({
          update: mockUpdate,
        } as any);

      try {
        await becomeFreelancer(mockUserId);
        fail('Expected InternalServerError to be thrown');
      } catch (error: any) {
        expect(error).toBeInstanceOf(InternalServerError);
        expect(error.message).toContain('Failed to update user role');
      }
    });
  });

  describe('becomeClient', () => {
    it('should successfully set is_freelancer to false', async () => {
      // Mock user existence check
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: mockUserId },
            error: null,
          }),
        }),
      });

      // Mock update operation
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                ...mockUser,
                is_freelancer: false,
                updated_at: '2024-01-02T00:00:00Z',
              },
              error: null,
            }),
          }),
        }),
      });

      mockedSupabase.from.mockReturnValueOnce({
        select: mockSelect,
      } as any);

      mockedSupabase.from.mockReturnValueOnce({
        update: mockUpdate,
      } as any);

      const result = await becomeClient(mockUserId);

      expect(result.is_freelancer).toBe(false);
      expect(result.id).toBe(mockUserId);
      expect(mockedSupabase.from).toHaveBeenCalledWith('users');
    });

    it('should throw NotFoundError if user does not exist', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'User not found' },
          }),
        }),
      });

      mockedSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any);

      await expect(becomeClient(mockUserId)).rejects.toThrow(NotFoundError);
      await expect(becomeClient(mockUserId)).rejects.toThrow('User not found');
    });

    it('should throw NotFoundError for invalid UUID format', async () => {
      const invalidUserId = 'invalid-uuid';

      await expect(becomeClient(invalidUserId)).rejects.toThrow(NotFoundError);
      await expect(becomeClient(invalidUserId)).rejects.toThrow('User not found');
    });

    it('should throw InternalServerError if update fails', async () => {
      // Mock user existence check (success) - first call
      const mockSelect1 = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: mockUserId },
            error: null,
          }),
        }),
      });

      // Mock update operation (failure) - second call
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Update failed' },
            }),
          }),
        }),
      });

      mockedSupabase.from
        .mockReturnValueOnce({
          select: mockSelect1,
        } as any)
        .mockReturnValueOnce({
          update: mockUpdate,
        } as any);

      try {
        await becomeClient(mockUserId);
        fail('Expected InternalServerError to be thrown');
      } catch (error: any) {
        expect(error).toBeInstanceOf(InternalServerError);
        expect(error.message).toContain('Failed to update user role');
      }
    });
  });
});
