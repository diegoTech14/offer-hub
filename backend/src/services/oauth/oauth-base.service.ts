/**
 * @fileoverview Base OAuth service with common functionality
 * @author Offer Hub Team
 */

import { supabase } from '@/lib/supabase/supabase';
import { AppError } from '@/utils/AppError';
import { signAccessToken, signRefreshToken } from '@/utils/jwt.utils';
import { sanitizeUser } from '@/utils/sanitizeUser';
import { encryptToken, decryptToken, normalizeOAuthProfile, validateOAuthEmail } from '@/utils/oauth.utils';
import {
  OAuthProvider,
  OAuthProfile,
  OAuthTokenData,
  OAuthProviderRecord,
  IOAuthService,
} from '@/types/oauth.types';
import { UserRole } from '@/types/auth.types';
import { getProviderConfig } from '@/config/oauth.config';

/**
 * Abstract base class for OAuth services
 * Provides common functionality for all OAuth providers
 */
export abstract class BaseOAuthService implements IOAuthService {
  protected provider: OAuthProvider;
  protected config: ReturnType<typeof getProviderConfig>;

  constructor(provider: OAuthProvider) {
    this.provider = provider;
    this.config = getProviderConfig(provider);
  }

  /**
   * Get authorization URL to redirect user (abstract - must be implemented)
   */
  abstract getAuthorizationUrl(state?: string): string;

  /**
   * Exchange authorization code for tokens (abstract - must be implemented)
   */
  abstract exchangeCodeForTokens(code: string): Promise<OAuthTokenData>;

  /**
   * Get user profile from provider (abstract - must be implemented)
   */
  abstract getUserProfile(accessToken: string): Promise<OAuthProfile>;

  /**
   * Refresh access token (abstract - must be implemented)
   */
  abstract refreshAccessToken(refreshToken: string): Promise<OAuthTokenData>;

