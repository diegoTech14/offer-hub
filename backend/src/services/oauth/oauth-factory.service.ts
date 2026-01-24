/**
 * @fileoverview OAuth service factory
 * @author Offer Hub Team
 */

import { OAuthProvider, IOAuthService } from '@/types/oauth.types';
import { BaseOAuthService } from './oauth-base.service';
import { GoogleOAuthService } from './google-oauth.service';
import { AppleOAuthService } from './apple-oauth.service';
import { MicrosoftOAuthService } from './microsoft-oauth.service';
import { GitHubOAuthService } from './github-oauth.service';
import { isProviderEnabled } from '@/config/oauth.config';
import { AppError } from '@/utils/AppError';

/**
 * Service instances cache (singleton pattern)
 */
const serviceInstances: Map<OAuthProvider, BaseOAuthService> = new Map();

/**
 * Get OAuth service instance for a provider
 * @param provider - OAuth provider
 * @returns OAuth service instance
 * @throws AppError if provider is not enabled or not found
 */
export function getOAuthService(provider: OAuthProvider): BaseOAuthService {
  // Check if provider is enabled
  if (!isProviderEnabled(provider)) {
    throw new AppError(`OAuth provider ${provider} is not enabled or configured`, 400);
  }

  // Return cached instance if exists
  if (serviceInstances.has(provider)) {
    return serviceInstances.get(provider)!;
  }

  // Create new instance based on provider
  let service: BaseOAuthService;

  switch (provider) {
    case OAuthProvider.GOOGLE:
      service = new GoogleOAuthService();
      break;
    case OAuthProvider.APPLE:
      service = new AppleOAuthService();
      break;
    case OAuthProvider.MICROSOFT:
      service = new MicrosoftOAuthService();
      break;
    case OAuthProvider.GITHUB:
      service = new GitHubOAuthService();
      break;
    default:
      throw new AppError(`Unsupported OAuth provider: ${provider}`, 400);
  }

  // Cache instance
  serviceInstances.set(provider, service);

  return service;
}

/**
 * Clear service instances cache (useful for testing)
 */
export function clearOAuthServiceCache(): void {
  serviceInstances.clear();
}

