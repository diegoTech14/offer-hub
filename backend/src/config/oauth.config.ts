/**
 * @fileoverview OAuth configuration for all providers
 * @author Offer Hub Team
 */

import { OAuthConfig, OAuthProvider } from '@/types/oauth.types';

/**
 * Get base URL from environment or construct from request
 */
function getBaseUrl(): string {
  return process.env.BASE_URL || process.env.API_URL || 'http://localhost:4000';
}

/**
 * OAuth configuration for all providers
 * 
 * Active providers: Google, GitHub
 * Pending providers: Microsoft, Apple (ready to enable when credentials are configured)
 */
export const oauthConfig: OAuthConfig = {
  // Active: Google OAuth
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || `${getBaseUrl()}/api/oauth/google/callback`,
    scopes: ['profile', 'email'],
    enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  },
  // Pending: Apple OAuth (ready to enable when credentials are configured)
  apple: {
    clientId: process.env.APPLE_CLIENT_ID || '',
    clientSecret: '', // Apple doesn't use client_secret, uses JWT instead
    callbackUrl: process.env.APPLE_CALLBACK_URL || `${getBaseUrl()}/api/oauth/apple/callback`,
    scopes: ['name', 'email'],
    enabled: !!(process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY),
  },
  // Pending: Microsoft OAuth (ready to enable when credentials are configured)
  microsoft: {
    clientId: process.env.MICROSOFT_CLIENT_ID || '',
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
    callbackUrl: process.env.MICROSOFT_CALLBACK_URL || `${getBaseUrl()}/api/oauth/microsoft/callback`,
    scopes: ['User.Read', 'profile', 'email'],
    enabled: !!(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET),
  },
  // Active: GitHub OAuth
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    callbackUrl: process.env.GITHUB_CALLBACK_URL || `${getBaseUrl()}/api/oauth/github/callback`,
    scopes: ['user:email'],
    enabled: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
  },
  encryptionKey: process.env.OAUTH_TOKEN_ENCRYPTION_KEY || process.env.JWT_SECRET || '',
  baseUrl: getBaseUrl(),
};

/**
 * Get configuration for a specific provider
 */
export function getProviderConfig(provider: OAuthProvider) {
  return oauthConfig[provider];
}

/**
 * Check if a provider is enabled
 */
export function isProviderEnabled(provider: OAuthProvider): boolean {
  return oauthConfig[provider].enabled;
}

/**
 * Get list of active OAuth providers
 */
export function getActiveProviders(): OAuthProvider[] {
  return Object.values(OAuthProvider).filter(provider => 
    oauthConfig[provider].enabled
  );
}

/**
 * Validate OAuth configuration
 * @throws Error if required configuration is missing
 */
export function validateOAuthConfig(): void {
  const requiredProviders = Object.values(OAuthProvider);
  const missingConfig: string[] = [];

  for (const provider of requiredProviders) {
    const config = oauthConfig[provider];
    if (config.enabled) {
      if (!config.clientId) {
        missingConfig.push(`${provider.toUpperCase()}_CLIENT_ID`);
      }
      // Apple uses different credentials (TEAM_ID, KEY_ID, PRIVATE_KEY)
      if (provider === OAuthProvider.APPLE) {
        if (!process.env.APPLE_TEAM_ID) {
          missingConfig.push('APPLE_TEAM_ID');
        }
        if (!process.env.APPLE_KEY_ID) {
          missingConfig.push('APPLE_KEY_ID');
        }
        if (!process.env.APPLE_PRIVATE_KEY) {
          missingConfig.push('APPLE_PRIVATE_KEY');
        }
      } else if (!config.clientSecret) {
        missingConfig.push(`${provider.toUpperCase()}_CLIENT_SECRET`);
      }
    }
  }

  if (missingConfig.length > 0) {
    console.warn(`⚠️  OAuth configuration incomplete. Missing: ${missingConfig.join(', ')}`);
  }

  if (!oauthConfig.encryptionKey || oauthConfig.encryptionKey.length < 32) {
    console.warn('⚠️  OAUTH_TOKEN_ENCRYPTION_KEY is not set or too short. Using JWT_SECRET as fallback.');
  }
}

// Validate configuration on module load
validateOAuthConfig();

