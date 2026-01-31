/**
 * @fileoverview Unit tests for Profile Service
 * @author Offer Hub Team
 */

import { profileService } from "@/services/profile.service";
import { supabase } from "@/lib/supabase/supabase";
import { CreateProfileDTO } from "@/types/profile.types";
import { NotFoundError, BadRequestError, InternalServerError } from "@/utils/AppError";
import "dotenv/config";

// Mock Supabase
jest.mock("@/lib/supabase/supabase");

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe("ProfileService - getProfileByUserId", () => {
  const mockUserId = "123e4567-e89b-12d3-a456-426614174000";

  const mockProfileData = {
    id: "profile-123",
    user_id: mockUserId,
    display_name: "John Doe",
    bio: "Software Engineer",
    avatar_url: "https://example.com/avatar.jpg",
    date_of_birth: "1990-01-01",
    location: "San Francisco, CA",
    skills: ["JavaScript", "TypeScript", "React"],
    website: "https://example.com",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Successful profile retrieval", () => {
    it("should return profile data when profile exists", async () => {
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

      const result = await profileService.getProfileByUserId(mockUserId);

      expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
      expect(result).not.toBeNull();
      expect(result?.userId).toBe(mockUserId);
    });

    it("should return profile with null optional fields", async () => {
      const minimalProfile = {
        id: "profile-456",
        user_id: mockUserId,
        display_name: null,
        bio: null,
        avatar_url: null,
        date_of_birth: null,
        location: null,
        skills: [],
        website: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: minimalProfile,
              error: null,
            }),
          }),
        }),
      } as any);

      const result = await profileService.getProfileByUserId(mockUserId);

      expect(result).not.toBeNull();
      expect(result?.displayName).toBeNull();
    });
  });

  describe("Profile not found", () => {
    it("should return null when profile does not exist (PGRST116)", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: "PGRST116", message: "No rows found" },
            }),
          }),
        }),
      } as any);

      const result = await profileService.getProfileByUserId(mockUserId);

      expect(result).toBeNull();
    });

    it("should return null when data is null", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      } as any);

      const result = await profileService.getProfileByUserId(mockUserId);

      expect(result).toBeNull();
    });
  });

  describe("Database errors", () => {
    it("should throw error on database connection issues", async () => {
      const dbError = { code: "UNKNOWN", message: "Database connection failed" };
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: dbError,
            }),
          }),
        }),
      } as any);

      await expect(
        profileService.getProfileByUserId(mockUserId),
      ).rejects.toThrow("Failed to fetch profile: Database connection failed");
    });

    it("should throw error on unexpected database errors", async () => {
      const unexpectedError = { code: "UNKNOWN", message: "Unexpected error" };
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: unexpectedError,
            }),
          }),
        }),
      } as any);

      await expect(
        profileService.getProfileByUserId(mockUserId),
      ).rejects.toThrow("Failed to fetch profile: Unexpected error");
    });
  });
});

