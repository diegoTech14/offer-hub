/**
 * @fileoverview Wallet controller handling wallet operations
 * @author Offer Hub Team
 */

import { Response, NextFunction, Request } from "express";
import { AuthenticatedRequest } from "@/types/auth.types";
import {
  connectExternalWallet,
  disconnectWallet as disconnectWalletService,
  setPrimaryWallet as setPrimaryWalletService,
} from "@/services/wallet.service";
import {
  AppError,
  ValidationError,
  ConflictError,
  BadRequestError,
  mapSupabaseError,
} from "@/utils/AppError";
import {
  buildSuccessResponse,
  buildSuccessResponseWithoutData,
} from "@/utils/responseBuilder";
import { validateUUID } from "@/utils/validation";

/**
 * Connect an external wallet to the authenticated user
 * POST /api/v1/wallets/external
 */
export const connectExternalWalletHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { public_key, provider } = req.body;

    // Validate required fields
    if (!public_key || !provider) {
      throw new ValidationError("public_key and provider are required");
    }

    // Validate public_key format (basic check before service validation)
    if (
      typeof public_key !== "string" ||
      public_key.length !== 56 ||
      !public_key.startsWith("G")
    ) {
      throw new BadRequestError(
        "Invalid public key format. Must be 56 characters and start with G",
        "INVALID_PUBLIC_KEY_FORMAT",
      );
    }

    // Validate provider type
    if (typeof provider !== "string") {
      throw new ValidationError("provider must be a string");
    }

    // Get authenticated user ID
    if (!req.user || !req.user.id) {
      throw new AppError("User not authenticated", 401);
    }

    const userId = req.user.id;

    // Call service to connect wallet (includes Stellar SDK validation)
    const wallet = await connectExternalWallet(userId, public_key, provider);

    // Build response according to spec
    res.status(201).json(
      buildSuccessResponse(
        {
          id: wallet.id,
          public_key: wallet.address,
          type: wallet.type,
          provider: wallet.provider,
          is_primary: wallet.is_primary,
          created_at: wallet.created_at,
        },
        "External wallet connected successfully",
      ),
    );
  } catch (error: any) {
    // Handle specific error types
    if (error instanceof AppError) {
      // If it's a 409 conflict, ensure proper error type
      if (error.statusCode === 409) {
        return next(
          new ConflictError(
            "Wallet address already registered",
            "WALLET_ALREADY_EXISTS",
          ),
        );
      }
      return next(error);
    }

    // Handle Supabase errors
    if (error.code && error.message) {
      return next(mapSupabaseError(error));
    }

    next(error);
  }
};

/**
 * Disconnect (remove) an external wallet from the authenticated user's account
 * @route DELETE /api/v1/wallets/:id
 * @param req - Express request object with wallet ID in params
 * @param res - Express response object
 * @param next - Express next function
 */
export async function disconnectWallet(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Validate authenticated user
    if (!userId) {
      throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    }

    // Validate UUID format
    if (!id || !validateUUID(id as string)) {
      throw new BadRequestError("Invalid wallet ID format", "INVALID_UUID");
    }

    // Call service to disconnect wallet
    await disconnectWalletService(id as string, userId);

    return res
      .status(200)
      .json(
        buildSuccessResponseWithoutData("Wallet disconnected successfully"),
      );
  } catch (error) {
    next(error);
  }
}

/**
 * Set a wallet as the primary wallet for the authenticated user
 * @route PUT /api/v1/wallets/:id/primary
 * @param req - Express request object with wallet ID in params
 * @param res - Express response object
 * @param next - Express next function
 */
export async function setPrimaryWallet(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Validate authenticated user
    if (!userId) {
      throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    }

    // Validate UUID format
    if (!id || !validateUUID(id as string)) {
      throw new BadRequestError("Invalid wallet ID format", "INVALID_UUID");
    }

    // Call service to set primary wallet
    const wallet = await setPrimaryWalletService(id as string, userId);

    // Build response according to spec
    return res.status(200).json(
      buildSuccessResponse(
        {
          id: wallet.id,
          public_key: wallet.address,
          type: wallet.type,
          provider: wallet.provider,
          is_primary: wallet.is_primary,
          created_at: wallet.created_at,
        },
        "Primary wallet updated successfully",
      ),
    );
  } catch (error) {
    next(error);
  }
}
