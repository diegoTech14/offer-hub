/**
 * Authentication error handling utilities
 * Parses API errors and returns user-friendly messages
 */

export interface AuthErrorDetails {
  title: string;
  message: string;
  field?: 'email' | 'password' | 'username' | 'general';
  action?: string;
}

// Error codes from backend
const ERROR_CODE_MAP: Record<string, AuthErrorDetails> = {
  // Login errors
  INVALID_CREDENTIALS: {
    title: 'Incorrect email or password',
    message: 'The email or password you entered is incorrect. Please verify both and try again.',
    field: 'general',
  },
  MISSING_CREDENTIALS: {
    title: 'Missing information',
    message: 'Please enter both your email and password to sign in.',
    field: 'general',
  },

  // Registration errors
  MISSING_FIELDS: {
    title: 'Missing information',
    message: 'Please fill in all required fields to continue.',
    field: 'general',
  },

  // Email errors
  INVALID_EMAIL_FORMAT: {
    title: 'Invalid email',
    message: 'Please enter a valid email address (e.g., name@example.com).',
    field: 'email',
  },
  EMAIL_ALREADY_REGISTERED: {
    title: 'Email already in use',
    message: 'This email is already registered. Try signing in instead or use a different email.',
    field: 'email',
    action: 'sign-in',
  },

  // Password errors
  PASSWORD_TOO_SHORT: {
    title: 'Password too short',
    message: 'Your password must be at least 8 characters long.',
    field: 'password',
  },

  // Username errors
  USERNAME_ALREADY_TAKEN: {
    title: 'Username taken',
    message: 'This username is already in use. Please choose a different one.',
    field: 'username',
  },

  // Account status errors
  ACCOUNT_INACTIVE: {
    title: 'Account inactive',
    message: 'Your account is currently inactive. Please contact support for assistance.',
    field: 'general',
  },
  EMAIL_AUTH_NOT_ENABLED: {
    title: 'Email login not available',
    message: 'Email authentication is not enabled for this account. Please use wallet authentication or OAuth to sign in.',
    field: 'general',
  },

  // Token errors
  TOKEN_EXPIRED: {
    title: 'Session expired',
    message: 'Your session has expired. Please sign in again.',
    field: 'general',
  },
  TOKEN_INVALID: {
    title: 'Invalid session',
    message: 'Your session is invalid. Please sign in again.',
    field: 'general',
  },

  // Wallet errors
  INVALID_WALLET_SIGNATURE: {
    title: 'Invalid wallet signature',
    message: 'The wallet signature could not be verified. Please try signing again.',
    field: 'general',
  },
  WALLET_ALREADY_REGISTERED: {
    title: 'Wallet already registered',
    message: 'This wallet is already linked to an account. Try signing in instead.',
    field: 'general',
    action: 'sign-in',
  },

  // Server errors
  INTERNAL_SERVER_ERROR: {
    title: 'Server error',
    message: 'Something went wrong on our end. Please try again in a few moments.',
    field: 'general',
  },
};

// HTTP status code fallback messages
const HTTP_STATUS_MAP: Record<number, AuthErrorDetails> = {
  400: {
    title: 'Invalid request',
    message: 'The information provided is invalid. Please check your input and try again.',
    field: 'general',
  },
  401: {
    title: 'Incorrect email or password',
    message: 'The email or password you entered is incorrect. Please verify both and try again.',
    field: 'general',
  },
  403: {
    title: 'Access denied',
    message: 'You do not have permission to perform this action.',
    field: 'general',
  },
  404: {
    title: 'Not found',
    message: 'The requested resource was not found.',
    field: 'general',
  },
  409: {
    title: 'Already exists',
    message: 'This information is already in use. Please use different details.',
    field: 'general',
  },
  422: {
    title: 'Validation error',
    message: 'The information provided could not be processed. Please check your input.',
    field: 'general',
  },
  429: {
    title: 'Too many attempts',
    message: 'You have made too many attempts. Please wait a moment before trying again.',
    field: 'general',
  },
  500: {
    title: 'Server error',
    message: 'Something went wrong on our end. Please try again in a few moments.',
    field: 'general',
  },
  502: {
    title: 'Service unavailable',
    message: 'Our service is temporarily unavailable. Please try again in a few moments.',
    field: 'general',
  },
  503: {
    title: 'Service unavailable',
    message: 'Our service is temporarily unavailable. Please try again in a few moments.',
    field: 'general',
  },
};

interface ApiErrorResponse {
  success?: boolean;
  message?: string;
  error?: {
    code?: string;
    message?: string;
  };
}

/**
 * Parse an API error response and return user-friendly error details
 */
