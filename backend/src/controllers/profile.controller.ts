/**
 * @fileoverview Profile controller handling profile operations
 * @author Offer Hub Team
 */

import { NextFunction, Request, Response } from "express";

import { PROFILE_CREATION_SCHEMA, validateObject } from "@/utils/validation";
import { profileService } from "@/services/profile.service";
import {
  NotFoundError,
  ValidationError,
  BadRequestError,
  mapSupabaseError,
} from "@/utils/AppError";
import { buildSuccessResponse } from "@/utils/responseBuilder";
import { validateUUID } from "@/utils/validation";

export const createProfileHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
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
