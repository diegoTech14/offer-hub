/**
 * @fileoverview Integration tests for Profile Controller
 * @author Offer Hub Team
 */

import {
  createProfileHandler,
  getProfileHandler,
  updateProfileHandler,
} from "@/controllers/profile.controller";
import { profileService } from "@/services/profile.service";
import { ValidationError, AppError, AuthorizationError, NotFoundError } from "@/utils/AppError";
import { validateObject } from "@/utils/validation";

// Mock the profile service
jest.mock("@/services/profile.service");
const mockProfileService = profileService as jest.Mocked<typeof profileService>;

// Mock validation
jest.mock("@/utils/validation");
const mockValidateObject = validateObject as jest.MockedFunction<
  typeof validateObject
>;

// Helper to create mock profile objects
const createMockProfile = (overrides: any = {}): any => ({
  id: "456e7890-e89b-12d3-a456-426614174001",
  userId: "123e4567-e89b-12d3-a456-426614174000",
  displayName: "John Doe",
  bio: "Software developer",
  avatarUrl: "https://example.com/avatar.jpg",
  dateOfBirth: new Date("1990-01-01"),
  location: "San Francisco, CA",
  skills: ["JavaScript", "TypeScript"],
  website: "https://johndoe.com",
  createdAt: new Date("2024-01-15T10:00:00Z"),
  updatedAt: new Date("2024-01-15T10:00:00Z"),
  ...overrides,
});

describe("Profile Controller - createProfileHandler", () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  const mockUserId = "123e4567-e89b-12d3-a456-426614174000";

  const mockProfile = {
    id: "profile-123",
    userId: mockUserId,
    displayName: "John Doe",
    bio: "Software engineer",
    website: "https://johndoe.com",
    skills: ["JavaScript", "TypeScript", "React"],
    dateOfBirth: new Date("1990-01-01"),
    location: "San Francisco, CA",
    avatarUrl: null,
    createdAt: new Date("2024-01-15T10:00:00Z"),
    updatedAt: new Date("2024-01-15T10:00:00Z"),
  };

  beforeEach(() => {
    mockReq = {
      body: {},
      user: { id: mockUserId },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe("Validate request body against CreateProfileDTO", () => {
    it("should validate request body using PROFILE_CREATION_SCHEMA", async () => {
      mockReq.body = {
        display_name: "John Doe",
        bio: "Software engineer",
      };

      mockValidateObject.mockReturnValue({
        isValid: true,
        errors: [],
      });

      mockProfileService.createProfile.mockResolvedValue(mockProfile as any);

      await createProfileHandler(mockReq, mockRes, mockNext);

      expect(mockValidateObject).toHaveBeenCalled();
    });

    it("should return 422 on validation error", async () => {
      mockReq.body = {
        display_name: "a".repeat(101),
      };

      const validationErrors = [
        {
          field: "display_name",
          code: "INVALID_DISPLAY_NAME_LENGTH",
          reason: "Display name must be between 1 and 100 characters",
          value: "a".repeat(101),
        },
      ];

      mockValidateObject.mockReturnValue({
        isValid: false,
        errors: validationErrors,
      });

      await createProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });

  describe("Return 201 on success", () => {
    it("should return 201 with profile data when profile is created", async () => {
      mockReq.body = {
        display_name: "John Doe",
        bio: "Software engineer",
      };

      mockValidateObject.mockReturnValue({
        isValid: true,
        errors: [],
      });

      mockProfileService.createProfile.mockResolvedValue(mockProfile as any);

      await createProfileHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Profile created successfully",
          data: mockProfile,
        }),
      );
    });
  });

  describe("Return 409 if profile exists", () => {
    it("should return 409 when profile already exists", async () => {
      mockReq.body = {
        display_name: "John Doe",
      };

      mockValidateObject.mockReturnValue({
        isValid: true,
        errors: [],
      });

      mockProfileService.createProfile.mockRejectedValue(
        new AppError("Your profile has already been created", 409),
      );

      await createProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Your profile has already been created",
          statusCode: 409,
        }),
      );
    });
  });
});

