# Session Debugging Utilities

This document describes the session debugging utilities created to help troubleshoot NextAuth JWT session issues.

## Overview

The debugging utilities provide safe inspection of session and JWT token structures without exposing sensitive data in production environments.

## Files

- `utils/sessionDebugger.js` - Core debugging utilities
- `utils/sessionLogger.js` - Enhanced with debugging capabilities
- `app/api/debug/session/route.js` - Temporary debug endpoint
- `__tests__/session-debugging.test.js` - Test suite

## Core Functions

### sessionDebugger.js

#### `inspectSession(session, isProduction)`
Safely inspects session object structure without exposing sensitive data.

```javascript
import { inspectSession } from '@/utils/sessionDebugger';

const session = await auth();
const inspection = inspectSession(session);
console.log(inspection);
// Output: { exists: true, structure: { hasUser: true, ... }, user: { hasName: true, ... } }
```

#### `inspectJWTToken(token, isProduction)`
Safely inspects JWT token structure with expiration analysis.

```javascript
import { inspectJWTToken } from '@/utils/sessionDebugger';

const tokenInspection = inspectJWTToken(token);
console.log(tokenInspection.tokenInfo.isExpired); // false
```

#### `createSessionDebugReport(session, token, context)`
Creates comprehensive debug report with analysis and recommendations.

```javascript
import { createSessionDebugReport } from '@/utils/sessionDebugger';

const report = createSessionDebugReport(session, token, 'api-route');
console.log(report.analysis.ssidAvailable); // true/false
console.log(report.recommendations); // Array of recommendations
```

#### `safeSessionLog(level, message, data)`
Production-safe logging that respects environment settings.

```javascript
import { safeSessionLog } from '@/utils/sessionDebugger';

safeSessionLog('debug', 'Session validation', { session, context: 'api-route' });
// Only logs in development or when NEXTAUTH_DEBUG=true
```

### Enhanced sessionLogger.js

#### `createComprehensiveDebugReport(session, token, context)`
Wrapper around `createSessionDebugReport` for backward compatibility.

#### `createSessionHealthCheck(session, token)`
Creates a health check report for session validation.

```javascript
import { createSessionHealthCheck } from '@/utils/sessionLogger';

const healthCheck = createSessionHealthCheck(session, token);
console.log(healthCheck.healthy); // true/false
console.log(healthCheck.issues); // Array of issues found
```

## Debug Endpoint

### GET /api/debug/session

Temporary debug endpoint for troubleshooting session issues.

**Security**: Only available in development or when `ENABLE_SESSION_DEBUG=true`

```bash
# Get session debug information
curl http://localhost:3000/api/debug/session

# Response includes:
# - Session inspection
# - NextAuth configuration status
# - Analysis and recommendations
```

### POST /api/debug/session

Interactive debugging with specific actions.

```bash
# Inspect current session
curl -X POST http://localhost:3000/api/debug/session \
  -H "Content-Type: application/json" \
  -d '{"action": "inspect-session"}'

# Test authentication
curl -X POST http://localhost:3000/api/debug/session \
  -H "Content-Type: application/json" \
  -d '{"action": "test-auth"}'
```

## Environment Variables

- `NODE_ENV=development` - Enables detailed logging and debug features
- `NEXTAUTH_DEBUG=true` - Enables NextAuth debug logging
- `ENABLE_SESSION_DEBUG=true` - Enables debug endpoint in production (use with caution)

## Usage Examples

### API Route Debugging

```javascript
// In your API route
import { auth } from '@/auth';
import { createSessionDebugReport, safeSessionLog } from '@/utils/sessionDebugger';

export async function GET(request) {
  const session = await auth();
  
  // Create debug report
  const debugReport = createSessionDebugReport(session, null, 'user-init-api');
  
  // Log safely
  safeSessionLog('debug', 'API route session validation', {
    session,
    context: 'user-init',
    report: debugReport
  });
  
  // Check for issues
  if (!debugReport.analysis.ssidAvailable) {
    safeSessionLog('error', 'SSID not available in session', {
      session,
      recommendations: debugReport.recommendations
    });
    return new Response(JSON.stringify({
      error: 'Session validation failed',
      debug: debugReport
    }), { status: 401 });
  }
  
  // Continue with API logic...
}
```

### Session Callback Debugging

```javascript
// In auth.config.ts session callback
import { safeSessionLog, inspectSession, inspectJWTToken } from '@/utils/sessionDebugger';

async session({ session, token, req }) {
  // Log session callback execution
  safeSessionLog('debug', 'Session callback executed', {
    context: req ? 'server-side' : 'client-side',
    session,
    token
  });
  
  // Inspect structures
  const sessionInspection = inspectSession(session);
  const tokenInspection = inspectJWTToken(token);
  
  // Your session logic here...
  
  return session;
}
```

### Health Check Integration

```javascript
import { createSessionHealthCheck } from '@/utils/sessionLogger';

// In a monitoring endpoint
export async function GET() {
  const session = await auth();
  const healthCheck = createSessionHealthCheck(session);
  
  return new Response(JSON.stringify({
    healthy: healthCheck.healthy,
    issues: healthCheck.issues,
    timestamp: healthCheck.timestamp
  }), {
    status: healthCheck.healthy ? 200 : 500,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

## Security Considerations

1. **Production Safety**: All functions respect `NODE_ENV` and avoid logging sensitive data in production
2. **Data Sanitization**: Sensitive fields are masked or redacted in logs
3. **Debug Endpoint**: Only accessible in development or with explicit flag
4. **Temporary Nature**: Debug endpoint should be removed or secured before production deployment

## Testing

Run the test suite to verify functionality:

```bash
npm test __tests__/session-debugging.test.js
```

## Troubleshooting Common Issues

### SSID Not Available in API Routes

1. Check session callback configuration
2. Verify JWT token contains SSID
3. Use debug endpoint to inspect session structure
4. Check server-side vs client-side context

### Session Validation Failures

1. Use `createSessionDebugReport` to get detailed analysis
2. Check token expiration with `inspectJWTToken`
3. Verify NextAuth configuration with debug endpoint
4. Review recommendations in debug report

### Production Logging Issues

1. Ensure `NODE_ENV` is set correctly
2. Use `safeSessionLog` instead of direct console logging
3. Check that sensitive data is properly masked
4. Verify log levels are appropriate for environment

## Cleanup

Remember to remove or secure the debug endpoint before production deployment:

1. Delete `app/api/debug/session/route.js`
2. Remove debug-specific environment variables
3. Clean up any temporary debugging code
4. Ensure production logging is properly configured