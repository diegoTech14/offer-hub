/**
 * @fileoverview OAuth controller - orchestration only
 * @author Offer Hub Team
 */

import { Request, Response, NextFunction } from 'express';
import { createHash, randomBytes } from 'crypto';
import { getOAuthService } from '@/services/oauth/oauth-factory.service';
import { OAuthProvider } from '@/types/oauth.types';
import { generateOAuthState } from '@/utils/oauth.utils';
import { supabase } from '@/lib/supabase/supabase';
import { AppError } from '@/utils/AppError';

/**
 * Validate redirect URL against whitelist to prevent open redirect attacks
 */
function validateRedirectUrl(url: string | undefined): string {
  if (!url) {
    return process.env.FRONTEND_URL || 'http://localhost:3000';
  }

  try {
    const parsedUrl = new URL(url);

    // Check protocol
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      console.warn(`Invalid protocol in redirect URL: ${parsedUrl.protocol}`);
      return process.env.FRONTEND_URL || 'http://localhost:3000';
    }

    // Define allowed domains
    const allowedDomains = [
      'localhost:3000',
      'localhost:3001',
      process.env.FRONTEND_URL?.replace(/^https?:\/\//, '') || '',
    ].filter(Boolean);

    const requestedHost = parsedUrl.host;

    // Check if host is in whitelist
    const isAllowed = allowedDomains.some((domain) => {
      // Exact match
      if (requestedHost === domain) return true;
      // Pattern match for wildcard subdomains (e.g., *.example.com)
      if (domain.startsWith('*.')) {
        const pattern = domain.replace('*', '.*');
        return new RegExp(`^${pattern}$`).test(requestedHost);
      }
      return false;
    });

    if (!isAllowed) {
      console.warn(`Redirect URL not in whitelist: ${url}`);
      return process.env.FRONTEND_URL || 'http://localhost:3000';
    }

    // Additional security: check for encoded redirects in path
    if (url.includes('%2F%2F') || url.match(/\/\/.*\/\//)) {
      console.warn(`Potential open redirect in path: ${url}`);
      return process.env.FRONTEND_URL || 'http://localhost:3000';
    }

    return url;
  } catch (error) {
    console.error(`Invalid redirect URL: ${error}`);
    return process.env.FRONTEND_URL || 'http://localhost:3000';
  }
}

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
    const redirectUrl = validateRedirectUrl(req.query.redirect_url as string);

    // Generate state for CSRF protection
    const state = generateOAuthState();
    const stateHash = createHash('sha256').update(state).digest('hex');

    // Get or create session ID
    const sessionId = randomBytes(16).toString('hex');

    // Store state in database with expiration (10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const { error: stateError } = await supabase
      .from('oauth_state')
      .insert({
        state_hash: stateHash,
        session_id: sessionId,
        redirect_url: redirectUrl || null,
        provider: provider,
        expires_at: expiresAt.toISOString(),
        used: false,
      });

    if (stateError) {
      throw new AppError(`Failed to store OAuth state: ${stateError.message}`, 500);
    }

    // Store session ID in cookie for later retrieval
    res.cookie('_oauth_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000, // 10 minutes
      path: '/',
    });

    const service = getOAuthService(provider);
    const authUrl = service.getAuthorizationUrl(state);
    res.redirect(authUrl);
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

    if (!code || !state) {
      res.status(400).json({
        success: false,
        message: 'Authorization code and state are required',
        error: {
          code: 'MISSING_PARAMS',
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
      return;
    }

    // CRITICAL: Validate state parameter against database
    const stateHash = createHash('sha256').update(state as string).digest('hex');
    const sessionId = req.cookies._oauth_session;

    if (!sessionId) {
      throw new AppError('OAuth session not found. Possible CSRF attack.', 403);
    }

    const { data: stateRecord, error: stateError } = await supabase
      .from('oauth_state')
      .select('*')
      .eq('state_hash', stateHash)
      .eq('session_id', sessionId)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (stateError || !stateRecord) {
      throw new AppError('Invalid or expired state parameter. Possible CSRF attack.', 403);
    }

    // Mark state as used (prevent replay attacks)
    await supabase
      .from('oauth_state')
      .update({ used: true })
      .eq('state_hash', stateHash);

    const service = getOAuthService(provider);

    // Handle Apple's form_post response (if id_token is in body)
    if (provider === OAuthProvider.APPLE && req.body?.id_token) {
      const result = await (service as any).handleCallbackWithIdToken(
        code as string,
        req.body.id_token
      );

      // Get redirect URL from stored state
      const redirectUrl = stateRecord.redirect_url || process.env.FRONTEND_URL || 'http://localhost:3000';

      // Set HTTP-only cookies (secure, not accessible via JavaScript)
      res.cookie('accessToken', result.tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/',
      });

      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });

      // Redirect with only non-sensitive flag
      res.redirect(`${redirectUrl}/auth/callback?isNewUser=${result.isNewUser}`);
      return;
    }

    // Standard OAuth callback flow
    const result = await service.handleCallback(code as string);

    // Get redirect URL from stored state
    const redirectUrl = stateRecord.redirect_url || process.env.FRONTEND_URL || 'http://localhost:3000';

    // Set HTTP-only cookies (secure, not accessible via JavaScript)
    res.cookie('accessToken', result.tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
    });

    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    // Redirect with only non-sensitive flag
    res.redirect(`${redirectUrl}/auth/callback?isNewUser=${result.isNewUser}`);
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

