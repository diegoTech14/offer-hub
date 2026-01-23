/**
 * @fileoverview Unit tests for Profile Service
 * @author Offer Hub Team
 */

import { profileService } from "@/services/profile.service";
import { supabase } from "@/lib/supabase/supabase";
import { CreateProfileDTO } from "@/types/profile.types";
import "dotenv/config";

// Mock Supabase
jest.mock("@/lib/supabase/supabase");
// Mock Supabase BEFORE importing anything else
jest.mock("@/lib/supabase/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe("ProfileService - getProfileByUserId", () => {
  const mockUserId = "123e4567-e89b-12d3-a456-426614174000";

  const mockProfileData = {
    id: "profile-123",
    userId: mockUserId,
    displayName: "John Doe",
    bio: "Software Engineer",
    avatarUrl: "https://example.com/avatar.jpg",
    dateOfBirth: new Date("1990-01-01"),
    location: "San Francisco, CA",
    skills: ["JavaScript", "TypeScript", "React"],
    website: "https://example.com",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
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
      expect(result).toEqual(mockProfileData);
    });

    it("should return profile with null optional fields", async () => {
      const minimalProfile = {
        id: "profile-456",
        userId: mockUserId,
        displayName: null,
        bio: null,
        avatarUrl: null,
        dateOfBirth: null,
        location: null,
        skills: [],
        website: null,
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-01T00:00:00Z"),
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

      expect(result).toEqual(minimalProfile);
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
      const dbError = new Error("Database connection failed");
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

    it("should handle PGRST116 error in catch block", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockRejectedValue({
              code: "PGRST116",
              message: "No rows found",
            }),
          }),
        }),
      } as any);

      const result = await profileService.getProfileByUserId(mockUserId);

      expect(result).toBeNull();
    });
  });

  describe("Query structure", () => {
    it("should query the correct table and fields", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockProfileData,
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any);

      await profileService.getProfileByUserId(mockUserId);

      expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
      expect(mockSelect).toHaveBeenCalledWith("*");
    });

    it("should filter by the correct user ID", async () => {
      const mockEq = jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: mockProfileData,
          error: null,
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: mockEq,
        }),
      } as any);

      await profileService.getProfileByUserId(mockUserId);

      expect(mockEq).toHaveBeenCalledWith("userId", mockUserId);
    });

    it("should call single() to fetch one record", async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: mockProfileData,
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      } as any);

      await profileService.getProfileByUserId(mockUserId);

      expect(mockSingle).toHaveBeenCalled();
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
    date_of_birth: new Date("1990-01-01"),
    location: "San Francisco, CA",
    avatar_url: null,
    created_at: new Date("2024-01-15T10:00:00Z"),
    updated_at: new Date("2024-01-15T10:00:00Z"),
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

      expect(result).toEqual(mockProfileData);
    });
  });
});
