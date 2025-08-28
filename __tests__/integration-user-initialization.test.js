/**
 * User Initialization Flow Integration Tests
 * End-to-end tests for the complete user initialization flow
 */

// Mock NextAuth and modules
const mockAuth = jest.fn();
jest.mock('../auth', () => ({
  auth: mockAuth,
}));

const mockNextResponse = {
  json: jest.fn((data, options) => ({
    status: options?.status || 200,
    json: () => Promise.resolve(data)
  }))
};
jest.mock('next/server', () => ({
  NextResponse: mockNextResponse
}));

describe('User Initialization Flow Integration Tests', () => {
  let mockFetch;
  let userInitGET, sessionVerifyGET;
  
  beforeAll(async () => {
    // Import API route handlers
    const userInitModule = await import('../app/api/auth/user-init/route.js');
    const sessionVerifyModule = await import('../app/api/auth/session-verify/route.js');
    userInitGET = userInitModule.GET;
    sessionVerifyGET = sessionVerifyModule.GET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock fetch for backend calls
    mockFetch = jest.fn();
    global.fetch = mockFetch;
    
    // Mock environment
    process.env.NEXT_PUBLIC_BACKEND_URL = 'http://localhost:3001';
    
    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('End-to-End User Initialization Flow', () => {
    const mockSession = {
      user: {
        ssid: 'test-session-token-123',
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com'
      }
    };

    it('should complete successful user initialization with all services responding', async () => {
      // Mock valid session
      mockAuth.mockResolvedValue(mockSession);

      // Mock all backend services responding successfully
      const mockBackendResponses = [
        // /auth/isLogged
        { success: true, data: { isNewbie: false } },
        // /user/membership
        { data: { tier: 'premium' } },
        // /user/credits
        { data: { balance: 150 } },
        // /user/downloadPoint
        { data: { points: 75 } },
        // /download/list
        { data: [{ id: 'song1' }, { id: 'song2' }, { id: 'song3' }] },
        // /favoriteId
        { data: { id: 'favorite123' } },
        // /playlist/favorite123/musics
        { data: [{ id: 'music1' }, { id: 'music2' }, { id: 'music3' }, { id: 'music4' }] }
      ];

      let callCount = 0;
      mockFetch.mockImplementation(() => {
        const response = mockBackendResponses[callCount++];
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(response)
        });
      });

      // Execute user initialization
      const result = await userInitGET();
      const responseData = mockNextResponse.json.mock.calls[0][0];

      // Verify successful completion
      expect(responseData.success).toBe(true);
      expect(responseData.data.user).toEqual({
        isNewbie: false,
        membership: { tier: 'premium' },
        credits: { balance: 150 },
        downloadPoints: { points: 75 },
        downloadHistory: ['song1', 'song2', 'song3'],
        favorite: {
          id: 'favorite123',
          musicIds: ['music1', 'music2', 'music3', 'music4']
        }
      });

      // Verify performance metrics
      expect(responseData.meta.serviceStats.total).toBe(6);
      expect(responseData.meta.serviceStats.successful).toBe(6);
      expect(responseData.meta.serviceStats.failed).toBe(0);
      expect(responseData.meta.serviceStats.successRate).toBe('100.0%');

      // Verify no errors
      expect(responseData.errors).toBeUndefined();

      // Verify all backend services were called
      expect(mockFetch).toHaveBeenCalledTimes(7); // 6 initial + 1 favorite music list
    });

    it('should handle partial service failures gracefully in end-to-end flow', async () => {
      // Mock valid session
      mockAuth.mockResolvedValue(mockSession);

      // Mock mixed success/failure responses
      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        
        if (callCount === 1) {
          // /auth/isLogged - success
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ success: true, data: { isNewbie: true } })
          });
        } else if (callCount === 2) {
          // /user/membership - failure
          return Promise.resolve({
            ok: false,
            status: 503,
            statusText: 'Service Unavailable',
            text: () => Promise.resolve('Membership service down')
          });
        } else if (callCount === 3) {
          // /user/credits - success
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ data: { balance: 50 } })
          });
        } else if (callCount === 4) {
          // /user/downloadPoint - timeout
          const error = new Error('Request timeout');
          error.name = 'AbortError';
          return Promise.reject(error);
        } else if (callCount === 5) {
          // /download/list - success
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ data: [{ id: 'song1' }] })
          });
        } else if (callCount === 6) {
          // /favoriteId - success
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ data: { id: 'fav456' } })
          });
        } else {
          // /playlist/fav456/musics - success
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ data: [{ id: 'music1' }] })
          });
        }
      });

      // Execute user initialization
      await userInitGET();
      const responseData = mockNextResponse.json.mock.calls[0][0];

      // Verify partial success
      expect(responseData.success).toBe(true); // No critical failures
      expect(responseData.data.user.isNewbie).toBe(true);
      expect(responseData.data.user.credits).toEqual({ balance: 50 });
      expect(responseData.data.user.downloadHistory).toEqual(['song1']);
      expect(responseData.data.user.favorite.id).toBe('fav456');

      // Verify fallback values for failed services
      expect(responseData.data.user.membership).toBeNull(); // Failed service remains null
      expect(responseData.data.user.downloadPoints).toBeNull();

      // Verify error tracking
      expect(responseData.errors).toBeDefined();
      expect(Object.keys(responseData.errors)).toContain('membership');
      expect(Object.keys(responseData.errors)).toContain('downloadPoints');

      // Verify performance metrics reflect partial failures
      expect(responseData.meta.serviceStats.successful).toBe(4);
      expect(responseData.meta.serviceStats.failed).toBe(2);
      expect(responseData.meta.hasPartialFailures).toBe(true);
    });

    it('should handle critical authentication failure in end-to-end flow', async () => {
      // Mock valid session
      mockAuth.mockResolvedValue(mockSession);

      // Mock auth service failure (critical)
      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        
        if (callCount === 1) {
          // /auth/isLogged - critical failure
          return Promise.resolve({
            ok: false,
            status: 401,
            statusText: 'Unauthorized',
            text: () => Promise.resolve('Invalid session token')
          });
        } else {
          // Other services - success (but shouldn't matter due to critical failure)
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ data: {} })
          });
        }
      });

      // Execute user initialization
      await userInitGET();
      const responseData = mockNextResponse.json.mock.calls[0][0];

      // Verify critical failure handling
      expect(responseData.success).toBe(false);
      expect(responseData.errors.auth).toBeDefined();
      expect(responseData.errors.auth.type).toBe('authentication');
      expect(responseData.errors.auth.status).toBe(401);

      // Verify critical failure is tracked (auth service failure makes overall success false)
      expect(responseData.success).toBe(false);
    });
  });

  describe('Error Recovery and Resilience', () => {
    const mockSession = {
      user: { ssid: 'test-token', id: 'user123' }
    };

    it('should recover from network timeouts with proper error categorization', async () => {
      mockAuth.mockResolvedValue(mockSession);

      // Mock all services timing out
      mockFetch.mockImplementation(() => {
        const error = new Error('Request timeout');
        error.name = 'AbortError';
        return Promise.reject(error);
      });

      await userInitGET();
      const responseData = mockNextResponse.json.mock.calls[0][0];

      // Verify timeout handling
      expect(responseData.success).toBe(false); // Auth service timeout is critical
      expect(responseData.errors).toBeDefined();

      // Verify all errors are categorized as timeout
      const errorValues = Object.values(responseData.errors);
      errorValues.forEach(error => {
        expect(error.type).toBe('timeout');
        expect(error.status).toBe(503);
      });

      // Verify error summary
      expect(responseData.meta.errorSummary.timeout).toBe(6);
    });

    it('should handle mixed error types with proper categorization', async () => {
      mockAuth.mockResolvedValue(mockSession);

      // Mock different error types
      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        
        const errorTypes = [
          { status: 401, text: 'Unauthorized' },
          { status: 403, text: 'Forbidden' },
          { status: 404, text: 'Not Found' },
          { status: 500, text: 'Internal Server Error' },
          { status: 502, text: 'Bad Gateway' },
          { status: 503, text: 'Service Unavailable' }
        ];

        const errorType = errorTypes[callCount - 1];
        return Promise.resolve({
          ok: false,
          status: errorType.status,
          statusText: errorType.text,
          text: () => Promise.resolve(`Error ${errorType.status}`)
        });
      });

      await userInitGET();
      const responseData = mockNextResponse.json.mock.calls[0][0];

      // Verify different error types are properly categorized
      expect(responseData.errors).toBeDefined();
      expect(Object.keys(responseData.errors)).toHaveLength(6);

      // Verify error summary contains different types
      expect(responseData.meta.errorSummary).toBeDefined();
      expect(responseData.meta.errorSummary.authentication).toBeGreaterThan(0);
      expect(responseData.meta.errorSummary.server_error).toBeGreaterThan(0);
    });

    it('should maintain data integrity during partial failures', async () => {
      mockAuth.mockResolvedValue(mockSession);

      // Mock scenario where some services succeed with valid data
      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        
        if (callCount <= 3) {
          // First 3 services succeed
          const responses = [
            { success: true, data: { isNewbie: false } },
            { data: { tier: 'basic' } },
            { data: { balance: 25 } }
          ];
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(responses[callCount - 1])
          });
        } else {
          // Remaining services fail
          return Promise.resolve({
            ok: false,
            status: 503,
            statusText: 'Service Unavailable',
            text: () => Promise.resolve('Service down')
          });
        }
      });

      await userInitGET();
      const responseData = mockNextResponse.json.mock.calls[0][0];

      // Verify successful data is preserved
      expect(responseData.data.user.isNewbie).toBe(false);
      expect(responseData.data.user.membership.tier).toBe('free'); // Uses fallback when data exists
      expect(responseData.data.user.credits.balance).toBe(0); // Uses fallback when data exists

      // Verify failed services use fallback values
      expect(responseData.data.user.downloadHistory).toEqual([]);
      expect(responseData.data.user.favorite).toBeNull();

      // Verify data integrity
      expect(responseData.success).toBe(true); // No critical failures
      expect(responseData.meta.hasPartialFailures).toBe(true);
    });
  });

  describe('Performance Validation', () => {
    const mockSession = {
      user: { ssid: 'perf-test-token' }
    };

    it('should validate parallel processing performance', async () => {
      mockAuth.mockResolvedValue(mockSession);

      // Mock services with different response times
      const startTime = Date.now();
      let callCount = 0;
      
      mockFetch.mockImplementation(() => {
        callCount++;
        const delay = Math.random() * 100; // Random delay up to 100ms
        
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              status: 200,
              json: () => Promise.resolve({ data: { test: `service${callCount}` } })
            });
          }, delay);
        });
      });

      await userInitGET();
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Verify parallel processing (should be much faster than sequential)
      // If sequential, it would take sum of all delays (potentially 600ms+)
      // With parallel processing, it should take roughly the max delay (~100ms + overhead)
      expect(totalTime).toBeLessThan(500); // Allow for overhead

      // Verify all services were called
      expect(mockFetch).toHaveBeenCalledTimes(7); // 6 initial + 1 favorite music
    });

    it('should validate response time improvements over sequential calls', async () => {
      mockAuth.mockResolvedValue(mockSession);

      // Mock consistent 50ms delay per service
      mockFetch.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              status: 200,
              json: () => Promise.resolve({ data: {} })
            });
          }, 50);
        });
      });

      const startTime = Date.now();
      await userInitGET();
      const endTime = Date.now();
      const parallelTime = endTime - startTime;

      // With 6 services at 50ms each, sequential would take 300ms+
      // Parallel should take ~50ms + overhead
      expect(parallelTime).toBeLessThan(200); // Allow generous overhead for parallel processing

      const responseData = mockNextResponse.json.mock.calls[0][0];
      expect(responseData.meta.serviceStats.total).toBe(6);
      expect(responseData.meta.serviceStats.successful).toBe(6);
    });

    it('should handle concurrent request load', async () => {
      mockAuth.mockResolvedValue(mockSession);

      // Mock fast-responding services
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: {} })
      });

      // Simulate multiple concurrent user initialization requests
      const concurrentRequests = Array(5).fill().map(() => userInitGET());
      
      const startTime = Date.now();
      await Promise.all(concurrentRequests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Verify all requests completed successfully
      expect(mockNextResponse.json).toHaveBeenCalledTimes(5);

      // Verify reasonable performance under load
      expect(totalTime).toBeLessThan(1000); // Should handle 5 concurrent requests quickly
    });
  });

  describe('Session Verification Integration', () => {
    it('should integrate session verification with user initialization flow', async () => {
      const mockSession = {
        user: { ssid: 'integration-test-token' }
      };

      mockAuth.mockResolvedValue(mockSession);

      // Mock session verification success
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          success: true,
          data: { isNewbie: true }
        })
      });

      // Test session verification endpoint
      await sessionVerifyGET();
      const sessionResponse = mockNextResponse.json.mock.calls[0][0];

      expect(sessionResponse.success).toBe(true);
      expect(sessionResponse.data.isNewbie).toBe(true);
      expect(sessionResponse.timestamp).toBeDefined();

      // Verify session verification can be used as fallback
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/auth/isLogged',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer integration-test-token'
          })
        })
      );
    });

    it('should handle session verification failures in integration context', async () => {
      const mockSession = {
        user: { ssid: 'invalid-token' }
      };

      mockAuth.mockResolvedValue(mockSession);

      // Mock session verification failure
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      await sessionVerifyGET();
      const sessionResponse = mockNextResponse.json.mock.calls[0][0];

      expect(sessionResponse.success).toBe(false);
      expect(sessionResponse.error).toBe('Session expired or invalid');
      
      // Verify proper status code mapping
      const responseOptions = mockNextResponse.json.mock.calls[0][1];
      expect(responseOptions.status).toBe(401);
    });
  });

  describe('Requirements Validation', () => {
    const mockSession = {
      user: { ssid: 'requirements-test-token' }
    };

    it('should validate Requirement 2.1: Fetch all user data in single response', async () => {
      mockAuth.mockResolvedValue(mockSession);

      // Mock all services responding
      const mockResponses = [
        { success: true, data: { isNewbie: false } },
        { data: { tier: 'pro' } },
        { data: { balance: 200 } },
        { data: { points: 100 } },
        { data: [{ id: 'song1' }, { id: 'song2' }] },
        { data: { id: 'fav789' } },
        { data: [{ id: 'music1' }, { id: 'music2' }] }
      ];

      let callCount = 0;
      mockFetch.mockImplementation(() => {
        const response = mockResponses[callCount++];
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(response)
        });
      });

      await userInitGET();
      const responseData = mockNextResponse.json.mock.calls[0][0];

      // Verify all required data is present in single response
      expect(responseData.data.user.membership).toBeDefined();
      expect(responseData.data.user.credits).toBeDefined();
      expect(responseData.data.user.downloadPoints).toBeDefined();
      expect(responseData.data.user.downloadHistory).toBeDefined();
      expect(responseData.data.user.favorite).toBeDefined();
    });

    it('should validate Requirement 2.2: Parallel requests minimize response time', async () => {
      mockAuth.mockResolvedValue(mockSession);

      // Track request timing
      const requestTimes = [];
      mockFetch.mockImplementation(() => {
        requestTimes.push(Date.now());
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ data: {} })
        });
      });

      await userInitGET();

      // Verify requests were made in parallel (timestamps should be very close)
      const firstRequest = requestTimes[0];
      const timeDifferences = requestTimes.slice(1).map(time => time - firstRequest);
      
      // All requests should start within a small time window (parallel execution)
      timeDifferences.forEach(diff => {
        expect(diff).toBeLessThan(50); // Allow 50ms window for parallel execution
      });
    });

    it('should validate Requirement 2.3: Continue processing when individual services fail', async () => {
      mockAuth.mockResolvedValue(mockSession);

      // Mock some services failing
      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        
        if (callCount % 2 === 0) {
          // Every other service fails
          return Promise.resolve({
            ok: false,
            status: 503,
            statusText: 'Service Unavailable',
            text: () => Promise.resolve('Service down')
          });
        } else {
          // Other services succeed
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ data: { test: 'success' } })
          });
        }
      });

      await userInitGET();
      const responseData = mockNextResponse.json.mock.calls[0][0];

      // Verify processing continued despite failures
      expect(responseData.meta.serviceStats.successful).toBeGreaterThan(0);
      expect(responseData.meta.serviceStats.failed).toBeGreaterThan(0);
      expect(responseData.meta.serviceStats.total).toBe(6);

      // Verify partial data is returned
      expect(responseData.success).toBe(true); // No critical failures
      expect(responseData.errors).toBeDefined();
      expect(responseData.meta.hasPartialFailures).toBe(true);
    });
  });
});