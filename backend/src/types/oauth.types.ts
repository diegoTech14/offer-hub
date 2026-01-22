/**
 * @fileoverview OAuth types and interfaces
 * @author Offer Hub Team
 */

/**
 * OAuth provider enum
 */
export enum OAuthProvider {
  GOOGLE = 'google',
  APPLE = 'apple',
  MICROSOFT = 'microsoft',
  GITHUB = 'github',
}

/**
 * OAuth profile data from provider
 */
export interface OAuthProfile {
  provider: OAuthProvider;
  providerUserId: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  locale?: string;
}

/**
 * OAuth token data
 */
export interface OAuthTokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scopes?: string[];
}

/**
 * OAuth configuration for a provider
 */
export interface OAuthProviderConfig {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  scopes: string[];
  enabled: boolean;
}

/**
 * OAuth configuration for all providers
 */
export interface OAuthConfig {
  google: OAuthProviderConfig;
  apple: OAuthProviderConfig;
  microsoft: OAuthProviderConfig;
  github: OAuthProviderConfig;
  encryptionKey: string;
  baseUrl: string;
}

/**
 * OAuth provider record from database
 */
export interface OAuthProviderRecord {
  id: string;
  user_id: string;
  provider: OAuthProvider;
  provider_user_id: string;
  email: string | null;
  access_token: Buffer | null;
  refresh_token: Buffer | null;
  expires_at: Date | null;
  scopes: string[] | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * OAuth initiate request DTO
 */
export interface OAuthInitiateDTO {
  provider: OAuthProvider;
  redirectUrl?: string;
}

/**
 * OAuth callback query params
 */
export interface OAuthCallbackQuery {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
}

/**
 * OAuth link account request DTO
 */
export interface OAuthLinkAccountDTO {
  provider: OAuthProvider;
  code: string;
  state?: string;
}

/**
 * OAuth linked account response
 */
export interface OAuthLinkedAccount {
  id: string;
  provider: OAuthProvider;
  email: string | null;
  createdAt: Date;
}

/**
 * Base OAuth service interface
 */
export interface IOAuthService {
  /**
   * Get authorization URL to redirect user
   */
  getAuthorizationUrl(state?: string): string;

  /**
   * Exchange authorization code for tokens
   */
  exchangeCodeForTokens(code: string): Promise<OAuthTokenData>;

  /**
   * Get user profile from provider
   */
  getUserProfile(accessToken: string): Promise<OAuthProfile>;

  /**
   * Refresh access token
   */
  refreshAccessToken(refreshToken: string): Promise<OAuthTokenData>;
}

