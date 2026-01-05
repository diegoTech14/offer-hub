/**
 * @fileoverview Axios configuration with security settings
 * Prevents DoS attacks through request timeouts and validates responses
 */

import axios, { AxiosInstance } from 'axios';

/**
 * Create configured axios instance with security settings
 */
export function createSecureAxiosInstance(): AxiosInstance {
  const instance = axios.create({
    // Timeouts (in milliseconds)
    timeout: 15000, // 15 seconds for most requests

    // Prevent following too many redirects
    maxRedirects: 5,

    // Response size limits
    maxContentLength: 10 * 1024 * 1024, // 10MB
    maxBodyLength: 10 * 1024 * 1024,    // 10MB

    // User agent
    headers: {
      'User-Agent': 'OfferHub/1.0 (OAuth Service)',
    },
  });

  // Request interceptor for logging and validation
  instance.interceptors.request.use(
    (config) => {
      // Log outgoing requests (without sensitive data)
      console.log(`[OAuth API] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => {
      console.error('[OAuth API] Request error:', error.message);
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response) => {
      console.log(`[OAuth API] Response ${response.status} from ${response.config.url}`);
      return response;
    },
    (error) => {
      // Handle different error types
      if (error.code === 'ECONNABORTED') {
        console.error('[OAuth API] Request timeout - possible DoS or slow provider');
        const timeoutError = new Error('OAuth provider request timeout');
        (timeoutError as any).code = 'OAUTH_TIMEOUT';
        (timeoutError as any).statusCode = 504;
        return Promise.reject(timeoutError);
      }

      if (error.response?.status === 429) {
        console.error('[OAuth API] Rate limited by provider');
        const rateLimitError = new Error('OAuth provider rate limit exceeded');
        (rateLimitError as any).code = 'OAUTH_RATE_LIMITED';
        (rateLimitError as any).statusCode = 429;
        return Promise.reject(rateLimitError);
      }

      if (error.response?.status === 401 || error.response?.status === 403) {
        console.error('[OAuth API] Authentication failed');
        const authError = new Error('OAuth authentication failed with provider');
        (authError as any).code = 'OAUTH_AUTH_FAILED';
        (authError as any).statusCode = 401;
        return Promise.reject(authError);
      }

      if (error.response?.status >= 500) {
        console.error('[OAuth API] Provider server error:', error.response.status);
        const serverError = new Error('OAuth provider server error');
        (serverError as any).code = 'OAUTH_SERVER_ERROR';
        (serverError as any).statusCode = 503;
        return Promise.reject(serverError);
      }

      return Promise.reject(error);
    }
  );

  return instance;
}

/**
 * Default configured instance
 */
export const oauthAxios = createSecureAxiosInstance();
