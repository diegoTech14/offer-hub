/**
 * @fileoverview Microsoft OAuth service implementation
 * @author Offer Hub Team
 */

import { BaseOAuthService } from './oauth-base.service';
import { OAuthProvider, OAuthProfile, OAuthTokenData } from '@/types/oauth.types';
import axios from 'axios';

/**
 * Microsoft OAuth service
 */
export class MicrosoftOAuthService extends BaseOAuthService {
  private readonly authUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
  private readonly tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
  private readonly userInfoUrl = 'https://graph.microsoft.com/v1.0/me';

  constructor() {
    super(OAuthProvider.MICROSOFT);
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
      response_mode: 'query',
      ...(state && { state }),
    });

    return `${this.authUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<OAuthTokenData> {
    try {
      const response = await axios.post(
        this.tokenUrl,
        {
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
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
   * Get user profile from Microsoft Graph
   */
  async getUserProfile(accessToken: string): Promise<OAuthProfile> {
    try {
      const response = await axios.get(this.userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = response.data;

      // Extract name parts
      const name = data.displayName || `${data.givenName || ''} ${data.surname || ''}`.trim();
      const firstName = data.givenName || '';
      const lastName = data.surname || '';

      return {
        provider: OAuthProvider.MICROSOFT,
        providerUserId: data.id,
        email: data.mail || data.userPrincipalName || '',
        emailVerified: true, // Microsoft emails are typically verified
        name,
        firstName,
        lastName,
        picture: undefined, // Microsoft Graph requires separate call for photo
        locale: data.preferredLanguage,
      };
    } catch (error: any) {
      throw new Error(`Failed to get user profile: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<OAuthTokenData> {
    try {
      const response = await axios.post(
        this.tokenUrl,
        {
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
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
        refreshToken: response.data.refresh_token || refreshToken,
        expiresAt,
        scopes: response.data.scope?.split(' ') || this.config.scopes,
      };
    } catch (error: any) {
      throw new Error(`Failed to refresh token: ${error.response?.data?.error_description || error.message}`);
    }
  }
}

