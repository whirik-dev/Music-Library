/**
 * Demonstration of Enhanced Error Handling for Edge Cases
 * This script shows how the new error handling utilities work
 * with various edge cases and malformed data
 */

import { 
  validateJWTToken, 
  validateSession, 
  createAuthErrorResponse,
  handleSessionValidationFallback,
  createUserErrorFeedback,
  AUTH_ERROR_CODES 
} from './errorHandling.js';

import { 
  validateSessionComprehensive,
  validateSessionWithFallback,
  isSessionValid 
} from './sessionValidation.js';

/**
 * Demonstrates JWT token validation edge cases
 */
function demonstrateJWTValidation() {
  console.log('\n=== JWT Token Validation Edge Cases ===\n');

  // Case 1: Null token
  console.log('1. Null JWT Token:');
  const nullResult = validateJWTToken(null);
  console.log(`   Valid: ${nullResult.isValid}`);
  console.log(`   Errors: ${nullResult.errors.length}`);
  console.log(`   Primary Error: ${nullResult.errors[0]?.code} - ${nullResult.errors[0]?.message}\n`);

  // Case 2: Malformed token (wrong type)
  console.log('2. Malformed JWT Token (string instead of object):');
  const malformedResult = validateJWTToken('invalid-token-string');
  console.log(`   Valid: ${malformedResult.isValid}`);
  console.log(`   Primary Error: ${malformedResult.errors[0]?.code} - ${malformedResult.errors[0]?.message}\n`);

  // Case 3: Missing required claims
  console.log('3. JWT Token Missing Required Claims:');
  const incompleteToken = { name: 'Test User' }; // missing email
  const incompleteResult = validateJWTToken(incompleteToken);
  console.log(`   Valid: ${incompleteResult.isValid}`);
  console.log(`   Missing Required: ${incompleteResult.details.missingRequired.join(', ')}`);
  console.log(`   Missing Optional: ${incompleteResult.details.missingOptional.join(', ')}\n`);

  // Case 4: Expired token
  console.log('4. Expired JWT Token:');
  const expiredToken = {
    email: 'test@example.com',
    exp: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
  };
  const expiredResult = validateJWTToken(expiredToken);
  console.log(`   Valid: ${expiredResult.isValid}`);
  console.log(`   Primary Error: ${expiredResult.errors[0]?.code} - ${expiredResult.errors[0]?.message}\n`);

  // Case 5: Invalid SSID type
  console.log('5. JWT Token with Invalid SSID Type:');
  const invalidSsidToken = {
    email: 'test@example.com',
    ssid: 123 // should be string
  };
  const invalidSsidResult = validateJWTToken(invalidSsidToken);
  console.log(`   Valid: ${invalidSsidResult.isValid}`);
  console.log(`   Errors: ${invalidSsidResult.errors.map(e => `${e.code}: ${e.message}`).join(', ')}\n`);
}

/**
 * Demonstrates session validation edge cases
 */
function demonstrateSessionValidation() {
  console.log('\n=== Session Validation Edge Cases ===\n');

  // Case 1: Null session
  console.log('1. Null Session:');
  const nullResult = validateSession(null);
  console.log(`   Valid: ${nullResult.isValid}`);
  console.log(`   Primary Error: ${nullResult.errors[0]?.code} - ${nullResult.errors[0]?.message}\n`);

  // Case 2: Session without user
  console.log('2. Session Without User Object:');
  const noUserSession = { expires: '2025-12-31T23:59:59.999Z' };
  const noUserResult = validateSession(noUserSession);
  console.log(`   Valid: ${noUserResult.isValid}`);
  console.log(`   Primary Error: ${noUserResult.errors[0]?.code} - ${noUserResult.errors[0]?.message}\n`);

  // Case 3: Session with missing SSID (required)
  console.log('3. Session Missing SSID (Required):');
  const noSsidSession = {
    user: { name: 'Test User', email: 'test@example.com' },
    expires: '2025-12-31T23:59:59.999Z'
  };
  const noSsidResult = validateSession(noSsidSession, { requireSSID: true });
  console.log(`   Valid: ${noSsidResult.isValid}`);
  console.log(`   Primary Error: ${noSsidResult.errors[0]?.code} - ${noSsidResult.errors[0]?.message}\n`);

  // Case 4: Session with missing SSID (not required)
  console.log('4. Session Missing SSID (Not Required):');
  const noSsidOptionalResult = validateSession(noSsidSession, { requireSSID: false });
  console.log(`   Valid: ${noSsidOptionalResult.isValid}`);
  console.log(`   Warnings: ${noSsidOptionalResult.warnings.length}\n`);

  // Case 5: Expired session
  console.log('5. Expired Session:');
  const expiredSession = {
    user: { name: 'Test User', email: 'test@example.com', ssid: 'test-ssid' },
    expires: '2020-01-01T00:00:00.000Z' // expired
  };
  const expiredResult = validateSession(expiredSession);
  console.log(`   Valid: ${expiredResult.isValid}`);
  console.log(`   Primary Error: ${expiredResult.errors[0]?.code} - ${expiredResult.errors[0]?.message}\n`);
}

/**
 * Demonstrates comprehensive session validation
 */
