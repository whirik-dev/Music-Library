/**
 * Enhanced Error Handling Utilities for Authentication Edge Cases
 * Provides comprehensive error handling for JWT token malformation, session validation failures,
 * and user feedback for authentication errors
 */

/**
 * Error codes for different authentication failure scenarios
 */
export const AUTH_ERROR_CODES = {
  // Session validation errors
  NO_SESSION: 'AUTH_001',
  NO_USER: 'AUTH_002', 
  NO_SSID: 'AUTH_003',
  INVALID_SSID: 'AUTH_004',
  
  // JWT token errors
  MALFORMED_JWT: 'AUTH_005',
  EXPIRED_JWT: 'AUTH_006',
  INVALID_JWT_STRUCTURE: 'AUTH_007',
  JWT_MISSING_CLAIMS: 'AUTH_008',
  
  // Configuration errors
  MISSING_CONFIG: 'CONFIG_001',
  INVALID_CONFIG: 'CONFIG_002',
  
  // Backend service errors
  BACKEND_UNAVAILABLE: 'BACKEND_001',
  BACKEND_AUTH_FAILED: 'BACKEND_401',
  BACKEND_FORBIDDEN: 'BACKEND_403',
  BACKEND_SERVER_ERROR: 'BACKEND_5XX',
  
  // Network errors
  NETWORK_TIMEOUT: 'NETWORK_001',
  NETWORK_ERROR: 'NETWORK_002',
  
  // Fatal errors
  FATAL_ERROR: 'FATAL_001'
};

/**
 * User-friendly error messages for different error types
 */
export const USER_ERROR_MESSAGES = {
  [AUTH_ERROR_CODES.NO_SESSION]: 'Your session has expired. Please log in again.',
  [AUTH_ERROR_CODES.NO_USER]: 'Session data is incomplete. Please log in again.',
  [AUTH_ERROR_CODES.NO_SSID]: 'Authentication configuration issue. Please try logging in again.',
  [AUTH_ERROR_CODES.INVALID_SSID]: 'Session data is corrupted. Please log in again.',
  [AUTH_ERROR_CODES.MALFORMED_JWT]: 'Authentication token is invalid. Please log in again.',
  [AUTH_ERROR_CODES.EXPIRED_JWT]: 'Your session has expired. Please log in again.',
  [AUTH_ERROR_CODES.INVALID_JWT_STRUCTURE]: 'Authentication token format is invalid. Please log in again.',
  [AUTH_ERROR_CODES.JWT_MISSING_CLAIMS]: 'Authentication token is incomplete. Please log in again.',
  [AUTH_ERROR_CODES.MISSING_CONFIG]: 'Service configuration error. Please try again later.',
  [AUTH_ERROR_CODES.INVALID_CONFIG]: 'Service configuration error. Please try again later.',
  [AUTH_ERROR_CODES.BACKEND_UNAVAILABLE]: 'Authentication service is temporarily unavailable. Please try again later.',
  [AUTH_ERROR_CODES.BACKEND_AUTH_FAILED]: 'Authentication failed. Please log in again.',
  [AUTH_ERROR_CODES.BACKEND_FORBIDDEN]: 'Access denied. Please check your permissions.',
  [AUTH_ERROR_CODES.BACKEND_SERVER_ERROR]: 'Authentication service error. Please try again later.',
  [AUTH_ERROR_CODES.NETWORK_TIMEOUT]: 'Request timed out. Please check your connection and try again.',
  [AUTH_ERROR_CODES.NETWORK_ERROR]: 'Network error. Please check your connection and try again.',
  [AUTH_ERROR_CODES.FATAL_ERROR]: 'An unexpected error occurred. Please try again later.'
};

/**
 * Validates JWT token structure and content for edge cases
 * @param {Object} token - JWT token object
 * @returns {Object} Validation result with detailed error information
 */
