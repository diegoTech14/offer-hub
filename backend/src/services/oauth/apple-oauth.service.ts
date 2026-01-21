/**
 * @fileoverview Apple OAuth service implementation
 * @author Offer Hub Team
 */

import { BaseOAuthService } from './oauth-base.service';
import { OAuthProvider, OAuthProfile, OAuthTokenData } from '@/types/oauth.types';
import { normalizeOAuthProfile, validateOAuthEmail } from '@/utils/oauth.utils';
import { signAccessToken, signRefreshToken } from '@/utils/jwt.utils';
import { UserRole } from '@/types/auth.types';
import { sanitizeUser } from '@/utils/sanitizeUser';
import { oauthAxios } from '@/config/axios.config';
import jwt from 'jsonwebtoken';

/**
 * Apple OAuth service
 */
export class AppleOAuthService extends BaseOAuthService {
  private readonly authUrl = 'https://appleid.apple.com/auth/authorize';
  private readonly tokenUrl = 'https://appleid.apple.com/auth/token';
  private readonly teamId: string;
  private readonly keyId: string;
  private readonly privateKey: string;

  constructor() {
    super(OAuthProvider.APPLE);
    this.teamId = process.env.APPLE_TEAM_ID || '';
    this.keyId = process.env.APPLE_KEY_ID || '';
    this.privateKey = process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';
  }

  /**
   * Generate client secret for Apple (JWT)
   */
  private generateClientSecret(): string {
    if (!this.teamId || !this.keyId || !this.privateKey) {
      throw new Error('Apple OAuth configuration is incomplete. Missing TEAM_ID, KEY_ID, or PRIVATE_KEY');
    }

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: this.teamId,
      iat: now,
      exp: now + 3600, // 1 hour
      aud: 'https://appleid.apple.com',
      sub: this.config.clientId,
    };

    return jwt.sign(payload, this.privateKey, {
      algorithm: 'ES256',
      keyid: this.keyId,
    });
  }

  /**
   * Get authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.callbackUrl,
      response_type: 'code',
      scope: this.config.scopes.join(' '),
      response_mode: 'form_post',
      ...(state && { state }),
    });

    return `${this.authUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<OAuthTokenData> {
    try {
      const clientSecret = this.generateClientSecret();

      const response = await oauthAxios.post(
        this.tokenUrl,
        {
          client_id: this.config.clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: this.config.callbackUrl,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const expiresAt = response.data.expires_in
        ? new Date(Date.now() + response.data.expires_in * 1000)
        : undefined;

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresAt,
        scopes: response.data.scope?.split(' ') || this.config.scopes,
      };
    } catch (error: any) {
      throw new Error(`Failed to exchange code for tokens: ${error.response?.data?.error_description || error.message}`);
    }
  }

  /**
   * Get user profile from Apple
   * Note: Apple only returns user info on first authorization
   * Subsequent logins require storing the user_id_token
   */
  async getUserProfile(accessToken: string, idToken?: string): Promise<OAuthProfile> {
    try {
      let decodedToken: any;

      if (idToken) {
        // Decode ID token (contains user info on first auth)
        decodedToken = jwt.decode(idToken);
      } else {
        // Try to decode access token (may contain user info)
        decodedToken = jwt.decode(accessToken);
      }

      if (!decodedToken) {
        throw new Error('Unable to decode Apple token');
      }

      // Apple provides email in the token, but only on first authorization
      const email = decodedToken.email || '';
      const emailVerified = decodedToken.email_verified !== false;

      // Extract name from token (only available on first auth)
      const name = decodedToken.name
        ? `${decodedToken.name.firstName || ''} ${decodedToken.name.lastName || ''}`.trim()
        : undefined;

      return {
        provider: OAuthProvider.APPLE,
        providerUserId: decodedToken.sub,
        email,
        emailVerified,
        name,
        firstName: decodedToken.name?.firstName,
        lastName: decodedToken.name?.lastName,
        picture: undefined, // Apple doesn't provide profile picture
        locale: undefined,
      };
    } catch (error: any) {
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
  }

  /**
   * Override handleCallback to handle Apple's form_post response
   */
  async handleCallbackWithIdToken(code: string, idToken: string): Promise<{
    user: any;
    tokens: { accessToken: string; refreshToken: string };
    isNewUser: boolean;
  }> {
    // Exchange code for tokens
    const tokenData = await this.exchangeCodeForTokens(code);

    // Get user profile (with idToken for first-time auth)
    const profile = await this.getUserProfile(tokenData.accessToken, idToken);

    // Normalize profile data
    const normalizedProfile = normalizeOAuthProfile(profile);

    // Validate email
    if (!validateOAuthEmail(normalizedProfile.email)) {
      throw new Error('Apple did not return a valid email address');
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
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<OAuthTokenData> {
    try {
      const clientSecret = this.generateClientSecret();

      const response = await oauthAxios.post(
        this.tokenUrl,
        {
          client_id: this.config.clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const expiresAt = response.data.expires_in
        ? new Date(Date.now() + response.data.expires_in * 1000)
        : undefined;

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || refreshToken,
        expiresAt,
        scopes: response.data.scope?.split(' ') || this.config.scopes,
      };
    } catch (error: any) {
      throw new Error(`Failed to refresh token: ${error.response?.data?.error_description || error.message}`);
    }
  }
}

