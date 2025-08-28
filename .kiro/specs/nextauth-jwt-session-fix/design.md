# Design Document

## Overview

This design addresses the NextAuth JWT session handling issue where `ssid` is not properly accessible in server-side API routes. The problem occurs because NextAuth's default session callback doesn't expose JWT token data to server-side `auth()` function calls. We need to modify the session callback to ensure `ssid` is available server-side while maintaining client-side security.

## Architecture

### Current Problem
```
JWT Token: { ssid: "actual_session_id", name: "...", email: "..." }
↓
Session Callback: Filters out ssid for client
↓
Server-side auth(): { user: { name: "...", email: "..." } } // ssid missing!
↓
API Route: session.user.ssid = undefined → 401 Error
```

### Solution Architecture
```
JWT Token: { ssid: "actual_session_id", name: "...", email: "..." }
↓
Session Callback: 
  - Client-side: { user: { name: "...", email: "..." } } // ssid hidden
  - Server-side: { user: { name: "...", email: "...", ssid: "..." } } // ssid available
↓
API Route: session.user.ssid = "actual_session_id" → Success
```

## Components and Interfaces

### 1. Enhanced Session Callback

**Purpose:** Conditionally expose `ssid` based on execution context (client vs server)

**Implementation Strategy:**
- Detect if callback is running server-side vs client-side
- Expose `ssid` only in server-side context
- Maintain security by hiding `ssid` from client

**Code Structure:**
```typescript
async session({ session, token, req }) {
  // Base session data (always available)
  session.user.name = token.name || null;
  session.user.email = token.email || null;
  session.user.provider = token.provider || 'credentials';
  
  // Server-side only: expose ssid for API routes
  if (req) {
    // Running server-side (API route context)
    session.user.ssid = token.ssid || null;
  }
  // Client-side: ssid remains hidden
  
  return session;
}
```

### 2. API Route Session Validation

**Purpose:** Robust session validation with proper error handling

**Enhanced Validation Logic:**
```javascript
export async function GET(request) {
  try {
    const session = await auth();
    
    // Enhanced validation with detailed logging
    if (!session) {
      console.log('No session found');
      return unauthorizedResponse('No session');
    }
    
    if (!session.user) {
      console.log('No user in session');
      return unauthorizedResponse('No user data');
    }
    
    if (!session.user.ssid) {
      console.log('No ssid in session user:', Object.keys(session.user));
      return unauthorizedResponse('No session ID');
    }
    
    // Session is valid, proceed with backend calls
    const ssid = session.user.ssid;
    // ... rest of API logic
  } catch (error) {
    console.error('Session validation error:', error);
    return errorResponse('Session validation failed');
  }
}
```

### 3. Debugging and Logging

**Purpose:** Comprehensive logging for troubleshooting session issues

**Logging Strategy:**
- Log JWT token structure (without sensitive data)
- Log session callback execution context
- Log API route session validation steps
- Provide clear error messages for different failure scenarios

## Data Models

### JWT Token Structure
```typescript
interface JWTToken {
  ssid: string;           // Backend session ID
  name: string | null;    // User display name
  email: string;          // User email
  provider: string;       // Auth provider (google, credentials)
  socialId?: string;      // Social provider ID (for Google)
  iat: number;           // Issued at
  exp: number;           // Expires at
  jti: string;           // JWT ID
}
```

### Session Structure (Server-side)
```typescript
interface ServerSession {
  user: {
    name: string | null;
    email: string;
    provider: string;
    ssid: string;          // Available server-side only
  };
  expires: string;
}
```

### Session Structure (Client-side)
```typescript
interface ClientSession {
  user: {
    name: string | null;
    email: string;
    provider: string;
    // ssid: NOT AVAILABLE - security measure
  };
  expires: string;
}
```

## Error Handling

### Session Validation Errors

1. **No Session Found**
   - Cause: User not logged in or session expired
   - Response: 401 with logout flag
   - Action: Redirect to login

2. **No User Data**
   - Cause: Malformed session object
   - Response: 401 with session reset
   - Action: Clear session and redirect

3. **No SSID**
   - Cause: JWT token missing ssid or session callback not exposing it
   - Response: 401 with detailed error
   - Action: Debug session callback configuration

4. **JWT Validation Errors**
   - Cause: Invalid or expired JWT token
   - Response: 401 with token refresh attempt
   - Action: Attempt token refresh or logout

### Error Response Format
```typescript
interface ErrorResponse {
  success: false;
  error: string;
  errorType: 'no_session' | 'no_user' | 'no_ssid' | 'jwt_invalid';
  logout?: boolean;
  debug?: {
    sessionExists: boolean;
    userExists: boolean;
    ssidExists: boolean;
    availableKeys: string[];
  };
  timestamp: string;
}
```

## Testing Strategy

### Unit Tests

1. **Session Callback Tests**
   - Test server-side context detection
   - Test ssid exposure in server context
   - Test ssid hiding in client context
   - Test fallback behavior for missing tokens

2. **API Route Tests**
   - Test successful session validation
   - Test various failure scenarios
   - Test error response formats
   - Test logging output

### Integration Tests

1. **End-to-End Session Flow**
   - Test login → JWT creation → API access
   - Test session persistence across requests
   - Test session expiration handling

2. **Security Tests**
   - Verify ssid not exposed client-side
   - Verify ssid available server-side
   - Test JWT token security

### Debug Tests

1. **Session Structure Validation**
   - Log and verify JWT token contents
   - Log and verify session callback behavior
   - Log and verify API route session access

## Implementation Steps

### Phase 1: Session Callback Enhancement
1. Modify NextAuth session callback to detect execution context
2. Conditionally expose ssid for server-side access
3. Add comprehensive logging for debugging

### Phase 2: API Route Validation
1. Enhance session validation in API routes
2. Add detailed error handling and logging
3. Implement proper error response formats

### Phase 3: Testing and Validation
1. Test session flow end-to-end
2. Verify security measures (ssid not client-exposed)
3. Validate all error scenarios

### Phase 4: Monitoring and Debugging
1. Add production-ready logging
2. Implement session health monitoring
3. Create debugging utilities

## Security Considerations

### JWT Token Security
- Tokens are encrypted with NextAuth secret
- ssid only exposed in server-side context
- No sensitive data logged in production

### Session Management
- Automatic token rotation by NextAuth
- Secure cookie settings
- Proper session expiration handling

### API Route Security
- Server-side only ssid access
- Proper authentication validation
- Secure error messaging (no sensitive data exposure)