export function validateJWTToken(token) {
  const validation = {
    isValid: true,
    errors: [],
    warnings: [],
    details: {}
  };

  // Check if token exists
  if (!token) {
    validation.isValid = false;
    validation.errors.push({
      code: AUTH_ERROR_CODES.MALFORMED_JWT,
      message: 'JWT token is null or undefined',
      severity: 'critical'
    });
    return validation;
  }

  // Check if token is an object
  if (typeof token !== 'object') {
    validation.isValid = false;
    validation.errors.push({
      code: AUTH_ERROR_CODES.INVALID_JWT_STRUCTURE,
      message: `JWT token must be an object, got ${typeof token}`,
      severity: 'critical'
    });
    return validation;
  }

  // Check required claims
  const requiredClaims = ['email'];
  const optionalClaims = ['name', 'ssid', 'provider', 'iat', 'exp'];
  
  validation.details.availableClaims = Object.keys(token);
  validation.details.missingRequired = [];
  validation.details.missingOptional = [];

  // Validate required claims
  for (const claim of requiredClaims) {
    if (!token[claim]) {
      validation.details.missingRequired.push(claim);
      validation.errors.push({
        code: AUTH_ERROR_CODES.JWT_MISSING_CLAIMS,
        message: `Required claim '${claim}' is missing or empty`,
        severity: 'critical'
      });
      validation.isValid = false;
    }
  }

  // Check optional but important claims
  for (const claim of optionalClaims) {
    if (!token[claim]) {
      validation.details.missingOptional.push(claim);
      if (claim === 'ssid') {
        validation.warnings.push({
          code: AUTH_ERROR_CODES.NO_SSID,
          message: 'SSID claim is missing - backend authentication may fail',
          severity: 'high'
        });
      }
    }
  }

  // Validate token expiration
  if (token.exp) {
    const now = Math.floor(Date.now() / 1000);
    if (token.exp < now) {
      validation.isValid = false;
      validation.errors.push({
        code: AUTH_ERROR_CODES.EXPIRED_JWT,
        message: `JWT token expired at ${new Date(token.exp * 1000).toISOString()}`,
        severity: 'critical',
        expiredAt: new Date(token.exp * 1000).toISOString(),
        currentTime: new Date().toISOString()
      });
    }
  }

  // Validate SSID format if present
  if (token.ssid) {
    if (typeof token.ssid !== 'string') {
      validation.errors.push({
        code: AUTH_ERROR_CODES.INVALID_SSID,
        message: `SSID must be a string, got ${typeof token.ssid}`,
        severity: 'high'
      });
    } else if (token.ssid.trim().length === 0) {
      validation.errors.push({
        code: AUTH_ERROR_CODES.INVALID_SSID,
        message: 'SSID is empty or contains only whitespace',
        severity: 'high'
      });
    } else if (token.ssid.length < 8) {
      validation.warnings.push({
        code: AUTH_ERROR_CODES.INVALID_SSID,
        message: 'SSID appears to be too short (less than 8 characters)',
        severity: 'medium'
      });
    }
  }

  // Validate email format if present
  if (token.email && typeof token.email === 'string') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(token.email)) {
      validation.warnings.push({
        code: AUTH_ERROR_CODES.INVALID_JWT_STRUCTURE,
        message: 'Email format appears invalid',
        severity: 'medium'
      });
    }
  }

  return validation;
}

/**
 * Validates session object structure and content for edge cases
 * @param {Object} session - Session object from NextAuth
 * @param {Object} options - Validation options
 * @returns {Object} Validation result with detailed error information
 */
