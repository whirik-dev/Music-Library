/**
 * API Routes Unit Tests
 * Tests for /api/auth/user-init and /api/auth/session-verify endpoints
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

describe('API Routes Tests', () => {
  let originalFetch;
  let mockFetch;

  beforeAll(() => {
    // Store original fetch
    originalFetch = global.fetch;
    
    // Mock environment variables
    process.env.NEXT_PUBLIC_BACKEND_URL = 'http://localhost:3001';
  });

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock fetch
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
    // Restore original fetch
    global.fetch = originalFetch;
  });

  describe('/api/auth/user-init', () => {
    let GET;

    beforeAll(async () => {
      // Dynamically import the route handler
      const module = await import('../app/api/auth/user-init/route.js');
      GET = module.GET;
    });

    it('should return 401 when no session is found', async () => {
      // Mock no session
      mockAuth.mockResolvedValue(null);

      // Mock NextResponse.json to return a response-like object
      const mockResponse = {
        status: 401,
        json: () => Promise.resolve({
          success: false,
          error: 'Unauthorized - No valid session found'
        })
      };
      mockNextResponse.json.mockReturnValue(mockResponse);

      const result = await GET();
      
      expect(mockAuth).toHaveBeenCalled();
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Unauthorized - No valid session found'
        }),
        expect.objectContaining({ status: 401 })
      );
    });

    it('should return 401 when session has no ssid', async () => {
      // Mock session without ssid
      mockAuth.mockResolvedValue({ user: {} });

      const mockResponse = {
        status: 401,
        json: () => Promise.resolve({
          success: false,
          error: 'Unauthorized - No session ID found',
          errorType: 'no_ssid'
        })
      };
      mockNextResponse.json.mockReturnValue(mockResponse);

      await GET();
      
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Unauthorized - No session ID found',
          errorType: 'no_ssid'
        }),
        expect.objectContaining({ status: 401 })
      );
    });

    it('should successfully aggregate user data when all services respond', async () => {
      // Mock valid session
      mockAuth.mockResolvedValue({ user: { ssid: 'test-token' } });

      // Mock successful responses for all services
      const mockResponses = [
        { success: true, data: { isNewbie: false } },
        { data: { tier: 'premium' } },
        { data: { balance: 100 } },
        { data: { points: 50 } },
        { data: [{ id: 'song1' }] },
        { data: { id: 'fav123' } },
        { data: [{ id: 'music1' }] }
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

      const mockResponse = {
        status: 200,
        json: () => Promise.resolve({
          success: true,
          data: { user: expect.any(Object) },
          meta: expect.any(Object)
        })
      };
      mockNextResponse.json.mockReturnValue(mockResponse);

      await GET();
      
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            user: expect.any(Object)
          }),
          meta: expect.any(Object)
        })
      );
    });

    it('should handle authentication errors correctly', async () => {
      // Mock valid session
      mockAuth.mockResolvedValue({ user: { ssid: 'test-token' } });

      // Mock 401 error from backend
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: () => Promise.resolve('Invalid token')
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
  });

  describe('/api/auth/session-verify', () => {
    let GET;

    beforeAll(async () => {
      // Dynamically import the route handler
      const module = await import('../app/api/auth/session-verify/route.js');
      GET = module.GET;
    });

    it('should return 401 when no session is found', async () => {
      // Mock no session
      mockAuth.mockResolvedValue(null);

      const mockResponse = {
        status: 401,
        json: () => Promise.resolve({
          success: false,
          error: 'Unauthorized - No valid session found'
        })
      };
      mockNextResponse.json.mockReturnValue(mockResponse);

      await GET();
      
      expect(mockAuth).toHaveBeenCalled();
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Unauthorized - No valid session found'
        }),
        expect.objectContaining({ status: 401 })
      );
    });

    it('should successfully verify session and return user data', async () => {
      // Mock valid session
      mockAuth.mockResolvedValue({ user: { ssid: 'test-token-123' } });

      // Mock successful backend response
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          success: true,
          data: { isNewbie: false }
        })
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

      await GET();
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/auth/isLogged',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token-123'
          })
        })
      );

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            isNewbie: false
          }),
          timestamp: expect.any(String)
        })
      );
    });

    it('should handle backend 401 errors correctly', async () => {
      // Mock valid session
      mockAuth.mockResolvedValue({ user: { ssid: 'test-token' } });

      // Mock 401 from backend
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      const mockResponse = {
        status: 401,
        json: () => Promise.resolve({
          success: false,
          error: 'Session expired or invalid'
        })
      };
      mockNextResponse.json.mockReturnValue(mockResponse);

      await GET();
      
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Session expired or invalid'
        }),
        expect.objectContaining({ status: 401 })
      );
    });

    it('should handle network errors correctly', async () => {
      // Mock valid session
      mockAuth.mockResolvedValue({ user: { ssid: 'test-token' } });

      // Mock network error
      mockFetch.mockRejectedValue(new Error('Network error'));

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
  });
});