export function parseAuthError(
  response: Response | null,
  data: ApiErrorResponse | null,
  fallbackMessage?: string
): AuthErrorDetails {
  // Try to get error code from response data
  const errorCode = data?.error?.code;
  if (errorCode && ERROR_CODE_MAP[errorCode]) {
    return ERROR_CODE_MAP[errorCode];
  }

  // Try to parse backend message for known error patterns
  const message = data?.message || data?.error?.message || '';
  const parsedError = parseErrorMessage(message);
  if (parsedError) {
    return parsedError;
  }

  // Fallback to HTTP status code
  if (response?.status && HTTP_STATUS_MAP[response.status]) {
    return HTTP_STATUS_MAP[response.status];
  }

  // If we have a message from the backend, use it with a generic title
  if (message && message.length > 0 && message.length < 200) {
    return {
      title: getErrorTitleFromStatus(response?.status),
      message: formatErrorMessage(message),
      field: 'general',
    };
  }

  // Ultimate fallback
  return {
    title: 'Error',
    message: fallbackMessage || 'An unexpected error occurred. Please try again.',
    field: 'general',
  };
}

/**
 * Parse error message for known patterns
 */
function parseErrorMessage(message: string): AuthErrorDetails | null {
  const lowerMessage = message.toLowerCase();

  // Email patterns
  if (lowerMessage.includes('email already registered') || lowerMessage.includes('email already exists')) {
    return ERROR_CODE_MAP.EMAIL_ALREADY_REGISTERED;
  }
  if (lowerMessage.includes('invalid email')) {
    return ERROR_CODE_MAP.INVALID_EMAIL_FORMAT;
  }

  // Password patterns
  if (lowerMessage.includes('password') && (lowerMessage.includes('8 character') || lowerMessage.includes('too short'))) {
    return ERROR_CODE_MAP.PASSWORD_TOO_SHORT;
  }

  // Invalid credentials - could be email OR password
  if (lowerMessage.includes('invalid') && (lowerMessage.includes('password') || lowerMessage.includes('credentials') || lowerMessage.includes('email or password'))) {
    return ERROR_CODE_MAP.INVALID_CREDENTIALS;
  }
  if (lowerMessage.includes('incorrect') && (lowerMessage.includes('password') || lowerMessage.includes('email'))) {
    return ERROR_CODE_MAP.INVALID_CREDENTIALS;
  }

  // Username patterns
  if (lowerMessage.includes('username') && (lowerMessage.includes('taken') || lowerMessage.includes('already'))) {
    return ERROR_CODE_MAP.USERNAME_ALREADY_TAKEN;
  }

  // Account patterns
  if (lowerMessage.includes('inactive') || lowerMessage.includes('disabled')) {
    return ERROR_CODE_MAP.ACCOUNT_INACTIVE;
  }
  if (lowerMessage.includes('email authentication not enabled')) {
    return ERROR_CODE_MAP.EMAIL_AUTH_NOT_ENABLED;
  }

  // Wallet patterns
  if (lowerMessage.includes('wallet') && lowerMessage.includes('already')) {
    return ERROR_CODE_MAP.WALLET_ALREADY_REGISTERED;
  }
  if (lowerMessage.includes('signature') && lowerMessage.includes('invalid')) {
    return ERROR_CODE_MAP.INVALID_WALLET_SIGNATURE;
  }

  return null;
}

/**
 * Get error title based on HTTP status
 */
function getErrorTitleFromStatus(status?: number): string {
  if (!status) return 'Error';
  if (status >= 500) return 'Server error';
  if (status === 401 || status === 403) return 'Authentication error';
  if (status === 400 || status === 422) return 'Validation error';
  if (status === 409) return 'Conflict error';
  if (status === 429) return 'Rate limit exceeded';
  return 'Error';
}

/**
 * Format error message for display
 */
function formatErrorMessage(message: string): string {
  // Remove HTTP status codes from message
  let formatted = message.replace(/^(HTTP\s*)?\d{3}:\s*/i, '');
  formatted = formatted.replace(/Login failed:\s*/i, '');
  formatted = formatted.replace(/Registration failed:\s*/i, '');

  // Capitalize first letter
  if (formatted.length > 0) {
    formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  // Ensure it ends with a period
  if (formatted.length > 0 && !formatted.endsWith('.') && !formatted.endsWith('!') && !formatted.endsWith('?')) {
    formatted += '.';
  }

  return formatted;
}

/**
 * Get a simple error message string from error details
 */
export function getErrorMessage(error: AuthErrorDetails): string {
  return error.message;
}

/**
 * Check if the error suggests redirecting to sign in
 */
export function shouldRedirectToSignIn(error: AuthErrorDetails): boolean {
  return error.action === 'sign-in';
}

/**
 * Check if the error is related to a specific field
 */
export function getErrorField(error: AuthErrorDetails): string | undefined {
  return error.field;
}
