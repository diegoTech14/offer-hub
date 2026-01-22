import {
  Profile,
  CreateProfileDTO,
  UpdateProfileDTO,
  ProfileConstraints,
  isProfile,
  isCreateProfileDTO,
  isUpdateProfileDTO,
} from "../types/profile.types";

describe("Profile Types", () => {
  describe("Profile Interface", () => {
    it("should accept a valid profile object", () => {
      const validProfile: Profile = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        userId: "123e4567-e89b-12d3-a456-426614174001",
        displayName: "John Doe",
        bio: "Software developer with 5 years of experience",
        avatarUrl: "https://example.com/avatar.jpg",
        dateOfBirth: new Date("1990-01-01"),
        location: "San Francisco, CA",
        skills: ["JavaScript", "TypeScript", "React"],
        website: "https://johndoe.com",
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-15T00:00:00Z"),
      };

      expect(validProfile.id).toBeDefined();
      expect(validProfile.userId).toBeDefined();
      expect(validProfile.createdAt).toBeInstanceOf(Date);
      expect(validProfile.updatedAt).toBeInstanceOf(Date);
    });

    it("should accept a profile with null optional fields", () => {
      const profileWithNulls: Profile = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        userId: "123e4567-e89b-12d3-a456-426614174001",
        displayName: null,
        bio: null,
        avatarUrl: null,
        dateOfBirth: null,
        location: null,
        skills: [],
        website: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(profileWithNulls.displayName).toBeNull();
      expect(profileWithNulls.bio).toBeNull();
      expect(profileWithNulls.skills).toEqual([]);
    });
  });

  describe("CreateProfileDTO Interface", () => {
    it("should accept a valid create profile DTO with all fields", () => {
      const createDTO: CreateProfileDTO = {
        userId: "123e4567-e89b-12d3-a456-426614174001",
        displayName: "Jane Smith",
        bio: "Product designer passionate about UX",
        avatarUrl: "https://example.com/jane-avatar.jpg",
        dateOfBirth: new Date("1992-05-15"),
        location: "New York, NY",
        skills: ["Figma", "UI Design", "User Research"],
        website: "https://janesmith.design",
      };

      expect(createDTO.userId).toBeDefined();
      expect(createDTO.displayName).toBe("Jane Smith");
      expect(createDTO.skills?.length).toBe(3);
    });

    it("should accept a create profile DTO with only userId", () => {
      const minimalDTO: CreateProfileDTO = {
        userId: "123e4567-e89b-12d3-a456-426614174001",
      };

      expect(minimalDTO.userId).toBeDefined();
      expect(minimalDTO.displayName).toBeUndefined();
    });

    it("should not include auto-generated fields", () => {
      const createDTO: CreateProfileDTO = {
        userId: "123e4567-e89b-12d3-a456-426614174001",
        displayName: "Test User",
      };

      // TypeScript should prevent these properties at compile time
      // @ts-expect-error - id should not exist on CreateProfileDTO
      expect(createDTO.id).toBeUndefined();
      // @ts-expect-error - createdAt should not exist on CreateProfileDTO
      expect(createDTO.createdAt).toBeUndefined();
      // @ts-expect-error - updatedAt should not exist on CreateProfileDTO
      expect(createDTO.updatedAt).toBeUndefined();
    });
  });

  describe("UpdateProfileDTO Interface", () => {
    it("should accept partial updates", () => {
      const updateDTO: UpdateProfileDTO = {
        bio: "Updated bio text",
      };

      expect(updateDTO.bio).toBe("Updated bio text");
      expect(updateDTO.displayName).toBeUndefined();
    });

    it("should accept updates with multiple fields", () => {
      const updateDTO: UpdateProfileDTO = {
        displayName: "Updated Name",
        location: "Los Angeles, CA",
        skills: ["Python", "Django", "PostgreSQL"],
      };

      expect(updateDTO.displayName).toBe("Updated Name");
      expect(updateDTO.location).toBe("Los Angeles, CA");
      expect(updateDTO.skills?.length).toBe(3);
    });

    it("should accept null values to clear fields", () => {
      const updateDTO: UpdateProfileDTO = {
        bio: null,
        website: null,
      };

      expect(updateDTO.bio).toBeNull();
      expect(updateDTO.website).toBeNull();
    });

    it("should allow empty object for no updates", () => {
      const updateDTO: UpdateProfileDTO = {};

      expect(Object.keys(updateDTO).length).toBe(0);
    });
  });

  describe("ProfileConstraints", () => {
    it("should define correct constraint values", () => {
      expect(ProfileConstraints.DISPLAY_NAME_MAX_LENGTH).toBe(100);
      expect(ProfileConstraints.BIO_MAX_LENGTH).toBe(500);
      expect(ProfileConstraints.LOCATION_MAX_LENGTH).toBe(100);
      expect(ProfileConstraints.WEBSITE_MAX_LENGTH).toBe(255);
    });
  });

  describe("Type Guards", () => {
    describe("isProfile", () => {
      it("should return true for valid Profile object", () => {
        const validProfile = {
          id: "123e4567-e89b-12d3-a456-426614174000",
          userId: "123e4567-e89b-12d3-a456-426614174001",
          displayName: "Test User",
          bio: null,
          avatarUrl: null,
          dateOfBirth: new Date(),
          location: null,
          skills: ["skill1"],
          website: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(isProfile(validProfile)).toBe(true);
      });

      it("should return false for invalid Profile object", () => {
        const invalidProfile = {
          id: "123",
          userId: "456",
          // missing required fields
        };

        expect(isProfile(invalidProfile)).toBe(false);
      });

      it("should return false for null or undefined", () => {
        expect(isProfile(null)).toBe(false);
        expect(isProfile(undefined)).toBe(false);
      });
    });

    describe("isCreateProfileDTO", () => {
      it("should return true for valid CreateProfileDTO", () => {
        const validDTO = {
          userId: "123e4567-e89b-12d3-a456-426614174001",
          displayName: "Test",
        };

        expect(isCreateProfileDTO(validDTO)).toBe(true);
      });

      it("should return false for object without userId", () => {
        const invalidDTO = {
          displayName: "Test",
        };

        expect(isCreateProfileDTO(invalidDTO)).toBe(false);
      });
    });

    describe("isUpdateProfileDTO", () => {
      it("should return true for valid UpdateProfileDTO", () => {
        const validDTO = {
          bio: "Updated bio",
        };

        expect(isUpdateProfileDTO(validDTO)).toBe(true);
      });

      it("should return true for empty UpdateProfileDTO", () => {
        const emptyDTO = {};

        expect(isUpdateProfileDTO(emptyDTO)).toBe(true);
      });

      it("should return false for invalid types", () => {
        const invalidDTO = {
          bio: 123, // should be string
        };

        expect(isUpdateProfileDTO(invalidDTO)).toBe(false);
      });
    });
  });

  describe("Field Validation", () => {
    it("should validate bio length constraint", () => {
      const longBio = "a".repeat(501);
      const validBio = "a".repeat(500);
      const maxLength = ProfileConstraints.BIO_MAX_LENGTH;

      // Long bio should exceed the constraint
      expect(longBio.length).toBeGreaterThan(maxLength);
      expect(longBio.length).toBe(501);

      // Valid bio should be within the constraint
      expect(validBio.length).toBeLessThanOrEqual(maxLength);
      expect(validBio.length).toBe(500);
    });

    it("should validate display name length constraint", () => {
      const longName = "a".repeat(101);
      const validName = "a".repeat(100);
      const maxLength = ProfileConstraints.DISPLAY_NAME_MAX_LENGTH;

      expect(longName.length).toBeGreaterThan(maxLength);
      expect(validName.length).toBeLessThanOrEqual(maxLength);
    });

    it("should handle skills array", () => {
      const profile: CreateProfileDTO = {
        userId: "123",
        skills: ["JavaScript", "TypeScript", "Node.js"],
      };

      expect(Array.isArray(profile.skills)).toBe(true);
      expect(profile.skills?.length).toBe(3);
    });

    it("should handle empty skills array", () => {
      const profile: CreateProfileDTO = {
        userId: "123",
        skills: [],
      };

      expect(Array.isArray(profile.skills)).toBe(true);
      expect(profile.skills?.length).toBe(0);
    });
  });
});
