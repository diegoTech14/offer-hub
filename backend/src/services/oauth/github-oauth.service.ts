/**
 * @fileoverview GitHub OAuth service implementation
 * @author Offer Hub Team
 */

import { BaseOAuthService } from './oauth-base.service';
import { OAuthProvider, OAuthProfile, OAuthTokenData } from '@/types/oauth.types';
import axios from 'axios';

/**
 * GitHub OAuth service
 */
export class GitHubOAuthService extends BaseOAuthService {
  private readonly authUrl = 'https://github.com/login/oauth/authorize';
  private readonly tokenUrl = 'https://github.com/login/oauth/access_token';
  private readonly userInfoUrl = 'https://api.github.com/user';
  private readonly userEmailsUrl = 'https://api.github.com/user/emails';

  constructor() {
    super(OAuthProvider.GITHUB);
  }

  /**
   * Get authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.callbackUrl,
      scope: this.config.scopes.join(' '),
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
        },
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );

      return {
        accessToken: response.data.access_token,
        refreshToken: undefined, // GitHub doesn't provide refresh tokens
        expiresAt: undefined,
        scopes: response.data.scope?.split(',') || this.config.scopes,
      };
    } catch (error: any) {
      throw new Error(`Failed to exchange code for tokens: ${error.response?.data?.error_description || error.message}`);
    }
  }

  /**
   * Get user profile from GitHub
   */
  async getUserProfile(accessToken: string): Promise<OAuthProfile> {
    try {
      // Get user info
      const userResponse = await axios.get(this.userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      const userData = userResponse.data;

      // Get user emails (GitHub requires separate API call)
      let email = userData.email || '';
      let emailVerified = false;

      try {
        const emailsResponse = await axios.get(this.userEmailsUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        });

        const emails = emailsResponse.data;
        const primaryEmail = emails.find((e: any) => e.primary) || emails[0];
        if (primaryEmail) {
          email = primaryEmail.email;
          emailVerified = primaryEmail.verified;
        }
      } catch {
        // If email API fails, use user email if available
        email = userData.email || '';
        emailVerified = false;
      }

      // Extract name parts
      const name = userData.name || userData.login;
      const nameParts = name ? name.split(' ') : [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      return {
        provider: OAuthProvider.GITHUB,
        providerUserId: userData.id.toString(),
        email,
        emailVerified,
        name,
        firstName,
        lastName,
        picture: userData.avatar_url,
        locale: undefined,
      };
    } catch (error: any) {
      throw new Error(`Failed to get user profile: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Refresh access token (GitHub doesn't support refresh tokens)
   */
  async refreshAccessToken(refreshToken: string): Promise<OAuthTokenData> {
    throw new Error('GitHub does not support refresh tokens. User must re-authenticate.');
  }
}