export function validateSession(session, options = {}) {
  const { requireSSID = true } = options;
  const validation = {
    isValid: true,
    errors: [],
    warnings: [],
    details: {}
  };

  // Check if session exists
  if (!session) {
    validation.isValid = false;
    validation.errors.push({
      code: AUTH_ERROR_CODES.NO_SESSION,
      message: 'Session is null or undefined',
      severity: 'critical'
    });
    return validation;
  }

  // Check if session is an object
  if (typeof session !== 'object') {
    validation.isValid = false;
    validation.errors.push({
      code: AUTH_ERROR_CODES.NO_SESSION,
      message: `Session must be an object, got ${typeof session}`,
      severity: 'critical'
    });
    return validation;
  }

  validation.details.sessionKeys = Object.keys(session);

  // Check for user object
  if (!session.user) {
    validation.isValid = false;
    validation.errors.push({
      code: AUTH_ERROR_CODES.NO_USER,
      message: 'Session.user is missing',
      severity: 'critical'
    });
    return validation;
  }

  if (typeof session.user !== 'object') {
    validation.isValid = false;
    validation.errors.push({
      code: AUTH_ERROR_CODES.NO_USER,
      message: `Session.user must be an object, got ${typeof session.user}`,
      severity: 'critical'
    });
    return validation;
  }

  validation.details.userKeys = Object.keys(session.user);

  // Validate user properties
  const user = session.user;

  // Check email (required)
  if (!user.email) {
    validation.errors.push({
      code: AUTH_ERROR_CODES.NO_USER,
      message: 'User email is missing',
      severity: 'high'
    });
  } else if (typeof user.email !== 'string') {
    validation.errors.push({
      code: AUTH_ERROR_CODES.NO_USER,
      message: `User email must be a string, got ${typeof user.email}`,
      severity: 'high'
    });
  }

  // Check SSID (critical for API routes if required)
  if (requireSSID) {
    if (!user.ssid) {
      validation.errors.push({
        code: AUTH_ERROR_CODES.NO_SSID,
        message: 'User SSID is missing - required for backend authentication',
        severity: 'critical'
      });
      validation.isValid = false;
    } else if (typeof user.ssid !== 'string') {
      validation.errors.push({
        code: AUTH_ERROR_CODES.INVALID_SSID,
        message: `User SSID must be a string, got ${typeof user.ssid}`,
        severity: 'critical'
      });
      validation.isValid = false;
    } else if (user.ssid.trim().length === 0) {
      validation.errors.push({
        code: AUTH_ERROR_CODES.INVALID_SSID,
        message: 'User SSID is empty or contains only whitespace',
        severity: 'critical'
      });
      validation.isValid = false;
    }
  } else if (user.ssid) {
    // If SSID is not required but present, still validate its format
    if (typeof user.ssid !== 'string') {
      validation.warnings.push({
        code: AUTH_ERROR_CODES.INVALID_SSID,
        message: `User SSID should be a string, got ${typeof user.ssid}`,
        severity: 'medium'
      });
    } else if (user.ssid.trim().length === 0) {
      validation.warnings.push({
        code: AUTH_ERROR_CODES.INVALID_SSID,
        message: 'User SSID is empty or contains only whitespace',
        severity: 'medium'
      });
    }
  }

  // Check optional fields
  if (user.name && typeof user.name !== 'string') {
    validation.warnings.push({
      code: AUTH_ERROR_CODES.NO_USER,
      message: `User name should be a string, got ${typeof user.name}`,
      severity: 'low'
    });
  }

  if (user.provider && typeof user.provider !== 'string') {
    validation.warnings.push({
      code: AUTH_ERROR_CODES.NO_USER,
      message: `User provider should be a string, got ${typeof user.provider}`,
      severity: 'low'
    });
  }

  // Check session expiration
  if (session.expires) {
    const expirationDate = new Date(session.expires);
    const now = new Date();
    
    if (expirationDate < now) {
      validation.isValid = false;
      validation.errors.push({
        code: AUTH_ERROR_CODES.EXPIRED_JWT,
        message: `Session expired at ${session.expires}`,
        severity: 'critical',
        expiredAt: session.expires,
        currentTime: now.toISOString()
      });
    } else {
      // Check if session expires soon (within 5 minutes)
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
      if (expirationDate < fiveMinutesFromNow) {
        validation.warnings.push({
          code: AUTH_ERROR_CODES.EXPIRED_JWT,
          message: 'Session expires soon (within 5 minutes)',
          severity: 'medium',
          expiresAt: session.expires
        });
      }
    }
  }

  return validation;
}

/**
 * Creates a standardized error response for authentication failures
 * @param {string} errorCode - Error code from AUTH_ERROR_CODES
 * @param {string} context - Context where error occurred (e.g., route path)
 * @param {Object} additionalData - Additional error data
 * @param {Object} debugInfo - Debug information (only included in development)
 * @returns {Object} Standardized error response
 */
export function createAuthErrorResponse(errorCode, context, additionalData = {}, debugInfo = {}) {
  const timestamp = new Date().toISOString();
  const requestId = Math.random().toString(36).substring(2, 15);
  
  const response = {
    success: false,
    error: USER_ERROR_MESSAGES[errorCode] || 'Authentication error occurred',
    errorCode,
    errorType: getErrorType(errorCode),
    message: USER_ERROR_MESSAGES[errorCode] || 'Please try logging in again',
    timestamp,
    requestId,
    context,
    ...additionalData
  };

  // Determine if user should be logged out
  const logoutErrors = [
    AUTH_ERROR_CODES.NO_SESSION,
    AUTH_ERROR_CODES.NO_USER,
    AUTH_ERROR_CODES.NO_SSID,
    AUTH_ERROR_CODES.INVALID_SSID,
    AUTH_ERROR_CODES.EXPIRED_JWT,
    AUTH_ERROR_CODES.MALFORMED_JWT,
    AUTH_ERROR_CODES.BACKEND_AUTH_FAILED
  ];

  if (logoutErrors.includes(errorCode)) {
    response.logout = true;
  }

  // Include debug information in development
  if (process.env.NODE_ENV === 'development' && Object.keys(debugInfo).length > 0) {
    response.debug = {
      ...debugInfo,
      timestamp,
      requestId
    };
  }

  return response;
}

