/**
 * API Routes Error Handling Tests
 * Comprehensive error handling and edge case tests
 */

// Mock NextAuth before importing
const mockAuth = jest.fn();
jest.mock('../auth', () => ({
  auth: mockAuth,
}));

// Mock NextResponse
const mockJson = jest.fn();
const mockNextResponse = {
  json: jest.fn(() => ({ json: mockJson }))
};
jest.mock('next/server', () => ({
  NextResponse: mockNextResponse
}));

describe('API Routes Error Handling Tests', () => {
  let originalFetch;
  let mockFetch;

  beforeAll(() => {
    originalFetch = global.fetch;
    process.env.NEXT_PUBLIC_BACKEND_URL = 'http://localhost:3001';
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch = jest.fn();
    global.fetch = mockFetch;
    
    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe('/api/auth/user-init Error Scenarios', () => {
    let GET;

    beforeAll(async () => {
      const module = await import('../app/api/auth/user-init/route.js');
      GET = module.GET;
    });

    it('should return 500 when NEXT_PUBLIC_BACKEND_URL is not configured', async () => {
      // Mock valid session
      mockAuth.mockResolvedValue({ user: { ssid: 'test-token' } });
      
      // Temporarily remove backend URL
      const originalUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      delete process.env.NEXT_PUBLIC_BACKEND_URL;

      const mockResponse = {
        status: 500,
        json: () => Promise.resolve({
          success: false,
          error: 'Backend service configuration error'
        })
      };
      mockNextResponse.json.mockReturnValue(mockResponse);

      await GET();

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Backend service configuration error'
        }),
        expect.objectContaining({ status: 500 })
      );

      // Restore backend URL
      process.env.NEXT_PUBLIC_BACKEND_URL = originalUrl;
    });

    it('should handle partial service failures gracefully', async () => {
      // Mock valid session
      mockAuth.mockResolvedValue({ user: { ssid: 'test-token' } });

      // Mock mixed success/failure responses
      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // auth/isLogged - success
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ success: true, data: { isNewbie: true } })
          });
        } else if (callCount === 2) {
          // user/membership - failure
          return Promise.resolve({
            ok: false,
            status: 503,
            statusText: 'Service Unavailable',
            text: () => Promise.resolve('Service temporarily unavailable')
          });
        } else {
          // Other services - success
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ data: {} })
          });
        }
      });

      const mockResponse = {
        status: 200,
        json: () => Promise.resolve({
          success: true,
          data: { user: expect.any(Object) },
          errors: expect.any(Object),
          meta: expect.any(Object)
        })
      };
      mockNextResponse.json.mockReturnValue(mockResponse);

      await GET();
      
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true, // No critical failures
          errors: expect.any(Object),
          meta: expect.objectContaining({
            hasPartialFailures: true
          })
        })
      );
    });

    it('should categorize different HTTP error codes correctly', async () => {
      // Mock valid session
      mockAuth.mockResolvedValue({ user: { ssid: 'test-token' } });

      // Test different error status codes
      const errorCodes = [400, 401, 403, 404, 500, 502, 503];
      
      for (const statusCode of errorCodes) {
        jest.clearAllMocks();
        
        mockFetch.mockResolvedValue({
          ok: false,
          status: statusCode,
          statusText: `HTTP ${statusCode}`,
          text: () => Promise.resolve(`Error ${statusCode}`)
        });

        const mockResponse = {
          status: 200,
          json: () => Promise.resolve({
            success: expect.any(Boolean),
            data: expect.any(Object),
            errors: expect.any(Object)
          })
        };
        mockNextResponse.json.mockReturnValue(mockResponse);

        await GET();
        
        expect(mockNextResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            errors: expect.any(Object)
          })
        );
      }
    });

    it('should handle network timeout errors', async () => {
      // Mock valid session
      mockAuth.mockResolvedValue({ user: { ssid: 'test-token' } });

      // Mock timeout error
      mockFetch.mockImplementation(() => {
        const error = new Error('Request timeout');
        error.name = 'AbortError';
        return Promise.reject(error);
      });

      const mockResponse = {
        status: 200,
        json: () => Promise.resolve({
          success: expect.any(Boolean),
          data: expect.any(Object),
          errors: expect.any(Object)
        })
      };
      mockNextResponse.json.mockReturnValue(mockResponse);

      await GET();
      
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.any(Object)
        })
      );
    });

    it('should mark response as failed when auth service fails (critical failure)', async () => {
      // Mock valid session
      mockAuth.mockResolvedValue({ user: { ssid: 'test-token' } });

      // Mock auth service failure, others success
      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // auth/isLogged - failure (critical)
          return Promise.resolve({
            ok: false,
            status: 401,
            statusText: 'Unauthorized',
            text: () => Promise.resolve('Invalid token')
          });
        } else {
          // Other services - success
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ data: {} })
          });
        }
      });

      const mockResponse = {
        status: 200,
        json: () => Promise.resolve({
          success: false, // Critical failure
          data: expect.any(Object),
          errors: expect.any(Object),
          meta: expect.objectContaining({
            serviceStats: expect.objectContaining({
              criticalFailures: 1
            })
          })
        })
      };
      mockNextResponse.json.mockReturnValue(mockResponse);

      await GET();
      
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false, // Critical failure
          errors: expect.objectContaining({
            auth: expect.objectContaining({
              type: 'authentication',
              status: 401
            })
          }),
          meta: expect.objectContaining({
            serviceStats: expect.objectContaining({
              failed: expect.any(Number),
              successful: expect.any(Number)
            })
          })
        })
      );
    });

    it('should handle unexpected fatal errors gracefully', async () => {
      // Mock auth throwing an unexpected error
      mockAuth.mockRejectedValue(new Error('Unexpected auth error'));

      const mockResponse = {
        status: 500,
        json: () => Promise.resolve({
          success: false,
          error: 'Internal server error',
          errorId: expect.any(String),
          timestamp: expect.any(String)
        })
      };
      mockNextResponse.json.mockReturnValue(mockResponse);

      await GET();
      
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Internal server error',
          errorId: expect.any(String),
          timestamp: expect.any(String)
        }),
        expect.objectContaining({ status: 500 })
      );
    });
  });

  describe('/api/auth/session-verify Error Scenarios', () => {
    let GET;

    beforeAll(async () => {
      const module = await import('../app/api/auth/session-verify/route.js');
      GET = module.GET;
    });

    it('should return 500 when NEXT_PUBLIC_BACKEND_URL is not configured', async () => {
      // Mock valid session
      mockAuth.mockResolvedValue({ user: { ssid: 'test-token' } });
      
      // Temporarily remove backend URL
      const originalUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      delete process.env.NEXT_PUBLIC_BACKEND_URL;

      const mockResponse = {
        status: 500,
        json: () => Promise.resolve({
          success: false,
          error: 'Backend service configuration error'
        })
      };
      mockNextResponse.json.mockReturnValue(mockResponse);

      await GET();

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Backend service configuration error'
        }),
        expect.objectContaining({ status: 500 })
      );

      // Restore backend URL
      process.env.NEXT_PUBLIC_BACKEND_URL = originalUrl;
    });

    it('should handle 403 forbidden from backend', async () => {
      // Mock valid session
      mockAuth.mockResolvedValue({ user: { ssid: 'test-token' } });

      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden'
      });

      const mockResponse = {
        status: 403,
        json: () => Promise.resolve({
          success: false,
          error: 'Access forbidden'
        })
      };
      mockNextResponse.json.mockReturnValue(mockResponse);

      await GET();
      
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Access forbidden'
        }),
        expect.objectContaining({ status: 403 })
      );
    });

    it('should map 5xx backend errors to 503 service unavailable', async () => {
      // Mock valid session
      mockAuth.mockResolvedValue({ user: { ssid: 'test-token' } });

      const serverErrors = [500, 502, 503, 504];
      
      for (const statusCode of serverErrors) {
        jest.clearAllMocks();
        
        mockFetch.mockResolvedValue({
          ok: false,
          status: statusCode,
          statusText: `Server Error ${statusCode}`
        });

        const mockResponse = {
          status: 503,
          json: () => Promise.resolve({
            success: false,
            error: 'Backend service error'
          })
        };
        mockNextResponse.json.mockReturnValue(mockResponse);

        await GET();
        
        expect(mockNextResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            error: 'Backend service error'
          }),
          expect.objectContaining({ status: 503 })
        );
      }
    });

    it('should handle JSON parsing errors from backend', async () => {
      // Mock valid session
      mockAuth.mockResolvedValue({ user: { ssid: 'test-token' } });

      // Mock response that fails JSON parsing
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      const mockResponse = {
        status: 503,
        json: () => Promise.resolve({
          success: false,
          error: 'Unable to verify session - backend service unavailable'
        })
      };
      mockNextResponse.json.mockReturnValue(mockResponse);

      await GET();
      
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Unable to verify session - backend service unavailable'
        }),
        expect.objectContaining({ status: 503 })
      );
    });

    it('should handle unexpected fatal errors gracefully', async () => {
      // Mock auth throwing an unexpected error
      mockAuth.mockRejectedValue(new Error('Unexpected auth error'));

      const mockResponse = {
        status: 500,
        json: () => Promise.resolve({
          success: false,
          error: 'Internal server error',
          errorId: expect.any(String),
          timestamp: expect.any(String)
        })
      };
      mockNextResponse.json.mockReturnValue(mockResponse);

      await GET();
      
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Internal server error',
          errorId: expect.any(String),
          timestamp: expect.any(String)
        }),
        expect.objectContaining({ status: 500 })
      );
    });
  });

  describe('Response Format Validation', () => {
    let userInitGET, sessionVerifyGET;

    beforeAll(async () => {
      const userInitModule = await import('../app/api/auth/user-init/route.js');
      const sessionVerifyModule = await import('../app/api/auth/session-verify/route.js');
      userInitGET = userInitModule.GET;
      sessionVerifyGET = sessionVerifyModule.GET;
    });

    it('should always include timestamp in session-verify responses', async () => {
      mockAuth.mockResolvedValue({ user: { ssid: 'test-token' } });
      
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, data: { isNewbie: false } })
      });

      const mockResponse = {
        status: 200,
        json: () => Promise.resolve({
          success: true,
          data: { isNewbie: false },
          timestamp: expect.any(String)
        })
      };
      mockNextResponse.json.mockReturnValue(mockResponse);

      await sessionVerifyGET();
      
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(String)
        })
      );
    });

    it('should include metadata in user-init responses', async () => {
      mockAuth.mockResolvedValue({ user: { ssid: 'test-token' } });
      
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: {} })
      });

      const mockResponse = {
        status: 200,
        json: () => Promise.resolve({
          success: true,
          data: { user: expect.any(Object) },
          meta: expect.objectContaining({
            timestamp: expect.any(String),
            serviceStats: expect.objectContaining({
              total: 6,
              successful: expect.any(Number),
              failed: expect.any(Number),
              successRate: expect.any(String)
            })
          })
        })
      };
      mockNextResponse.json.mockReturnValue(mockResponse);

      await userInitGET();
      
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          meta: expect.objectContaining({
            serviceStats: expect.objectContaining({
              total: 6,
              successRate: expect.any(String)
            })
          })
        })
      );
    });
  });
});