describe("ProfileService - updateProfile", () => {
  const mockUserId = "123e4567-e89b-12d3-a456-426614174000";
  const mockProfileId = "456e7890-e89b-12d3-a456-426614174001";

  const mockProfileData = {
    id: mockProfileId,
    user_id: mockUserId,
    display_name: "John Doe",
    bio: "Software developer",
    avatar_url: "https://example.com/avatar.jpg",
    date_of_birth: "1990-01-01",
    location: "San Francisco, CA",
    skills: ["JavaScript", "TypeScript"],
    website: "https://johndoe.com",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Successful profile update", () => {
    it("should update profile with valid data", async () => {
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
        display_name: "Jane Doe",
        bio: "Updated bio",
        updated_at: "2024-01-16T10:00:00Z",
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
        displayName: "Jane Doe",
        bio: "Updated bio",
      };

      const result = await profileService.updateProfile(mockUserId, updateData);

      expect(result.displayName).toBe("Jane Doe");
      expect(result.bio).toBe("Updated bio");
    });

    it("should handle empty strings by converting to null", async () => {
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
        updated_at: "2024-01-16T10:00:00Z",
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
        bio: "",
        website: "",
      };

      const result = await profileService.updateProfile(mockUserId, updateData);

      expect(result.bio).toBeNull();
      expect(result.website).toBeNull();
    });

    it("should update only provided fields", async () => {
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
        location: "New York, NY",
        updated_at: "2024-01-16T10:00:00Z",
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
        location: "New York, NY",
      };

      const result = await profileService.updateProfile(mockUserId, updateData);

      expect(result.location).toBe("New York, NY");
      expect(result.displayName).toBe("John Doe"); // Unchanged
    });
  });

  describe("Profile not found", () => {
    it("should throw NotFoundError when profile does not exist", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: "PGRST116", message: "No rows found" },
            }),
          }),
        }),
      } as any);

      const updateData = {
        bio: "Updated bio",
      };

      await expect(profileService.updateProfile(mockUserId, updateData))
        .rejects
        .toThrow(NotFoundError);
    });
  });

  describe("Protected fields", () => {
    it("should throw BadRequestError when trying to update userId", async () => {
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
        userId: "different-user-id",
        bio: "Updated bio",
      };

      await expect(profileService.updateProfile(mockUserId, updateData))
        .rejects
        .toThrow(BadRequestError);
    });

    it("should throw BadRequestError when trying to update id", async () => {
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
        id: "different-profile-id",
        bio: "Updated bio",
      };

      await expect(profileService.updateProfile(mockUserId, updateData))
        .rejects
        .toThrow(BadRequestError);
    });
  });

  describe("Database errors", () => {
    it("should throw InternalServerError on database update failure", async () => {
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
                error: { message: "Database connection failed" },
              }),
            }),
          }),
        }),
      } as any);

      const updateData = {
        bio: "Updated bio",
      };

      await expect(profileService.updateProfile(mockUserId, updateData))
        .rejects
        .toThrow(InternalServerError);
    });
  });
});

describe("ProfileService - createProfile", () => {
  const mockUserId = "123e4567-e89b-12d3-a456-426614174000";

  const mockCreateProfileDTO: CreateProfileDTO = {
    userId: mockUserId,
    displayName: "John Doe",
    bio: "Software engineer",
    website: "https://johndoe.com",
    skills: ["JavaScript", "TypeScript", "React"],
    dateOfBirth: new Date("1990-01-01"),
    location: "San Francisco, CA",
  };

  const mockProfileData = {
    id: "profile-123",
    user_id: mockUserId,
    display_name: "John Doe",
    bio: "Software engineer",
    website: "https://johndoe.com",
    skills: ["JavaScript", "TypeScript", "React"],
    date_of_birth: "1990-01-01",
    location: "San Francisco, CA",
    avatar_url: null,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Validate no existing profile for user", () => {
    it("should check if profile already exists for user", async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: "PGRST116" },
            }),
          }),
        }),
      } as any);

      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfileData,
              error: null,
            }),
          }),
        }),
      } as any);

      await profileService.createProfile(mockCreateProfileDTO);

      expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
    });

    it("should throw 409 error when profile already exists", async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { user_id: mockUserId },
              error: null,
            }),
          }),
        }),
      } as any);

      await expect(
        profileService.createProfile(mockCreateProfileDTO),
      ).rejects.toMatchObject({
        message: "Your profile has already been created",
        statusCode: 409,
      });
    });
  });

  describe("Insert record and return created profile", () => {
    it("should insert profile and return created record", async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: "PGRST116" },
            }),
          }),
        }),
      } as any);

      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfileData,
              error: null,
            }),
          }),
        }),
      } as any);

      const result = await profileService.createProfile(mockCreateProfileDTO);

      expect(result).not.toBeUndefined();
      if (result) {
        expect(result.userId).toBe(mockUserId);
      }
    });
  });
});
