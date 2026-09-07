/**
 * Auth error handling utilities
 * Provides user-friendly error messages for authentication errors
 */

export interface AuthErrorInfo {
  message: string;
  title?: string;
  action?: string;
}

/**
 * Error codes returned by the backend
 */
export const AUTH_ERROR_CODES = {
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

/**
 * Common error messages from the backend auth service
 */
const BACKEND_ERROR_MESSAGES: Record<string, AuthErrorInfo> = {
  'Invalid credentials': {
    message: 'The email or password you entered is incorrect. Please try again.',
    title: 'Login Failed',
  },
  'Account is deactivated': {
    message: 'Your account has been deactivated. Please contact your administrator for assistance.',
    title: 'Account Disabled',
  },
  'Email already registered': {
    message: 'An account with this email already exists. Please sign in or use a different email.',
    title: 'Registration Failed',
  },
  'Invalid refresh token': {
    message: 'Your session has expired. Please sign in again.',
    title: 'Session Expired',
  },
  'User not found or inactive': {
    message: 'Your account is no longer active. Please contact your administrator.',
    title: 'Account Unavailable',
  },
  'Current password is incorrect': {
    message: 'The current password you entered is incorrect. Please try again.',
    title: 'Password Change Failed',
  },
};

/**
 * Get user-friendly error info based on HTTP status code
 */
function getErrorByStatus(status: number): AuthErrorInfo {
  switch (status) {
    case 400:
      return {
        message: 'The information you provided is invalid. Please check and try again.',
        title: 'Invalid Request',
      };
    case 401:
      return {
        message: 'Authentication failed. Please check your credentials and try again.',
        title: 'Authentication Error',
      };
    case 403:
      return {
        message: 'You do not have permission to perform this action.',
        title: 'Access Denied',
      };
    case 404:
      return {
        message: 'The requested resource was not found.',
        title: 'Not Found',
      };
    case 429:
      return {
        message: 'Too many requests. Please wait a moment and try again.',
        title: 'Rate Limited',
      };
    case 500:
    case 502:
    case 503:
    case 504:
      return {
        message: 'The server is experiencing issues. Please try again later.',
        title: 'Server Error',
      };
    default:
      return {
        message: 'An unexpected error occurred. Please try again.',
        title: 'Error',
      };
  }
}

/**
 * Check if the error is a network error (no response from server)
 */
export function isNetworkError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const err = error as { message?: string; code?: string; response?: unknown };

  // No response means network error
  if (!err.response) {
    return true;
  }

  // Check for common network error codes
  if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED') {
    return true;
  }

  // Check error message for network-related issues
  if (err.message && (
    err.message.includes('Network Error') ||
    err.message.includes('timeout') ||
    err.message.includes('ECONNREFUSED')
  )) {
    return true;
  }

  return false;
}

/**
 * Get network error info
 */
export function getNetworkErrorInfo(): AuthErrorInfo {
  return {
    message: 'Unable to connect to the server. Please check your internet connection and try again.',
    title: 'Connection Error',
  };
}

/**
 * Parse an API error and return user-friendly error info
 */
export function getAuthErrorInfo(error: unknown): AuthErrorInfo {
  // Handle network errors first
  if (isNetworkError(error)) {
    return getNetworkErrorInfo();
  }

  // Type guard for axios-like error objects
  const err = error as {
    response?: {
      status?: number;
      data?: {
        error?: {
          message?: string;
          code?: string;
        };
        message?: string;
      };
    };
    message?: string;
  };

  // Get error message from response
  const backendMessage =
    err.response?.data?.error?.message ||
    err.response?.data?.message ||
    '';

  // Check for known backend error messages
  if (backendMessage && BACKEND_ERROR_MESSAGES[backendMessage]) {
    return BACKEND_ERROR_MESSAGES[backendMessage];
  }

  // Fall back to status-based error info
  const status = err.response?.status;
  if (status) {
    return getErrorByStatus(status);
  }

  // Default error
  return {
    message: 'An unexpected error occurred. Please try again.',
    title: 'Error',
  };
}

/**
 * Get just the user-friendly error message
 */
export function getAuthErrorMessage(error: unknown): string {
  return getAuthErrorInfo(error).message;
}