async function demonstrateComprehensiveValidation() {
  console.log('\n=== Comprehensive Session Validation ===\n');

  // Case 1: Valid session
  console.log('1. Valid Session:');
  const validSession = {
    user: {
      name: 'Test User',
      email: 'test@example.com',
      ssid: 'test-ssid-12345',
      provider: 'google'
    },
    expires: '2025-12-31T23:59:59.999Z'
  };
  const validResult = await validateSessionComprehensive(validSession, '/demo-route');
  console.log(`   Valid: ${validResult.isValid}`);
  console.log(`   Session Provider: ${validResult.session?.user?.provider}\n`);

  // Case 2: Invalid session with fallback
  console.log('2. Invalid Session with Fallback Attempt:');
  const invalidSession = {
    user: { email: 'test@example.com', ssid: 123 } // invalid ssid type
  };
  const fallbackResult = await validateSessionWithFallback(invalidSession, '/demo-route');
  console.log(`   Valid: ${fallbackResult.isValid}`);
  console.log(`   Error Code: ${fallbackResult.errorCode}`);
  console.log(`   Fallback Attempted: ${fallbackResult.fallbackAttempted}`);
  console.log(`   Recovery Action: ${fallbackResult.recovery?.action}\n`);
}

/**
 * Demonstrates error response creation
 */
function demonstrateErrorResponses() {
  console.log('\n=== Error Response Creation ===\n');

  // Case 1: Authentication error
  console.log('1. Authentication Error Response:');
  const authError = createAuthErrorResponse(
    AUTH_ERROR_CODES.NO_SESSION,
    '/demo-route',
    { step: 'session_check' },
    { debug: 'Session was null' }
  );
  console.log(`   Success: ${authError.success}`);
  console.log(`   Error Code: ${authError.errorCode}`);
  console.log(`   Message: ${authError.message}`);
  console.log(`   Logout Required: ${authError.logout}`);
  console.log(`   Context: ${authError.context}\n`);

  // Case 2: Backend error
  console.log('2. Backend Error Response:');
  const backendError = createAuthErrorResponse(
    AUTH_ERROR_CODES.BACKEND_UNAVAILABLE,
    '/demo-route',
    { step: 'backend_request' },
    { endpoint: '/auth/isLogged' }
  );
  console.log(`   Error Code: ${backendError.errorCode}`);
  console.log(`   Message: ${backendError.message}`);
  console.log(`   Logout Required: ${backendError.logout || false}\n`);
}

/**
 * Demonstrates user feedback creation
 */
function demonstrateUserFeedback() {
  console.log('\n=== User Error Feedback ===\n');

  // Case 1: Session error feedback
  console.log('1. Session Error Feedback:');
  const sessionFeedback = createUserErrorFeedback(AUTH_ERROR_CODES.NO_SESSION);
  console.log(`   Message: ${sessionFeedback.message}`);
  console.log(`   Severity: ${sessionFeedback.severity}`);
  console.log(`   Action Required: ${sessionFeedback.actionRequired}`);
  console.log(`   Instructions:`);
  sessionFeedback.instructions.forEach((instruction, index) => {
    console.log(`     ${index + 1}. ${instruction}`);
  });
  console.log();

  // Case 2: Backend error feedback
  console.log('2. Backend Error Feedback:');
  const backendFeedback = createUserErrorFeedback(AUTH_ERROR_CODES.BACKEND_UNAVAILABLE);
  console.log(`   Message: ${backendFeedback.message}`);
  console.log(`   Severity: ${backendFeedback.severity}`);
  console.log(`   Action Required: ${backendFeedback.actionRequired}`);
  console.log(`   Instructions:`);
  backendFeedback.instructions.forEach((instruction, index) => {
    console.log(`     ${index + 1}. ${instruction}`);
  });
  console.log();
}

/**
 * Demonstrates graceful fallback handling
 */
function demonstrateFallbackHandling() {
  console.log('\n=== Graceful Fallback Handling ===\n');

  // Case 1: Session with recoverable error
  console.log('1. Recoverable Session Error:');
  const recoverableSession = {
    user: { email: 'test@example.com' } // missing ssid
  };
  const fallback1 = handleSessionValidationFallback(recoverableSession, '/demo-route');
  console.log(`   Success: ${fallback1.success}`);
  console.log(`   Recovery Action: ${fallback1.recovery?.action}`);
  console.log(`   Recovery Message: ${fallback1.recovery?.message}`);
  console.log(`   Can Retry: ${fallback1.recovery?.canRetry}\n`);

  // Case 2: Session with non-recoverable error
  console.log('2. Non-recoverable Session Error:');
  const nonRecoverableSession = null;
  const fallback2 = handleSessionValidationFallback(nonRecoverableSession, '/demo-route');
  console.log(`   Success: ${fallback2.success}`);
  console.log(`   Recovery Action: ${fallback2.recovery?.action}`);
  console.log(`   Can Retry: ${fallback2.recovery?.canRetry}\n`);
}

/**
 * Main demonstration function
 */
async function runDemo() {
  console.log('🔧 Enhanced Error Handling for Authentication Edge Cases Demo');
  console.log('===========================================================');

  try {
    demonstrateJWTValidation();
    demonstrateSessionValidation();
    await demonstrateComprehensiveValidation();
    demonstrateErrorResponses();
    demonstrateUserFeedback();
    demonstrateFallbackHandling();

    console.log('\n✅ Demo completed successfully!');
    console.log('\nKey Features Demonstrated:');
    console.log('• JWT token malformation detection');
    console.log('• Session validation with configurable SSID requirements');
    console.log('• Comprehensive error categorization and user feedback');
    console.log('• Graceful fallback mechanisms for recoverable errors');
    console.log('• Standardized error responses with debug information');
    console.log('• User-friendly error messages with actionable instructions');

  } catch (error) {
    console.error('\n❌ Demo failed with error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Export for use in other modules
export {
  demonstrateJWTValidation,
  demonstrateSessionValidation,
  demonstrateComprehensiveValidation,
  demonstrateErrorResponses,
  demonstrateUserFeedback,
  demonstrateFallbackHandling,
  runDemo
};

// Run demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDemo();
}