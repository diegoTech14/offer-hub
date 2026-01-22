import { profileService } from "@/services/profile.service";
import { supabase } from "@/lib/supabase/supabase";
import { CreateProfileDTO } from "@/types/profile.types";
import "dotenv/config";

// Mock Supabase
jest.mock("@/lib/supabase/supabase");

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

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
