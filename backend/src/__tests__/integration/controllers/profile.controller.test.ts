import { createProfileHandler } from "@/controllers/profile.controller";
import { profileService } from "@/services/profile.service";
import { ValidationError, AppError } from "@/utils/AppError";

// Mock the profile service
jest.mock("@/services/profile.service");
const mockProfileService = profileService as jest.Mocked<typeof profileService>;

// Mock validation
jest.mock("@/utils/validation");
import { validateObject } from "@/utils/validation";
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
