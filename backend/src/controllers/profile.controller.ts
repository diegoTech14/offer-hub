/**
 * @fileoverview Profile controller handling profile operations
 * @author Offer Hub Team
 */

import { NextFunction, Request, Response } from "express";

import { buildSuccessResponse } from "../utils/responseBuilder";
import { profileService } from "@/services/profile.service";
import { PROFILE_CREATION_SCHEMA, validateObject } from "@/utils/validation";
import { ValidationError } from "@/utils/AppError";

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
