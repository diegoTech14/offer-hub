/**
 * @fileoverview Google OAuth service implementation
 * @author Offer Hub Team
 */

import { BaseOAuthService } from './oauth-base.service';
import { OAuthProvider, OAuthProfile, OAuthTokenData } from '@/types/oauth.types';
import { getProviderConfig } from '@/config/oauth.config';
import axios from 'axios';

/**
 * Google OAuth service
 */
export class GoogleOAuthService extends BaseOAuthService {
  private readonly authUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  private readonly tokenUrl = 'https://oauth2.googleapis.com/token';
  private readonly userInfoUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';

  constructor() {
    super(OAuthProvider.GOOGLE);
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
      access_type: 'offline',
      prompt: 'consent',
      ...(state && { state }),
    });

    return `${this.authUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<OAuthTokenData> {
    try {
      const response = await axios.post(this.tokenUrl, {
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.config.callbackUrl,
      });

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
   * Get user profile from Google
   */
  async getUserProfile(accessToken: string): Promise<OAuthProfile> {
    try {
      const response = await axios.get(this.userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = response.data;

      return {
        provider: OAuthProvider.GOOGLE,
        providerUserId: data.id,
        email: data.email || '',
        emailVerified: data.verified_email || false,
        name: data.name,
        firstName: data.given_name,
        lastName: data.family_name,
        picture: data.picture,
        locale: data.locale,
      };
    } catch (error: any) {
      throw new Error(`Failed to get user profile: ${error.response?.data?.error_description || error.message}`);
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<OAuthTokenData> {
    try {
      const response = await axios.post(this.tokenUrl, {
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      });

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

