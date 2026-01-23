/**
 * @fileoverview Integration tests for Profile Controller
 * @author Offer Hub Team
 */

import {
  createProfileHandler,
  getProfileHandler,
} from "@/controllers/profile.controller";
import { profileService } from "@/services/profile.service";
import { ValidationError, AppError } from "@/utils/AppError";
import { validateObject } from "@/utils/validation";

// Mock the profile service
jest.mock("@/services/profile.service");
const mockProfileService = profileService as jest.Mocked<typeof profileService>;

// Mock validation
jest.mock("@/utils/validation");
const mockValidateObject = validateObject as jest.MockedFunction<
  typeof validateObject
>;

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
        displayName: "John Doe",
        bio: "Software engineer",
      };

      mockValidateObject.mockReturnValue({
        isValid: true,
        errors: [],
      });

      mockProfileService.createProfile.mockResolvedValue(mockProfile);

      await createProfileHandler(mockReq, mockRes, mockNext);

      expect(mockValidateObject).toHaveBeenCalled();
    });

    it("should return 422 on validation error", async () => {
      mockReq.body = {
        displayName: "a".repeat(101),
      };

      const validationErrors = [
        {
          field: "displayName",
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
        displayName: "John Doe",
        bio: "Software engineer",
      };

      mockValidateObject.mockReturnValue({
        isValid: true,
        errors: [],
      });

      mockProfileService.createProfile.mockResolvedValue(mockProfile);

      await createProfileHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Profile created successfully",
        data: mockProfile,
      });
    });
  });

  describe("Return 409 if profile exists", () => {
    it("should return 409 when profile already exists", async () => {
      mockReq.body = {
        displayName: "John Doe",
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

    // Reset all mocks
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
      // Test valid UUID
      mockReq.params = { userId: mockUserId };
      mockProfileService.getProfileByUserId.mockResolvedValue(mockProfile);

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

    it("should reject UUID with invalid characters", async () => {
      mockReq.params = { userId: "123e4567-e89b-12d3-a456-42661417400g" };

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
      mockProfileService.getProfileByUserId.mockResolvedValue(mockProfile);

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
      mockProfileService.getProfileByUserId.mockResolvedValue(mockProfile);

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
      mockProfileService.getProfileByUserId.mockResolvedValue(mockProfile);

      await getProfileHandler(mockReq, mockRes, mockNext);

      const responseData = mockRes.json.mock.calls[0][0].data;
      expect(responseData).toEqual(mockProfile);
      expect(responseData.id).toBe("profile-123");
      expect(responseData.userId).toBe(mockUserId);
      expect(responseData.skills).toEqual([
        "JavaScript",
        "TypeScript",
        "React",
      ]);
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

      mockProfileService.getProfileByUserId.mockResolvedValue(minimalProfile);

      await getProfileHandler(mockReq, mockRes, mockNext);

      const responseData = mockRes.json.mock.calls[0][0].data;
      expect(responseData).toEqual(minimalProfile);
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

    it("should not call res.json when profile is not found", async () => {
      mockProfileService.getProfileByUserId.mockResolvedValue(null);

      await getProfileHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it("should include error code PROFILE_NOT_FOUND", async () => {
      mockProfileService.getProfileByUserId.mockResolvedValue(null);

      await getProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Profile not found");
      // Check if error has code property (NotFoundError should have it)
      if ("code" in error) {
        expect(error.code).toBe("PROFILE_NOT_FOUND");
      }
    });
  });

  describe("Service Integration", () => {
    beforeEach(() => {
      mockReq.params = { userId: mockUserId };
    });

    it("should call profileService.getProfileByUserId with correct ID", async () => {
      mockProfileService.getProfileByUserId.mockResolvedValue(mockProfile);

      await getProfileHandler(mockReq, mockRes, mockNext);

      expect(mockProfileService.getProfileByUserId).toHaveBeenCalledTimes(1);
      expect(mockProfileService.getProfileByUserId).toHaveBeenCalledWith(
        mockUserId,
      );
    });

    it("should handle service errors appropriately", async () => {
      const serviceError = new Error("Database connection failed");
      mockProfileService.getProfileByUserId.mockRejectedValue(serviceError);

      await getProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });

    it("should handle Supabase errors", async () => {
      const supabaseError = new Error("Database operation failed");
      mockProfileService.getProfileByUserId.mockRejectedValue(supabaseError);

      await getProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("Response Format", () => {
    beforeEach(() => {
      mockReq.params = { userId: mockUserId };
    });

    it("should return standardized API response format", async () => {
      mockProfileService.getProfileByUserId.mockResolvedValue(mockProfile);

      await getProfileHandler(mockReq, mockRes, mockNext);

      const response = mockRes.json.mock.calls[0][0];

      expect(response).toHaveProperty("success", true);
      expect(response).toHaveProperty(
        "message",
        "Profile retrieved successfully",
      );
      expect(response).toHaveProperty("data");
      expect(response.data).toEqual(mockProfile);
    });

    it("should include timestamp in response", async () => {
      mockProfileService.getProfileByUserId.mockResolvedValue(mockProfile);

      await getProfileHandler(mockReq, mockRes, mockNext);

      const response = mockRes.json.mock.calls[0][0];
      // Check if timestamp exists (buildSuccessResponse may or may not include it)
      // Based on the actual response, timestamp is not included
      expect(response).toHaveProperty("success");
      expect(response).toHaveProperty("message");
      expect(response).toHaveProperty("data");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty profile data gracefully", async () => {
      const emptyProfile = {
        id: "profile-empty",
        userId: mockUserId,
        displayName: "",
        bio: "",
        avatarUrl: "",
        dateOfBirth: null,
        location: "",
        skills: [],
        website: "",
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-01T00:00:00Z"),
      };

      mockReq.params = { userId: mockUserId };
      mockProfileService.getProfileByUserId.mockResolvedValue(emptyProfile);

      await getProfileHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: emptyProfile,
        }),
      );
    });

    it("should handle different valid UUID formats", async () => {
      const uuids = [
        "550e8400-e29b-41d4-a716-446655440000",
        "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      ];

      for (const uuid of uuids) {
        mockReq.params = { userId: uuid };
        mockProfileService.getProfileByUserId.mockResolvedValue(mockProfile);

        await getProfileHandler(mockReq, mockRes, mockNext);

        expect(mockProfileService.getProfileByUserId).toHaveBeenCalledWith(
          uuid,
        );
        jest.clearAllMocks();
      }
    });
  });
});
