# Design Document

## Overview

This design implements a Next.js API proxy layer that sits between the client-side AuthProvider and the backend services. The proxy will aggregate multiple backend API calls into a single endpoint, handle authentication securely, and provide proper error handling while maintaining backward compatibility with the existing AuthProvider interface.

## Architecture

### Current Architecture
```
Client (AuthProvider) → Direct Backend API Calls
- /auth/isLogged
- /user/membership  
- /user/credits
- /user/downloadPoint
- /download/list
- /favoriteId
- /playlist/{id}/musics
```

### New Architecture
```
Client (AuthProvider) → Next.js API Routes → Backend Services
- /api/auth/user-init (aggregates all user data)
- /api/auth/session-verify (proxies session verification)
```

## Components and Interfaces

### 1. API Route: `/api/auth/user-init`

**Purpose:** Aggregate all user initialization data in a single API call

**Method:** GET

**Headers:**
- `Authorization: Bearer {session.user.ssid}`

**Response Structure:**
```typescript
interface UserInitResponse {
  success: boolean;
  data: {
    user: {
      isNewbie: boolean;
      membership: {
        tier: string;
      };
      credits: {
        balance: number;
      };
      downloadPoints: any;
      downloadHistory: string[];
      favorite: {
        id: string;
        musicIds: string[];
      };
    };
  };
  errors?: {
    [service: string]: string;
  };
}
```

**Internal Flow:**
1. Validate session token
2. Make parallel requests to backend services:
   - `/auth/isLogged`
   - `/user/membership`
   - `/user/credits` 
   - `/user/downloadPoint`
   - `/download/list`
   - `/favoriteId`
   - `/playlist/{favoriteId}/musics`
3. Aggregate responses and handle partial failures
4. Return consolidated response

### 2. API Route: `/api/auth/session-verify`

**Purpose:** Simple session verification proxy

**Method:** GET

**Headers:**
- `Authorization: Bearer {session.user.ssid}`

**Response Structure:**
```typescript
interface SessionVerifyResponse {
  success: boolean;
  data: {
    isNewbie: boolean;
  };
}
```

### 3. Updated AuthProvider Component

**Changes:**
- Replace multiple fetch calls with single `/api/auth/user-init` call
- Maintain existing store method calls for backward compatibility
- Add error handling for partial data scenarios
- Keep the same useEffect structure and dependencies

## Data Models

### Backend Service Response Types

```typescript
// Individual service responses (for internal use)
interface AuthResponse {
  success: boolean;
  data: { isNewbie: boolean };
}

interface MembershipResponse {
  data: { tier: string };
}

interface CreditsResponse {
  data: { balance: number };
}

interface DownloadPointResponse {
  data: any;
}

interface DownloadListResponse {
  data: Array<{ id: string }>;
}

interface FavoriteIdResponse {
  data: { id: string };
}

interface PlaylistMusicsResponse {
  data: {
    items: Array<{ id: string }>;
  };
}
```

### Error Handling Types

```typescript
interface ServiceError {
  service: string;
  error: string;
  status?: number;
}

interface AggregatedResponse {
  success: boolean;
  data: Partial<UserInitResponse['data']>;
  errors: ServiceError[];
}
```

## Error Handling

### Error Categories

1. **Authentication Errors (401)**
   - Invalid or expired session token
   - Missing authorization header

2. **Service Unavailable (503)**
   - Backend service timeout
   - Network connectivity issues

3. **Validation Errors (400)**
   - Malformed requests
   - Missing required parameters

4. **Partial Success (200 with errors)**
   - Some services succeed, others fail
   - Return available data with error indicators

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
  timestamp: string;
}
```

### Retry Strategy

- Implement exponential backoff for transient failures
- Maximum 3 retry attempts per service
- Fail fast for authentication errors
- Continue processing other services if one fails

## Testing Strategy

### Unit Tests

1. **API Route Tests**
   - Test successful aggregation of all services
   - Test partial failure scenarios
   - Test authentication validation
   - Test error handling and status codes

2. **Service Integration Tests**
   - Mock backend service responses
   - Test timeout handling
   - Test malformed response handling

3. **AuthProvider Tests**
   - Test updated component with new API calls
   - Test store method calls remain unchanged
   - Test error state handling

### Integration Tests

1. **End-to-End Flow**
   - Test complete user initialization flow
   - Test session verification flow
   - Test error recovery scenarios

2. **Performance Tests**
   - Measure response time improvements
   - Test concurrent request handling
   - Validate parallel service call efficiency

### Test Data

```typescript
// Mock responses for testing
const mockUserInitResponse = {
  success: true,
  data: {
    user: {
      isNewbie: false,
      membership: { tier: "premium" },
      credits: { balance: 100 },
      downloadPoints: { points: 50 },
      downloadHistory: ["song1", "song2"],
      favorite: {
        id: "fav123",
        musicIds: ["music1", "music2"]
      }
    }
  }
};
```

## Security Considerations

### Authentication Flow
1. Client passes NextAuth session token to API route
2. API route validates session server-side
3. API route uses session token to authenticate with backend
4. Backend responses are sanitized before returning to client

### Environment Variables
- `NEXT_PUBLIC_BACKEND_URL`: Backend service base URL
- Session secrets managed by NextAuth configuration

### Data Sanitization
- Remove sensitive backend error details from client responses
- Validate and sanitize all backend response data
- Implement rate limiting on API routes

## Migration Strategy

### Phase 1: Implementation
1. Create new API routes
2. Implement parallel service calls
3. Add comprehensive error handling
4. Write unit tests

### Phase 2: Integration
1. Update AuthProvider to use new API routes
2. Maintain backward compatibility
3. Add integration tests
4. Performance testing

### Phase 3: Cleanup
1. Remove direct backend URL references from client
2. Update environment variable usage
3. Remove unused code
4. Documentation updates

## Performance Optimizations

### Parallel Processing
- Use `Promise.allSettled()` for concurrent backend calls
- Implement service-specific timeouts
- Cache frequently accessed data where appropriate

### Response Optimization
- Minimize response payload size
- Implement compression for large responses
- Add response caching headers where appropriate

### Monitoring
- Add logging for API route performance
- Track success/failure rates per backend service
- Monitor response times and identify bottlenecks