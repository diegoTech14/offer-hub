/**
 * @fileoverview Profile controller handling profile management operations
 * @author Offer Hub Team
 */

import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@/types/auth.types";
import { profileService } from "@/services/profile.service";
import { AppError, NotFoundError, ValidationError, BadRequestError, mapSupabaseError, AuthorizationError } from "@/utils/AppError";
import { buildSuccessResponse } from "@/utils/responseBuilder";
import {
  validateUUID,
  validateObject,
  validateStringLength,
} from "@/utils/validation";
import { PROFILE_UPDATE_SCHEMA, PROFILE_CREATION_SCHEMA } from "@/utils/validation";
import { UpdateProfileDTO } from "@/types/profile.types";

export const createProfileHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Validate user is authenticated
    if (!req.user) {
      throw new AuthorizationError("Authentication required", "UNAUTHORIZED");
    }

    const validationResult = validateObject(req.body, PROFILE_CREATION_SCHEMA);

    if (!validationResult.isValid) {
      throw new ValidationError(
        "Profile Details validation failed",
        validationResult.errors,
      );
    }

    const { display_name, bio, website, skills, date_of_birth, location } =
      req.body;

    // Create a new profile
    const profile = await profileService.createProfile({
      userId: req.user.id,
      displayName: display_name,
      bio,
      website,
      skills,
      dateOfBirth: date_of_birth,
      location,
    });

    // Return 201 with profile data
    res
      .status(201)
      .json(buildSuccessResponse(profile, "Profile created successfully"));
  } catch (error: any) {
    next(error);
  }
};

/**
 * Get profile by user ID handler
 * @route GET /api/profiles/:userId
 * @access Public
 */
export const getProfileHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;

    // Validate userId is provided
    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    // Ensure userId is a string (not an array)
    const userIdString = Array.isArray(userId) ? userId[0] : userId;

    // Validate userId is a valid UUID
    if (!validateUUID(userIdString)) {
      throw new BadRequestError("Invalid user ID format", "INVALID_UUID");
    }

    // Fetch profile from service
    const profile = await profileService.getProfileByUserId(userIdString);

    // Return 404 if profile not found
    if (!profile) {
      throw new NotFoundError("Profile not found", "PROFILE_NOT_FOUND");
    }

    // Return 200 with profile data
    res
      .status(200)
      .json(buildSuccessResponse(profile, "Profile retrieved successfully"));
  } catch (error: any) {
    // Handle Supabase errors
    if (error.code && error.message) {
      throw mapSupabaseError(error);
    }

    next(error);
  }
};

/**
 * Update profile handler
 * Validates requester owns the profile and updates it
 * @route PATCH /api/profiles/:userId
 */
export const updateProfileHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const userIdStr = Array.isArray(userId) ? userId[0] : userId;

    if (!userIdStr) {
      throw new ValidationError("User ID is required");
    }

    if (!validateUUID(userIdStr)) {
      throw new BadRequestError("Invalid user ID format", "INVALID_UUID");
    }

    // Validate requester owns the profile (userId matches authenticated user)
    if (!req.user || req.user.id !== userIdStr) {
      throw new AuthorizationError("Access denied. You can only update your own profile.", "UNAUTHORIZED_PROFILE_UPDATE");
    }

    // Validate update payload
    const updateData: UpdateProfileDTO = req.body;
    const validationResult = validateObject(updateData, PROFILE_UPDATE_SCHEMA);
    
    if (!validationResult.isValid) {
      throw new ValidationError("Profile validation failed", validationResult.errors);
    }

    // Update the profile
    const updatedProfile = await profileService.updateProfile(userIdStr, updateData);

    res.status(200).json(
      buildSuccessResponse(updatedProfile, "Profile updated successfully")
    );
  } catch (error: any) {
    // Handle Supabase errors
    if (error.code && error.message) {
      throw mapSupabaseError(error);
    }

    next(error);
  }
};
