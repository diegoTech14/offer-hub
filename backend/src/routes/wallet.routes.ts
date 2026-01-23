import { Router } from 'express';
import { connectExternalWalletHandler } from '@/controllers/wallet.controller';
import { verifyToken } from '@/middlewares/auth.middleware';

const router = Router();

/**
 * POST /api/v1/wallets/external
 * Connect an external Stellar wallet to the authenticated user
 * Requires: JWT authentication
 * Body: { public_key: string, provider: string }
 */
router.post('/external', verifyToken, connectExternalWalletHandler);

export default router;
