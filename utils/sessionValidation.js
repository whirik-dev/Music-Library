/**
 * Enhanced Session Validation Utility
 * Provides comprehensive session validation with edge case handling
 * and graceful fallback mechanisms
 */

import { 
  validateSession, 
  createAuthErrorResponse, 
  getErrorStatusCode,
  AUTH_ERROR_CODES 
} from './errorHandling.js';

/**
 * Performs comprehensive session validation with enhanced error handling
 * @param {Object} session - Session object from NextAuth
 * @param {string} context - Context where validation is happening (e.g., API route)
 * @param {Object} options - Validation options
 * @returns {Object} Validation result with detailed error information
 */
export async function validateSessionComprehensive(session, context, options = {}) {
  const {
    requireSSID = true,
    allowExpiredSession = false,
    includeDebugInfo = process.env.NODE_ENV === 'development',
    requestId = Math.random().toString(36).substring(2, 15)
  } = options;

  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] [REQ:${requestId}] Starting comprehensive session validation for ${context}`);

  // Step 1: Basic session existence check
  logSessionValidationStep(session, context, 'comprehensive_session_check', 'started', { requestId });

  if (!session) {
    const errorCode = AUTH_ERROR_CODES.NO_SESSION;
    const errorResponse = createAuthErrorResponse(
      errorCode,
      context,
      { step: 'session_existence_check' },
      {
        sessionExists: false,
        userExists: false,
        ssidExists: false,
        requestId,
        possibleCauses: [
          'User not logged in',
          'Session expired',
          'Invalid session cookie',
          'NextAuth configuration issue'
        ]
      }
    );

    logSessionValidationStep(session, context, 'comprehensive_session_check', 'failed', { 
      requestId, 
      error: errorCode,
      reason: 'No session found'
    });

    return {
      isValid: false,
      errorCode,
      statusCode: getErrorStatusCode(errorCode),
      errorResponse,
      userFeedback: createUserErrorFeedback(errorCode),
      debugInfo: includeDebugInfo ? { validation: validateSession(session) } : undefined
    };
  }

  // Step 2: Detailed session structure validation
  console.log(`[${timestamp}] [REQ:${requestId}] Performing detailed session validation`);
  const sessionValidation = validateSession(session, { requireSSID });

  if (!sessionValidation.isValid) {
    // Find the most critical error
    const criticalErrors = sessionValidation.errors.filter(e => e.severity === 'critical');
    const primaryError = criticalErrors[0] || sessionValidation.errors[0];
    
    const errorResponse = createAuthErrorResponse(
      primaryError.code,
      context,
      { 
        step: 'session_structure_validation',
        validationErrors: sessionValidation.errors.length,
        validationWarnings: sessionValidation.warnings.length
      },
      {
        sessionExists: true,
        userExists: !!session.user,
        ssidExists: !!(session.user?.ssid),
        availableKeys: sessionValidation.details.userKeys || [],
        validationDetails: sessionValidation,
        requestId
      }
    );

    logSessionValidationStep(session, context, 'comprehensive_session_check', 'failed', { 
      requestId, 
      error: primaryError.code,
      reason: primaryError.message,
      validationErrors: sessionValidation.errors.length
    });

    return {
      isValid: false,
      errorCode: primaryError.code,
      statusCode: getErrorStatusCode(primaryError.code),
      errorResponse,
      userFeedback: createUserErrorFeedback(primaryError.code, { 
        technicalDetails: sessionValidation 
      }),
      validation: sessionValidation,
      debugInfo: includeDebugInfo ? { validation: sessionValidation } : undefined
    };
  }

  // Step 3: SSID-specific validation (if required)
  if (requireSSID) {
    console.log(`[${timestamp}] [REQ:${requestId}] Performing SSID validation`);
    
    const ssid = session.user.ssid;
    
    if (!ssid) {
      const errorCode = AUTH_ERROR_CODES.NO_SSID;
      const errorResponse = createAuthErrorResponse(
        errorCode,
        context,
        { step: 'ssid_requirement_check' },
        {
          sessionExists: true,
          userExists: true,
          ssidExists: false,
          availableUserKeys: Object.keys(session.user),
          provider: session.user.provider || 'unknown',
          requestId,
          troubleshooting: [
            'Check JWT callback in auth.config.ts',
            'Verify session callback server-side detection',
            'Confirm ssid is stored during login process'
          ]
        }
      );

      logSessionValidationStep(session, context, 'ssid_validation', 'failed', { 
        requestId, 
        error: errorCode,
        reason: 'SSID required but not found'
      });

      return {
        isValid: false,
        errorCode,
        statusCode: getErrorStatusCode(errorCode),
        errorResponse,
        userFeedback: createUserErrorFeedback(errorCode),
        debugInfo: includeDebugInfo ? { validation: sessionValidation } : undefined
      };
    }

    // Validate SSID format and content
    if (typeof ssid !== 'string' || ssid.trim().length === 0) {
      const errorCode = AUTH_ERROR_CODES.INVALID_SSID;
      const errorResponse = createAuthErrorResponse(
        errorCode,
        context,
        { step: 'ssid_format_validation' },
        {
          sessionExists: true,
          userExists: true,
          ssidExists: true,
          ssidType: typeof ssid,
          ssidLength: ssid?.length || 0,
          ssidEmpty: !ssid || (typeof ssid === 'string' && ssid.trim().length === 0),
          requestId
        }
      );

      logSessionValidationStep(session, context, 'ssid_validation', 'failed', { 
        requestId, 
        error: errorCode,
        reason: 'Invalid SSID format',
        ssidType: typeof ssid,
        ssidLength: ssid?.length || 0
      });

      return {
        isValid: false,
        errorCode,
        statusCode: getErrorStatusCode(errorCode),
        errorResponse,
        userFeedback: createUserErrorFeedback(errorCode),
        debugInfo: includeDebugInfo ? { 
          validation: sessionValidation,
          ssidDetails: { type: typeof ssid, length: ssid?.length || 0 }
        } : undefined
      };
    }
  }

  // Step 4: Session expiration check (if not allowing expired sessions)
  if (!allowExpiredSession && session.expires) {
    const expirationDate = new Date(session.expires);
    const now = new Date();
    
    if (expirationDate < now) {
      const errorCode = AUTH_ERROR_CODES.EXPIRED_JWT;
      const errorResponse = createAuthErrorResponse(
        errorCode,
        context,
        { step: 'session_expiration_check' },
        {
          sessionExists: true,
          userExists: true,
          ssidExists: requireSSID ? !!(session.user?.ssid) : 'not_required',
          expiredAt: session.expires,
          currentTime: now.toISOString(),
          requestId
        }
      );

      logSessionValidationStep(session, context, 'expiration_check', 'failed', { 
        requestId, 
        error: errorCode,
        reason: 'Session expired',
        expiredAt: session.expires
      });

      return {
        isValid: false,
        errorCode,
        statusCode: getErrorStatusCode(errorCode),
        errorResponse,
        userFeedback: createUserErrorFeedback(errorCode),
        debugInfo: includeDebugInfo ? { 
          validation: sessionValidation,
          expiration: { expiredAt: session.expires, currentTime: now.toISOString() }
        } : undefined
      };
    }
  }

  // Step 5: All validations passed
  console.log(`[${timestamp}] [REQ:${requestId}] ✅ Comprehensive session validation passed`);
  
  logSessionValidationStep(session, context, 'comprehensive_session_check', 'success', { 
    requestId,
    ssidLength: session.user?.ssid?.length || 0,
    provider: session.user?.provider || 'unknown',
    hasEmail: !!session.user?.email,
    hasName: !!session.user?.name
  });

  logEnhancedAPISessionValidation(session, context, 'success', {
    step: 'comprehensive_validation_complete',
    requestId,
    validationWarnings: sessionValidation.warnings.length,
    ssidLength: session.user?.ssid?.length || 0,
    provider: session.user?.provider || 'unknown'
  });

  return {
    isValid: true,
    session,
    validation: sessionValidation,
    debugInfo: includeDebugInfo ? { 
      validation: sessionValidation,
      comprehensiveReport: createComprehensiveDebugReport(session, null, context)
    } : undefined
  };
}





/**
 * Quick session validation for performance-critical paths
 * @param {Object} session - Session object from NextAuth
 * @returns {boolean} True if session is valid for basic use
 */
export function isSessionValid(session) {
  return !!(
    session && 
    typeof session === 'object' &&
    session.user &&
    typeof session.user === 'object' &&
    session.user.email &&
    session.user.ssid &&
    typeof session.user.ssid === 'string' &&
    session.user.ssid.trim().length > 0
  );
}

/**
 * Extracts safe session information for logging and debugging
 * @param {Object} session - Session object from NextAuth
 * @returns {Object} Safe session information without sensitive data
 */
export function extractSafeSessionInfo(session) {
  if (!session) {
    return {
      exists: false,
      user: null,
      expires: null
    };
  }

  const safeInfo = {
    exists: true,
    expires: session.expires || null,
    user: null
  };

  if (session.user) {
    safeInfo.user = {
      hasName: !!session.user.name,
      hasEmail: !!session.user.email,
      hasSsid: !!session.user.ssid,
      provider: session.user.provider || 'unknown',
      namePreview: session.user.name ? `${session.user.name.substring(0, 3)}***` : null,
      emailPreview: session.user.email ? `${session.user.email.substring(0, 3)}***@${session.user.email.split('@')[1]}` : null,
      ssidPreview: session.user.ssid ? `${session.user.ssid.substring(0, 8)}***` : null,
      ssidLength: session.user.ssid ? session.user.ssid.length : 0
    };
  }

  return safeInfo;
}