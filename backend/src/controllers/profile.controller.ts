/**
 * @fileoverview Profile controller handling profile management operations
 * @author Offer Hub Team
 */

import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@/types/auth.types";
import { profileService } from "@/services/profile.service";
import { AppError, NotFoundError, ValidationError, BadRequestError, mapSupabaseError, AuthorizationError } from "@/utils/AppError";
import { buildSuccessResponse } from '../utils/responseBuilder';
import {
  validateUUID,
  validateObject,
  validateStringLength,
} from "@/utils/validation";
import { PROFILE_UPDATE_SCHEMA } from "@/utils/validation";
import { UpdateProfileDTO } from "@/types/profile.types";

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
