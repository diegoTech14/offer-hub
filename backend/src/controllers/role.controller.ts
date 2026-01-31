/**
 * @fileoverview Role controller handling role switching operations
 * @author Offer Hub Team
 */

import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@/types/auth.types";
import { becomeFreelancer, becomeClient } from "@/services/role.service";
import {
  NotFoundError,
  AuthorizationError,
  BadRequestError,
  AuthenticationError,
} from "@/utils/AppError";
import { buildSuccessResponse } from "@/utils/responseBuilder";
import { validateUUID } from "@/utils/validation";

/**
 * Handler for switching user to freelancer role
 * POST /api/users/:userId/become-freelancer
 *
 * Validates:
 * - User ID is provided and valid UUID
 * - User is authenticated
 * - Authenticated user matches the userId in params (users can only switch their own role)
 *
 * @param req - Express request with userId in params
 * @param res - Express response
 * @param next - Express next function for error handling
 */
export const becomeFreelancerHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { userId } = req.params;

    // Validate userId is provided
    if (!userId) {
      throw new BadRequestError("User ID is required", "REQUIRED_FIELD");
    }

    // Validate UUID format
    if (!validateUUID(String(userId))) {
      throw new BadRequestError("Invalid user ID format", "INVALID_UUID");
    }

    // Validate user is authenticated
    if (!authReq.user) {
      throw new AuthenticationError("Authentication required");
    }

    // Validate requester is the user being modified
    if (authReq.user.id !== userId) {
      throw new AuthorizationError(
        "Access denied. You can only switch your own role.",
        "FORBIDDEN",
      );
    }

    // Call service to update role
    const updatedUser = await becomeFreelancer(userId);

    // Return success response
    res
      .status(200)
      .json(
        buildSuccessResponse(
          updatedUser,
          "Role switched to freelancer successfully",
        ),
      );
  } catch (error) {
    next(error);
  }
};

/**
 * Handler for switching user to client role
 * POST /api/users/:userId/become-client
 *
 * Validates:
 * - User ID is provided and valid UUID
 * - User is authenticated
 * - Authenticated user matches the userId in params (users can only switch their own role)
 *
 * @param req - Express request with userId in params
 * @param res - Express response
 * @param next - Express next function for error handling
 */
export const becomeClientHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { userId } = req.params;

    // Validate userId is provided
    if (!userId) {
      throw new BadRequestError("User ID is required", "REQUIRED_FIELD");
    }

    // Validate UUID format
    if (!validateUUID(String(userId))) {
      throw new BadRequestError("Invalid user ID format", "INVALID_UUID");
    }

    // Validate user is authenticated
    if (!authReq.user) {
      throw new AuthenticationError("Authentication required");
    }

    // Validate requester is the user being modified
    if (authReq.user.id !== userId) {
      throw new AuthorizationError(
        "Access denied. You can only switch your own role.",
        "FORBIDDEN",
      );
    }

    // Call service to update role
    const updatedUser = await becomeClient(userId);

    // Return success response
    res
      .status(200)
      .json(
        buildSuccessResponse(
          updatedUser,
          "Role switched to client successfully",
        ),
      );
  } catch (error) {
    next(error);
  }
};
