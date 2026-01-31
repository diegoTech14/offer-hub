/**
 * @fileoverview OAuth utility functions
 * @author Offer Hub Team
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { OAuthProfile, OAuthProvider } from '@/types/oauth.types';
import { oauthConfig } from '@/config/oauth.config';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypt token using AES-256-GCM
 */
export function encryptToken(token: string): Buffer {
  if (!oauthConfig.encryptionKey) {
    throw new Error('OAuth encryption key is not configured');
  }

  const key = Buffer.from(oauthConfig.encryptionKey.substring(0, 32), 'utf8');
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(token, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Combine IV + AuthTag + Encrypted data
  return Buffer.concat([iv, authTag, encrypted]);
}

/**
 * Decrypt token using AES-256-GCM
 */
export function decryptToken(encryptedBuffer: Buffer): string {
  if (!oauthConfig.encryptionKey) {
    throw new Error('OAuth encryption key is not configured');
  }

  const key = Buffer.from(oauthConfig.encryptionKey.substring(0, 32), 'utf8');
  const iv = encryptedBuffer.subarray(0, IV_LENGTH);
  const authTag = encryptedBuffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = encryptedBuffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString('utf8');
}

/**
 * Validate email from OAuth provider
 */
export function validateOAuthEmail(email: string | undefined | null): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Normalize OAuth profile data
 */
export function normalizeOAuthProfile(profile: Partial<OAuthProfile>): OAuthProfile {
  // Extract first and last name from full name if needed
  let firstName = profile.firstName;
  let lastName = profile.lastName;

  if (!firstName && !lastName && profile.name) {
    const nameParts = profile.name.trim().split(/\s+/);
    firstName = nameParts[0] || '';
    lastName = nameParts.slice(1).join(' ') || '';
  }

  return {
    provider: profile.provider!,
    providerUserId: profile.providerUserId!,
    email: profile.email?.toLowerCase() || '',
    emailVerified: profile.emailVerified ?? false,
    name: profile.name || `${firstName} ${lastName}`.trim() || undefined,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    picture: profile.picture || undefined,
    locale: profile.locale || undefined,
  };
}

/**
 * Generate random state for OAuth flow
 */
export function generateOAuthState(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Extract provider from string
 */
export function parseOAuthProvider(provider: string): OAuthProvider | null {
  const normalized = provider.toLowerCase();
  const validProviders = Object.values(OAuthProvider);
  return validProviders.includes(normalized as OAuthProvider) ? (normalized as OAuthProvider) : null;
}