  /**
   * Handle OAuth callback - complete flow
   */
  async handleCallback(code: string): Promise<{
    user: any;
    tokens: { accessToken: string; refreshToken: string };
    isNewUser: boolean;
  }> {
    // Exchange code for tokens
    const tokenData = await this.exchangeCodeForTokens(code);

    // Get user profile from provider
    const profile = await this.getUserProfile(tokenData.accessToken);

    // Normalize profile data
    const normalizedProfile = normalizeOAuthProfile(profile);

    // Validate email
    if (!validateOAuthEmail(normalizedProfile.email)) {
      throw new AppError('OAuth provider did not return a valid email address', 400);
    }

    // Create or update user
    const { user, isNewUser } = await this.createOrUpdateUser(normalizedProfile, tokenData);

    // Generate JWT tokens
    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role || UserRole.CLIENT,
      permissions: [],
    });

    const { refreshToken } = signRefreshToken({
      sub: user.id,
      email: user.email,
      role: user.role || UserRole.CLIENT,
      permissions: [],
    });

    return {
      user: sanitizeUser(user),
      tokens: { accessToken, refreshToken },
      isNewUser,
    };
  }

  /**
   * Create or update user from OAuth profile
   */
  protected async createOrUpdateUser(
    profile: OAuthProfile,
    tokenData: OAuthTokenData
  ): Promise<{ user: any; isNewUser: boolean }> {
    // Check if OAuth account already exists
    const { data: existingOAuth } = await supabase
      .from('oauth_providers')
      .select('user_id')
      .eq('provider', this.provider)
      .eq('provider_user_id', profile.providerUserId)
      .single();

    if (existingOAuth) {
      // Update existing OAuth record
      await this.updateOAuthRecord(existingOAuth.user_id, profile, tokenData);

      // Get user
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', existingOAuth.user_id)
        .single();

      if (error || !user) {
        throw new AppError('User not found', 404);
      }

      return { user, isNewUser: false };
    }

    // Check if user with email exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', profile.email.toLowerCase())
      .single();

    let userId: string;
    let isNewUser = false;

    if (existingUser) {
      // Link OAuth to existing user
      userId = existingUser.id;
      await this.createOAuthRecord(userId, profile, tokenData);
    } else {
      // Create new user
      const username = this.generateUsername(profile);
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([
          {
            email: profile.email.toLowerCase(),
            username,
            name: profile.name || profile.firstName || username,
            is_email_verified: profile.emailVerified,
            is_active: true,
            role: UserRole.CLIENT,
            reputation_score: 0,
          },
        ])
        .select()
        .single();

      if (createError || !newUser) {
        throw new AppError(`Failed to create user: ${createError?.message}`, 500);
      }

      userId = newUser.id;
      isNewUser = true;
      await this.createOAuthRecord(userId, profile, tokenData);
    }

    // Get created/updated user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new AppError('Failed to retrieve user', 500);
    }

    return { user, isNewUser };
  }

  /**
   * Create OAuth provider record
   */
  protected async createOAuthRecord(
    userId: string,
    profile: OAuthProfile,
    tokenData: OAuthTokenData
  ): Promise<void> {
    const encryptedAccessToken = encryptToken(tokenData.accessToken);
    const encryptedRefreshToken = tokenData.refreshToken
      ? encryptToken(tokenData.refreshToken)
      : null;

    const { error } = await supabase.from('oauth_providers').insert([
      {
        user_id: userId,
        provider: this.provider,
        provider_user_id: profile.providerUserId,
        email: profile.email.toLowerCase(),
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        expires_at: tokenData.expiresAt?.toISOString() || null,
        scopes: tokenData.scopes || [],
      },
    ]);

    if (error) {
      throw new AppError(`Failed to create OAuth record: ${error.message}`, 500);
    }
  }

  /**
   * Update OAuth provider record
   */
  protected async updateOAuthRecord(
    userId: string,
    profile: OAuthProfile,
    tokenData: OAuthTokenData
  ): Promise<void> {
    const encryptedAccessToken = encryptToken(tokenData.accessToken);
    const encryptedRefreshToken = tokenData.refreshToken
      ? encryptToken(tokenData.refreshToken)
      : null;

    const { error } = await supabase
      .from('oauth_providers')
      .update({
        email: profile.email.toLowerCase(),
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        expires_at: tokenData.expiresAt?.toISOString() || null,
        scopes: tokenData.scopes || [],
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('provider', this.provider);

    if (error) {
      throw new AppError(`Failed to update OAuth record: ${error.message}`, 500);
    }
  }

  /**
   * Link OAuth account to existing user
   */
  async linkAccount(userId: string, code: string): Promise<void> {
    const tokenData = await this.exchangeCodeForTokens(code);
    const profile = await this.getUserProfile(tokenData.accessToken);

    // Check if OAuth account is already linked to another user
    const { data: existingOAuth } = await supabase
      .from('oauth_providers')
      .select('user_id')
      .eq('provider', this.provider)
      .eq('provider_user_id', profile.providerUserId)
      .single();

    if (existingOAuth && existingOAuth.user_id !== userId) {
      throw new AppError('This OAuth account is already linked to another user', 409);
    }

    if (existingOAuth) {
      // Update existing record
      await this.updateOAuthRecord(userId, profile, tokenData);
    } else {
      // Create new record
      await this.createOAuthRecord(userId, profile, tokenData);
    }
  }

  /**
   * Unlink OAuth account from user
   */
  async unlinkAccount(userId: string): Promise<void> {
    const { error } = await supabase
      .from('oauth_providers')
      .delete()
      .eq('user_id', userId)
      .eq('provider', this.provider);

    if (error) {
      throw new AppError(`Failed to unlink OAuth account: ${error.message}`, 500);
    }
  }

  /**
   * Get OAuth record for user
   */
  async getOAuthRecord(userId: string): Promise<OAuthProviderRecord | null> {
    const { data, error } = await supabase
      .from('oauth_providers')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', this.provider)
      .single();

    if (error || !data) {
      return null;
    }

    return data as OAuthProviderRecord;
  }

  /**
   * Generate username from profile
   */
  protected generateUsername(profile: OAuthProfile): string {
    const base = profile.firstName || profile.email.split('@')[0];
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `${base}_${randomSuffix}`.toLowerCase().replace(/[^a-z0-9_]/g, '');
  }
}

