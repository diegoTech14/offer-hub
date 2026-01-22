/**
 * @fileoverview Profile controller handling profile retrieval operations
 * @author Offer Hub Team
 */

import { Request, Response, NextFunction } from "express";
import { profileService } from "@/services/profile.service";
import { NotFoundError, ValidationError, BadRequestError, mapSupabaseError } from "@/utils/AppError";
import { buildSuccessResponse } from "@/utils/responseBuilder";
import { validateUUID } from "@/utils/validation";

/**
 * Get profile by user ID handler
 * @route GET /api/profiles/:userId
 * @access Public
 */
export const getProfileHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    // Validate userId is provided
    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    // Validate userId is a valid UUID
    if (!validateUUID(userId)) {
      throw new BadRequestError("Invalid user ID format", "INVALID_UUID");
    }

    // Fetch profile from service
    const profile = await profileService.getProfileByUserId(userId);

    // Return 404 if profile not found
    if (!profile) {
      throw new NotFoundError("Profile not found", "PROFILE_NOT_FOUND");
    }

    // Return 200 with profile data
    res.status(200).json(
      buildSuccessResponse(profile, "Profile retrieved successfully")
    );
  } catch (error: any) {
    // Handle Supabase errors
    if (error.code && error.message) {
      throw mapSupabaseError(error);
    }

    next(error);
  }
};