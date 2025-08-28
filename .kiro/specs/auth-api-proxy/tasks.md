# Implementation Plan

- [x] 1. Create API route for user initialization data aggregation
  - Create `/app/api/auth/user-init/route.js` with GET method handler
  - Implement session token validation using NextAuth
  - Add backend service URL configuration from environment variables
  - _Requirements: 1.1, 1.3_

- [x] 2. Implement parallel backend service calls
  - Create helper function to make authenticated requests to backend services
  - Implement Promise.allSettled() for concurrent API calls to all user data endpoints
  - Add individual service timeout handling (5 second timeout per service)
  - _Requirements: 2.1, 2.2_

- [x] 3. Add comprehensive error handling and response aggregation
  - Implement error categorization (401, 503, 400 status codes)
  - Create response aggregation logic that handles partial failures
  - Add detailed logging for debugging and monitoring
  - _Requirements: 1.4, 2.3, 3.1, 3.2, 3.3, 3.4_

- [x] 4. Create session verification API route
  - Create `/app/api/auth/session-verify/route.js` with GET method handler
  - Implement simple proxy to backend `/auth/isLogged` endpoint
  - Add proper error handling and status code mapping
  - _Requirements: 1.1, 1.3, 1.4_

- [x] 5. Update AuthProvider to use new API routes
  - Replace multiple fetch calls with single call to `/api/auth/user-init`
  - Maintain existing store method calls for backward compatibility
  - Update error handling to work with new response structure
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 6. Remove direct backend URL dependencies from client
  - Remove `NEXT_PUBLIC_BACKEND_URL` usage from AuthProvider
  - Update any remaining direct backend calls to use API routes
  - Clean up unused environment variable references
  - _Requirements: 4.4_

- [x] 7. Add unit tests for API routes
  - Write tests for `/api/auth/user-init` success scenarios
  - Write tests for partial failure handling and error responses
  - Write tests for authentication validation and error cases
  - _Requirements: 1.1, 1.4, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4_

- [x] 8. Add unit tests for updated AuthProvider
  - Write tests to verify store method calls remain unchanged
  - Write tests for new API integration and error handling
  - Write tests to ensure backward compatibility is maintained
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 9. Add integration tests for complete user initialization flow
  - Write end-to-end tests for successful user initialization
  - Write tests for error recovery and partial data scenarios
  - Write performance tests to validate response time improvements
  - _Requirements: 2.1, 2.2, 2.3_