/**
 * @fileoverview Wallet controller handling wallet operations
 * @author Offer Hub Team
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/types/auth.types';
import { connectExternalWallet } from '@/services/wallet.service';
import {
    AppError,
    ValidationError,
    ConflictError,
    BadRequestError,
    mapSupabaseError
} from '@/utils/AppError';
import { buildSuccessResponse } from '@/utils/responseBuilder';

/**
 * Connect an external wallet to the authenticated user
 * POST /api/v1/wallets/external
 */
export const connectExternalWalletHandler = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { public_key, provider } = req.body;

        // Validate required fields
        if (!public_key || !provider) {
            throw new ValidationError('public_key and provider are required');
        }

        // Validate public_key format (basic check before service validation)
        if (typeof public_key !== 'string' || public_key.length !== 56 || !public_key.startsWith('G')) {
            throw new BadRequestError(
                'Invalid public key format. Must be 56 characters and start with G',
                'INVALID_PUBLIC_KEY_FORMAT'
            );
        }

        // Validate provider type
        if (typeof provider !== 'string') {
            throw new ValidationError('provider must be a string');
        }

        // Get authenticated user ID
        if (!req.user || !req.user.id) {
            throw new AppError('User not authenticated', 401);
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
                'External wallet connected successfully'
            )
        );
    } catch (error: any) {
        // Handle specific error types
        if (error instanceof AppError) {
            // If it's a 409 conflict, ensure proper error type
            if (error.statusCode === 409) {
                return next(new ConflictError('Wallet address already registered', 'WALLET_ALREADY_EXISTS'));
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
