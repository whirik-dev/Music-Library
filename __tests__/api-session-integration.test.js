/**
 * API Route Session Integration Tests
 * 
 * Tests actual API route behavior with server-side vs client-side session contexts
 * Verifies that API routes can successfully access ssid from sessions
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */

import { NextRequest, NextResponse } from 'next/server';

// Mock NextAuth auth function
const mockAuth = jest.fn();
jest.mock('../auth.ts', () => ({
  auth: mockAuth
}));

// Mock the session logger to avoid actual logging during tests
jest.mock('../utils/sessionLogger', () => ({
  logAPISessionValidation: jest.fn(),
  logSessionValidationSummary: jest.fn(),
  logSessionValidationStep: jest.fn(),
  logEnhancedAPISessionValidation: jest.fn(),
}));

describe('API Route Session Integration', () => {
  let userInitGET, userInitPOST, sessionVerifyGET, newbieConfirmPOST;

  const mockServerSession = {
    user: {
      name: 'Test User',
      email: 'test@example.com',
      provider: 'google',
      ssid: 'server-session-id-12345' // Available in server context
    },
    expires: '2024-12-31T23:59:59.999Z'
  };

  const mockClientSession = {
    user: {
      name: 'Test User',
      email: 'test@example.com',
      provider: 'google'
      // ssid NOT available in client context
    },
    expires: '2024-12-31T23:59:59.999Z'
  };

  beforeAll(async () => {
    // Import API route handlers after mocking
    const userInitModule = await import('../app/api/auth/user-init/route.js');
    const sessionVerifyModule = await import('../app/api/auth/session-verify/route.js');
    const newbieConfirmModule = await import('../app/api/auth/newbie-confirm/route.js');
    
    userInitGET = userInitModule.GET;
    sessionVerifyGET = sessionVerifyModule.GET;
    newbieConfirmPOST = newbieConfirmModule.POST;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock fetch for backend API calls
    global.fetch = jest.fn();
    // Mock environment variable
    process.env.NEXT_PUBLIC_BACKEND_URL = 'http://localhost:3001';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Server-side Session Access in API Routes', () => {
    test('user-init API should access ssid successfully', async () => {
      // Requirement 2.3: Server-side sessions should provide access to ssid
      mockAuth.mockResolvedValue(mockServerSession);

      // Mock successful backend response for all the calls user-init makes
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { initialized: true, isNewbie: false }
        })
      });

      const request = new NextRequest('http://localhost:3000/api/auth/user-init', {
        method: 'GET'
      });

      const response = await userInitGET(request);
      const responseData = await response.json();

      expect(mockAuth).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      
      // Verify that fetch was called with ssid from session
      // The user-init API makes multiple backend calls, check for auth call
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/isLogged'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer server-session-id-12345'
          })
        })
      );
    });

    test('session-verify API should access ssid successfully', async () => {
      mockAuth.mockResolvedValue(mockServerSession);

      // Mock successful backend response
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { valid: true }
        })
      });

      const request = new NextRequest('http://localhost:3000/api/auth/session-verify', {
        method: 'GET'
      });

      const response = await sessionVerifyGET(request);
      const responseData = await response.json();

      expect(mockAuth).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      
      // Verify that fetch was called with ssid
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/isLogged'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer server-session-id-12345'
          })
        })
      );
    });

    test('newbie-confirm API should access ssid successfully', async () => {
      mockAuth.mockResolvedValue(mockServerSession);

      // Mock successful backend response
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { confirmed: true }
        })
      });

      const request = new NextRequest('http://localhost:3000/api/auth/newbie-confirm', {
        method: 'POST',
        body: JSON.stringify({ confirmed: true }),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await newbieConfirmPOST(request);
      const responseData = await response.json();

      expect(mockAuth).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      
      // Verify that fetch was called with ssid
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/newbie/confirm'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer server-session-id-12345'
          })
        })
      );
    });
  });

  describe('Session Validation Failures', () => {
    test('should return 401 when no session exists', async () => {
      // Requirement 2.4: System should handle authentication failures gracefully
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/auth/user-init', {
        method: 'GET'
      });

      const response = await userInitGET(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('No valid session found');
    });

    test('should return 401 when session has no user', async () => {
      mockAuth.mockResolvedValue({ expires: '2024-12-31T23:59:59.999Z' }); // No user

      const request = new NextRequest('http://localhost:3000/api/auth/user-init', {
        method: 'GET'
      });

      const response = await userInitGET(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('No user');
    });

    test('should return 401 when session has no ssid', async () => {
      // Simulate client-side session being used in API route (should not happen)
      mockAuth.mockResolvedValue(mockClientSession); // No ssid

      const request = new NextRequest('http://localhost:3000/api/auth/user-init', {
        method: 'GET'
      });

      const response = await userInitGET(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('No session ID');
    });
  });

  describe('Session Context Verification', () => {
    test('should demonstrate ssid availability difference between contexts', async () => {
      // This test shows the key difference between server and client contexts
      
      // Server context (API route) - ssid available
      mockAuth.mockResolvedValue(mockServerSession);
      
      const serverRequest = new NextRequest('http://localhost:3000/api/auth/session-verify');
      
      // Mock successful backend call
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { valid: true } })
      });
      
      const serverResponse = await sessionVerifyGET(serverRequest);
      const serverData = await serverResponse.json();
      
      expect(serverResponse.status).toBe(200);
      expect(serverData.success).toBe(true);
      
      // Verify ssid was used in API call
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer server-session-id-12345'
          })
        })
      );
      
      // Reset mocks
      jest.clearAllMocks();
      global.fetch.mockClear();
      
      // Client context simulation - ssid not available
      mockAuth.mockResolvedValue(mockClientSession);
      
      const clientRequest = new NextRequest('http://localhost:3000/api/auth/session-verify');
      const clientResponse = await sessionVerifyGET(clientRequest);
      const clientData = await clientResponse.json();
      
      // Should fail due to missing ssid
      expect(clientResponse.status).toBe(401);
      expect(clientData.success).toBe(false);
      expect(clientData.error).toContain('No session ID');
      
      // Should not make backend call without ssid
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling and Logging', () => {
    test('should provide detailed error information for debugging', async () => {
      const sessionWithoutSsid = {
        user: {
          name: 'Test User',
          email: 'test@example.com',
          provider: 'google'
          // Missing ssid
        },
        expires: '2024-12-31T23:59:59.999Z'
      };

      mockAuth.mockResolvedValue(sessionWithoutSsid);

      const request = new NextRequest('http://localhost:3000/api/auth/user-init', {
        method: 'GET'
      });

      const response = await userInitGET(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('No session ID');
      
      // Should include debug information
      if (responseData.debug) {
        expect(responseData.debug.sessionExists).toBe(true);
        expect(responseData.debug.userExists).toBe(true);
        expect(responseData.debug.ssidExists).toBe(false);
        expect(responseData.debug.availableUserKeys).toEqual(['name', 'email', 'provider']);
      }
    });

    test('should handle auth() function errors gracefully', async () => {
      mockAuth.mockRejectedValue(new Error('Auth function failed'));

      const request = new NextRequest('http://localhost:3000/api/auth/user-init', {
        method: 'GET'
      });

      const response = await userInitGET(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('error');
    });
  });

  describe('Backend Integration', () => {
    test('should handle backend authentication failures', async () => {
      mockAuth.mockResolvedValue(mockServerSession);

      // Mock backend returning 401 (invalid ssid)
      global.fetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: () => Promise.resolve('Invalid session')
      });

      const request = new NextRequest('http://localhost:3000/api/auth/user-init', {
        method: 'GET'
      });

      const response = await userInitGET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(false);
      // The API handles backend failures gracefully and returns partial data
    });

    test('should handle backend network errors', async () => {
      mockAuth.mockResolvedValue(mockServerSession);

      // Mock network error
      global.fetch.mockRejectedValue(new Error('Network error'));

      const request = new NextRequest('http://localhost:3000/api/auth/user-init', {
        method: 'GET'
      });

      const response = await userInitGET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(false);
      // The API handles network failures gracefully and returns partial data
    });
  });
});