describe("Profile Controller - getProfileHandler", () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  const mockUserId = "123e4567-e89b-12d3-a456-426614174000";

  const mockProfile = {
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
    mockReq = {
      params: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe("Input Validation", () => {
    it("should return 400 if userId is missing", async () => {
      mockReq.params = {};

      await getProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("User ID is required");
    });

    it("should return 400 if userId is invalid UUID", async () => {
      mockReq.params = { userId: "invalid-uuid" };

      await getProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid user ID format",
          statusCode: 400,
        }),
      );
    });

    it("should validate UUID format correctly", async () => {
      mockReq.params = { userId: mockUserId };
      mockProfileService.getProfileByUserId.mockResolvedValue(mockProfile as any);

      await getProfileHandler(mockReq, mockRes, mockNext);

      expect(mockProfileService.getProfileByUserId).toHaveBeenCalledWith(
        mockUserId,
      );
    });

    it("should reject malformed UUID", async () => {
      mockReq.params = { userId: "123e4567-e89b-12d3-a456" };

      await getProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid user ID format",
          statusCode: 400,
        }),
      );
    });

    it("should handle userId as array by taking first element", async () => {
      mockReq.params = { userId: [mockUserId, "another-id"] };
      mockProfileService.getProfileByUserId.mockResolvedValue(mockProfile as any);

      await getProfileHandler(mockReq, mockRes, mockNext);

      expect(mockProfileService.getProfileByUserId).toHaveBeenCalledWith(
        mockUserId,
      );
    });
  });

  describe("Successful Profile Retrieval", () => {
    beforeEach(() => {
      mockReq.params = { userId: mockUserId };
    });

    it("should return 200 with profile data when profile exists", async () => {
      mockProfileService.getProfileByUserId.mockResolvedValue(mockProfile as any);

      await getProfileHandler(mockReq, mockRes, mockNext);

      expect(mockProfileService.getProfileByUserId).toHaveBeenCalledWith(
        mockUserId,
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Profile retrieved successfully",
          data: mockProfile,
        }),
      );
    });

    it("should return profile with all required fields", async () => {
      mockProfileService.getProfileByUserId.mockResolvedValue(mockProfile as any);

      await getProfileHandler(mockReq, mockRes, mockNext);

      const responseData = mockRes.json.mock.calls[0][0].data;
      expect(responseData).toEqual(mockProfile);
      expect(responseData.id).toBe("profile-123");
      expect(responseData.userId).toBe(mockUserId);
    });
  });

  describe("Profile Not Found", () => {
    beforeEach(() => {
      mockReq.params = { userId: mockUserId };
    });

    it("should return 404 when profile does not exist", async () => {
      mockProfileService.getProfileByUserId.mockResolvedValue(null);

      await getProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Profile not found",
          statusCode: 404,
        }),
      );
    });
  });
});

describe("Profile Controller - updateProfileHandler", () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  const mockUserId = "123e4567-e89b-12d3-a456-426614174000";

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

    jest.clearAllMocks();
  });

  describe("Input Validation", () => {
    it("should return 422 if userId is missing", async () => {
      mockReq.params = {};

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User ID is required",
        }),
      );
    });

    it("should return 400 if userId is invalid UUID", async () => {
      mockReq.params = { userId: "invalid-uuid" };

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid user ID format",
        }),
      );
    });

    it("should return 403 if user is not authenticated", async () => {
      mockReq.user = null;

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
        }),
      );
    });

    it("should return 403 if user tries to update another user profile", async () => {
      mockReq.user = { id: "different-user-id" };

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("Access denied"),
          statusCode: 403,
        }),
      );
    });
  });

  describe("Authorization Logic", () => {
    it("should allow user to update their own profile", async () => {
      mockReq.body = { bio: "Updated bio" };
      const mockUpdatedProfile = createMockProfile({
        bio: "Updated bio",
        updatedAt: new Date("2024-01-16T10:00:00Z"),
      });

      mockProfileService.updateProfile.mockResolvedValue(mockUpdatedProfile);

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockProfileService.updateProfile).toHaveBeenCalledWith(
        mockUserId,
        { bio: "Updated bio" },
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("Validation", () => {
    beforeEach(() => {
      mockReq.params = { userId: mockUserId };
      mockReq.user = { id: mockUserId };
    });

    it("should accept valid update data", async () => {
      mockReq.body = {
        displayName: "Jane Doe",
        bio: "Updated bio",
        location: "New York, NY",
      };

      const mockUpdatedProfile = createMockProfile({
        displayName: "Jane Doe",
        bio: "Updated bio",
        location: "New York, NY",
        updatedAt: new Date("2024-01-16T10:00:00Z"),
      });

      mockProfileService.updateProfile.mockResolvedValue(mockUpdatedProfile);

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockProfileService.updateProfile).toHaveBeenCalledWith(
        mockUserId,
        mockReq.body,
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe("Service Integration", () => {
    beforeEach(() => {
      mockReq.params = { userId: mockUserId };
      mockReq.user = { id: mockUserId };
      mockReq.body = { bio: "Updated bio" };
    });

    it("should return 200 with updated profile data on success", async () => {
      const mockUpdatedProfile = createMockProfile({
        bio: "Updated bio",
        updatedAt: new Date("2024-01-16T10:00:00Z"),
      });

      mockProfileService.updateProfile.mockResolvedValue(mockUpdatedProfile);

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Profile updated successfully",
          data: mockUpdatedProfile,
        }),
      );
    });

    it("should handle 404 when profile not found", async () => {
      const notFoundError = new NotFoundError("Profile not found", "PROFILE_NOT_FOUND");
      mockProfileService.updateProfile.mockRejectedValue(notFoundError);

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(notFoundError);
    });
  });
});