/**
 * Gets the HTTP status code for an error code
 * @param {string} errorCode - Error code from AUTH_ERROR_CODES
 * @returns {number} HTTP status code
 */
export function getErrorStatusCode(errorCode) {
  const statusMap = {
    // 401 Unauthorized
    [AUTH_ERROR_CODES.NO_SESSION]: 401,
    [AUTH_ERROR_CODES.NO_USER]: 401,
    [AUTH_ERROR_CODES.NO_SSID]: 401,
    [AUTH_ERROR_CODES.INVALID_SSID]: 401,
    [AUTH_ERROR_CODES.MALFORMED_JWT]: 401,
    [AUTH_ERROR_CODES.EXPIRED_JWT]: 401,
    [AUTH_ERROR_CODES.INVALID_JWT_STRUCTURE]: 401,
    [AUTH_ERROR_CODES.JWT_MISSING_CLAIMS]: 401,
    [AUTH_ERROR_CODES.BACKEND_AUTH_FAILED]: 401,
    
    // 403 Forbidden
    [AUTH_ERROR_CODES.BACKEND_FORBIDDEN]: 403,
    
    // 500 Internal Server Error
    [AUTH_ERROR_CODES.MISSING_CONFIG]: 500,
    [AUTH_ERROR_CODES.INVALID_CONFIG]: 500,
    [AUTH_ERROR_CODES.FATAL_ERROR]: 500,
    
    // 503 Service Unavailable
    [AUTH_ERROR_CODES.BACKEND_UNAVAILABLE]: 503,
    [AUTH_ERROR_CODES.BACKEND_SERVER_ERROR]: 503,
    [AUTH_ERROR_CODES.NETWORK_TIMEOUT]: 503,
    [AUTH_ERROR_CODES.NETWORK_ERROR]: 503
  };

  return statusMap[errorCode] || 500;
}

/**
 * Gets the error type category for an error code
 * @param {string} errorCode - Error code from AUTH_ERROR_CODES
 * @returns {string} Error type category
 */
function getErrorType(errorCode) {
  if (errorCode.startsWith('AUTH_')) return 'authentication';
  if (errorCode.startsWith('CONFIG_')) return 'configuration';
  if (errorCode.startsWith('BACKEND_')) return 'backend';
  if (errorCode.startsWith('NETWORK_')) return 'network';
  if (errorCode.startsWith('FATAL_')) return 'fatal';
  return 'unknown';
}

/**
 * Handles graceful fallback for session validation failures
 * @param {Object} session - Session object
 * @param {string} context - Context where validation failed
 * @returns {Object} Fallback response with recovery suggestions
 */
export function handleSessionValidationFallback(session, context) {
  const validation = validateSession(session);
  
  if (validation.isValid) {
    return {
      success: true,
      session,
      message: 'Session validation passed'
    };
  }

  // Find the most critical error
  const criticalErrors = validation.errors.filter(e => e.severity === 'critical');
  const primaryError = criticalErrors[0] || validation.errors[0];

  // Determine recovery strategy
  const recoveryStrategies = {
    [AUTH_ERROR_CODES.NO_SESSION]: {
      action: 'redirect_to_login',
      message: 'Please log in to continue',
      canRetry: false
    },
    [AUTH_ERROR_CODES.NO_USER]: {
      action: 'clear_session_and_login',
      message: 'Session data is corrupted. Please log in again',
      canRetry: false
    },
    [AUTH_ERROR_CODES.NO_SSID]: {
      action: 'refresh_session',
      message: 'Session needs to be refreshed. Please log in again',
      canRetry: true
    },
    [AUTH_ERROR_CODES.INVALID_SSID]: {
      action: 'clear_session_and_login',
      message: 'Session data is invalid. Please log in again',
      canRetry: false
    },
    [AUTH_ERROR_CODES.EXPIRED_JWT]: {
      action: 'refresh_token',
      message: 'Your session has expired. Please log in again',
      canRetry: true
    }
  };

  const recovery = recoveryStrategies[primaryError.code] || {
    action: 'generic_retry',
    message: 'Please try logging in again',
    canRetry: true
  };

  return {
    success: false,
    error: primaryError,
    validation,
    recovery,
    context,
    errorResponse: createAuthErrorResponse(
      primaryError.code,
      context,
      { recovery },
      { validation }
    )
  };
}

