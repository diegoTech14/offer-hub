/**
 * @fileoverview OAuth controller - orchestration only
 * @author Offer Hub Team
 */

import { Request, Response, NextFunction } from 'express';
import { getOAuthService } from '@/services/oauth/oauth-factory.service';
import { OAuthProvider } from '@/types/oauth.types';
import { generateOAuthState } from '@/utils/oauth.utils';
import { supabase } from '@/lib/supabase/supabase';
import { AppError } from '@/utils/AppError';

/**
 * Initiate OAuth flow - redirects to provider
 */
export async function initiateOAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const provider = (req as any).oauthProvider as OAuthProvider;
    const redirectUrl = (req.query.redirect_url as string) || undefined;

    // Generate state for CSRF protection
    const state = generateOAuthState();

    // Store state in session or return in response
    // For now, we'll include it in the redirect URL
    const service = getOAuthService(provider);
    const authUrl = service.getAuthorizationUrl(state);

    // If redirectUrl is provided, append it to state
    if (redirectUrl) {
      const stateWithRedirect = `${state}:${Buffer.from(redirectUrl).toString('base64')}`;
      const authUrlWithState = service.getAuthorizationUrl(stateWithRedirect);
      res.redirect(authUrlWithState);
    } else {
      res.redirect(authUrl);
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Handle OAuth callback
 */
export async function handleOAuthCallback(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const provider = (req as any).oauthProvider as OAuthProvider;
    const { code, state, error, error_description } = req.query;

    // Handle OAuth errors
    if (error) {
      res.status(400).json({
        success: false,
        message: 'OAuth authentication failed',
        error: {
          code: error as string,
          description: error_description as string,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
      return;
    }

    if (!code) {
      res.status(400).json({
        success: false,
        message: 'Authorization code is required',
        error: {
          code: 'MISSING_CODE',
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
      return;
    }

    const service = getOAuthService(provider);

    // Handle Apple's form_post response (if id_token is in body)
    if (provider === OAuthProvider.APPLE && req.body?.id_token) {
      const result = await (service as any).handleCallbackWithIdToken(
        code as string,
        req.body.id_token
      );

      // Extract redirect URL from state if present
      let redirectUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      if (state) {
        const stateParts = (state as string).split(':');
        if (stateParts.length > 1) {
          try {
            redirectUrl = Buffer.from(stateParts[1], 'base64').toString('utf8');
          } catch {
            // Invalid state, use default
          }
        }
      }

      // Redirect to frontend with tokens
      const tokenParams = new URLSearchParams({
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        isNewUser: result.isNewUser.toString(),
      });
      res.redirect(`${redirectUrl}/auth/callback?${tokenParams.toString()}`);
      return;
    }

    // Standard OAuth callback flow
    const result = await service.handleCallback(code as string);

    // Extract redirect URL from state if present
    let redirectUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    if (state) {
      const stateParts = (state as string).split(':');
      if (stateParts.length > 1) {
        try {
          redirectUrl = Buffer.from(stateParts[1], 'base64').toString('utf8');
        } catch {
          // Invalid state, use default
        }
      }
    }

    // Redirect to frontend with tokens
    const tokenParams = new URLSearchParams({
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      isNewUser: result.isNewUser.toString(),
    });
    res.redirect(`${redirectUrl}/auth/callback?${tokenParams.toString()}`);
  } catch (error) {
    next(error);
  }
}

/**
 * Link OAuth account to existing user
 */
export async function linkOAuthAccount(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const provider = (req as any).oauthProvider as OAuthProvider;
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: {
          code: 'UNAUTHORIZED',
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
      return;
    }

    const { code } = req.body;

    if (!code) {
      res.status(400).json({
        success: false,
        message: 'Authorization code is required',
        error: {
          code: 'MISSING_CODE',
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
      return;
    }

    const service = getOAuthService(provider);
    await service.linkAccount(userId, code);

    res.status(200).json({
      success: true,
      message: 'OAuth account linked successfully',
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Unlink OAuth account from user
 */
export async function unlinkOAuthAccount(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const provider = (req as any).oauthProvider as OAuthProvider;
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: {
          code: 'UNAUTHORIZED',
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
      return;
    }

    const service = getOAuthService(provider);
    await service.unlinkAccount(userId);

    res.status(200).json({
      success: true,
      message: 'OAuth account unlinked successfully',
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get linked OAuth accounts for user
 */
export async function getLinkedAccounts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: {
          code: 'UNAUTHORIZED',
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
      return;
    }

    const { data: linkedAccounts, error } = await supabase
      .from('oauth_providers')
      .select('id, provider, email, created_at')
      .eq('user_id', userId);

    if (error) {
      throw new AppError(`Failed to retrieve linked accounts: ${error.message}`, 500);
    }

    res.status(200).json({
      success: true,
      data: {
        accounts: (linkedAccounts || []).map((account) => ({
          id: account.id,
          provider: account.provider,
          email: account.email,
          createdAt: account.created_at,
        })),
        total: linkedAccounts?.length || 0,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  } catch (error) {
    next(error);
  }
}

