/**
 * @fileoverview Wallet controller handling wallet operations
 * @author Offer Hub Team
 */

import { NextFunction, Request, Response } from "express";
import * as walletService from "@/services/wallet.service";
import { buildSuccessResponseWithoutData } from "@/utils/responseBuilder";
import { AppError } from "@/utils/AppError";

/**
 * Validate UUID format
 * @param id - String to validate as UUID
 * @returns Boolean indicating if valid UUID
 */
function isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
}

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
    next: NextFunction
) {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        // Validate authenticated user
        if (!userId) {
            throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
        }

        // Validate UUID format
        if (!id || !isValidUUID(id)) {
            throw new AppError('Invalid wallet ID format', 400, 'INVALID_UUID');
        }

        // Call service to disconnect wallet
        await walletService.disconnectWallet(id, userId);

        return res.status(200).json(
            buildSuccessResponseWithoutData('Wallet disconnected successfully')
        );
    } catch (error) {
        next(error);
    }
}
