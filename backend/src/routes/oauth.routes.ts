/**
 * @fileoverview OAuth routes
 * @author Offer Hub Team
 */

import { Router } from 'express';
import {
  initiateOAuth,
  handleOAuthCallback,
  linkOAuthAccount,
  unlinkOAuthAccount,
  getLinkedAccounts,
} from '@/controllers/oauth.controller';
import { validateOAuthProvider } from '@/middlewares/oauth.middleware';
import { authenticateToken } from '@/middlewares/auth.middleware';
import { authLimiter } from '@/middlewares/ratelimit.middleware';

const router = Router();

// OAuth initiation and callback (public routes)
router.get('/:provider', authLimiter, validateOAuthProvider, initiateOAuth);
router.get('/:provider/callback', authLimiter, validateOAuthProvider, handleOAuthCallback);
router.post('/:provider/callback', authLimiter, validateOAuthProvider, handleOAuthCallback); // For Apple form_post

// OAuth account management (protected routes)
router.post('/:provider/link', authLimiter, authenticateToken(), validateOAuthProvider, linkOAuthAccount);
router.delete('/:provider/unlink', authLimiter, authenticateToken(), validateOAuthProvider, unlinkOAuthAccount);
router.get('/accounts', authLimiter, authenticateToken(), getLinkedAccounts);

export default router;