/**
 * Provides user-friendly error feedback for authentication errors
 * @param {string} errorCode - Error code from AUTH_ERROR_CODES
 * @param {Object} context - Additional context for the error
 * @returns {Object} User feedback object with instructions
 */
export function createUserErrorFeedback(errorCode, context = {}) {
  const baseMessage = USER_ERROR_MESSAGES[errorCode] || 'An authentication error occurred';
  
  const feedback = {
    message: baseMessage,
    severity: getErrorSeverity(errorCode),
    actionRequired: true,
    instructions: [],
    technicalDetails: null
  };

  // Add specific instructions based on error type
  switch (errorCode) {
    case AUTH_ERROR_CODES.NO_SESSION:
    case AUTH_ERROR_CODES.EXPIRED_JWT:
      feedback.instructions = [
        'Click the login button to sign in again',
        'Make sure cookies are enabled in your browser',
        'If the problem persists, try clearing your browser cache'
      ];
      break;

    case AUTH_ERROR_CODES.NO_USER:
    case AUTH_ERROR_CODES.INVALID_SSID:
    case AUTH_ERROR_CODES.MALFORMED_JWT:
      feedback.instructions = [
        'Please log out and log in again',
        'Clear your browser cookies and cache',
        'If the problem continues, contact support'
      ];
      break;

    case AUTH_ERROR_CODES.BACKEND_UNAVAILABLE:
    case AUTH_ERROR_CODES.BACKEND_SERVER_ERROR:
    case AUTH_ERROR_CODES.NETWORK_TIMEOUT:
      feedback.instructions = [
        'Please wait a moment and try again',
        'Check your internet connection',
        'If the service remains unavailable, try again later'
      ];
      feedback.actionRequired = false; // User can retry
      break;

    case AUTH_ERROR_CODES.BACKEND_FORBIDDEN:
      feedback.instructions = [
        'You may not have permission to access this resource',
        'Contact your administrator if you believe this is an error',
        'Try logging out and logging in again'
      ];
      break;

    default:
      feedback.instructions = [
        'Please try logging in again',
        'If the problem persists, contact support'
      ];
  }

  // Add technical details in development
  if (process.env.NODE_ENV === 'development' && context.technicalDetails) {
    feedback.technicalDetails = context.technicalDetails;
  }

  return feedback;
}

/**
 * Gets the severity level for an error code
 * @param {string} errorCode - Error code from AUTH_ERROR_CODES
 * @returns {string} Severity level (low, medium, high, critical)
 */
function getErrorSeverity(errorCode) {
  const criticalErrors = [
    AUTH_ERROR_CODES.NO_SESSION,
    AUTH_ERROR_CODES.NO_USER,
    AUTH_ERROR_CODES.NO_SSID,
    AUTH_ERROR_CODES.MALFORMED_JWT,
    AUTH_ERROR_CODES.FATAL_ERROR
  ];

  const highErrors = [
    AUTH_ERROR_CODES.INVALID_SSID,
    AUTH_ERROR_CODES.EXPIRED_JWT,
    AUTH_ERROR_CODES.BACKEND_AUTH_FAILED,
    AUTH_ERROR_CODES.BACKEND_FORBIDDEN
  ];

  const mediumErrors = [
    AUTH_ERROR_CODES.BACKEND_UNAVAILABLE,
    AUTH_ERROR_CODES.BACKEND_SERVER_ERROR,
    AUTH_ERROR_CODES.NETWORK_TIMEOUT,
    AUTH_ERROR_CODES.MISSING_CONFIG
  ];

  if (criticalErrors.includes(errorCode)) return 'critical';
  if (highErrors.includes(errorCode)) return 'high';
  if (mediumErrors.includes(errorCode)) return 'medium';
  return 'low';
}