/**
 * Session Logging Utility
 * Provides essential logging for NextAuth session and JWT token processing
 * Optimized for production use with minimal overhead
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isDebugMode = process.env.NEXTAUTH_DEBUG === 'true';

/**
 * Safely logs session data without exposing sensitive information
 * @param {string} context - Context of the log
 * @param {Object} data - Data to log
 * @param {string} level - Log level ('info', 'warn', 'error')
 */
export function logSessionData(context, data, level = 'info') {
  if (!isDevelopment && level !== 'error') return;

  const timestamp = new Date().toISOString();
  const logPrefix = `[${timestamp}] [${context.toUpperCase()}]`;

  // Safe data extraction - remove sensitive fields
  const safeData = sanitizeLogData(data);

  switch (level) {
    case 'error':
      console.error(`${logPrefix} ERROR:`, safeData);
      break;
    case 'warn':
      console.warn(`${logPrefix} WARN:`, safeData);
      break;
    default:
      if (isDevelopment) {
        console.log(`${logPrefix} INFO:`, safeData);
      }
  }
}

/**
 * Logs JWT token processing errors (production-safe)
 * @param {Object} token - JWT token object
 * @param {string} action - Action being performed
 * @param {Object} error - Error information
 */
export function logJWTError(token, action, error) {
  const safeToken = {
    hasSsid: !!token?.ssid,
    hasEmail: !!token?.email,
    provider: token?.provider || 'unknown'
  };

  logSessionData('jwt-processing', {
    action,
    token: safeToken,
    error: error?.message || 'Unknown error'
  }, 'error');
}

/**
 * Logs session callback errors (production-safe)
 * @param {Object} session - Session object
 * @param {Object} token - JWT token object
 * @param {Object} req - Request object (if server-side)
 * @param {string} error - Error message
 */
export function logSessionError(session, token, req, error) {
  const context = req ? 'server-side' : 'client-side';
  
  logSessionData('session-callback', {
    context,
    error,
    tokenHasSsid: !!token?.ssid,
    sessionHasSsid: !!(session?.user?.ssid),
    provider: token?.provider || 'unknown'
  }, 'error');
}

/**
 * Logs API route session validation results
 * @param {Object} session - Session object from auth()
 * @param {string} route - API route path
 * @param {string} result - Validation result ('success', 'failed')
 */
export function logAPISessionValidation(session, route, result) {
  if (result === 'failed') {
    logSessionData('api-validation', {
      route,
      result,
      hasSession: !!session,
      hasUser: !!(session?.user),
      hasSsid: !!(session?.user?.ssid),
      provider: session?.user?.provider || 'unknown'
    }, 'error');
  } else if (isDevelopment) {
    logSessionData('api-validation', {
      route,
      result,
      provider: session?.user?.provider || 'unknown'
    }, 'info');
  }
}

/**
 * Sanitizes data for logging by removing or masking sensitive information
 * @param {Object} data - Data to sanitize
 * @returns {Object} Sanitized data safe for logging
 */
function sanitizeLogData(data) {
  if (!data || typeof data !== 'object') return data;

  const sensitive = ['ssid', 'password', 'token', 'secret', 'key', 'socialId'];
  const sanitized = {};

  for (const [key, value] of Object.entries(data)) {
    if (sensitive.some(s => key.toLowerCase().includes(s.toLowerCase()))) {
      // Mask sensitive data
      if (typeof value === 'string') {
        sanitized[key] = value ? '[REDACTED]' : null;
      } else if (typeof value === 'boolean') {
        sanitized[key] = value;
      } else {
        sanitized[key] = value ? '[REDACTED]' : null;
      }
    } else if (typeof value === 'object' && value !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeLogData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Logs session validation summary (development only)
 * @param {Object} session - Session object
 * @param {string} context - Context where validation is happening
 */
export function logSessionValidationSummary(session, context) {
  if (!isDevelopment) return;

  const summary = {
    sessionExists: !!session,
    userExists: !!(session?.user),
    ssidExists: !!(session?.user?.ssid),
    provider: session?.user?.provider || 'unknown'
  };
  
  logSessionData(`${context}-validation-summary`, summary, 'info');
}

/**
 * Logs session validation step (development only)
 * @param {Object} session - Session object
 * @param {string} route - API route path
 * @param {string} step - Current validation step
 * @param {string} result - Step result ('success', 'failed')
 * @param {Object} additionalData - Additional context data
 */
export function logSessionValidationStep(session, route, step, result, additionalData = {}) {
  if (!isDevelopment) return;

  const logData = {
    route,
    step,
    result,
    hasSession: !!session,
    hasUser: !!(session?.user),
    hasSsid: !!(session?.user?.ssid),
    ...additionalData
  };

  const level = result === 'success' ? 'info' : 'warn';
  logSessionData('api-validation-step', logData, level);
}

/**
 * Logs enhanced API session validation
 * @param {Object} session - Session object from auth()
 * @param {string} route - API route path
 * @param {string} result - Validation result
 * @param {Object} errorDetails - Detailed error information
 */
export function logEnhancedAPISessionValidation(session, route, result, errorDetails = {}) {
  if (result === 'failed') {
    logSessionData('enhanced-api-validation', {
      route,
      result,
      hasSession: !!session,
      hasUser: !!(session?.user),
      hasSsid: !!(session?.user?.ssid),
      provider: session?.user?.provider || 'unknown',
      ...errorDetails
    }, 'error');
  } else if (isDevelopment) {
    logSessionData('enhanced-api-validation', {
      route,
      result,
      provider: session?.user?.provider || 'unknown',
      ...errorDetails
    }, 'info');
  }
}