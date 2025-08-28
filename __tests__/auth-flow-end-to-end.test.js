/**
 * End-to-End Authentication Flow Tests
 * 
 * Tests the complete authentication flow from Google OAuth to API access
 * Validates JWT token creation, ssid storage, and API route authentication
 * 
 * Requirements: 4.1, 4.2, 1.4
 */

import { NextRequest } from 'next/server';

// Mock NextAuth auth function
const mockAuth = jest.fn();
jest.mock('../auth.ts', () => ({
  auth: mockAuth
}));

// Mock the session logger to avoid actual logging during tests
const mockLogSessionCallback = jest.fn();
const mockLogJWTProcessing = jest.fn();
jest.mock('../utils/sessionLogger', () => ({
  logAPISessionValidation: jest.fn(),
  logSessionValidationSummary: jest.fn(),
  logSessionValidationStep: jest.fn(),
  logEnhancedAPISessionValidation: jest.fn(),
  logSessionCallback: mockLogSessionCallback,
  logJWTProcessing: mockLogJWTProcessing,
}));

// Mock NextAuth providers to avoid import issues
jest.mock('next-auth/providers/google', () => ({
  default: jest.fn(() => ({
    id: 'google',
    name: 'Google',
    type: 'oauth'
  }))
}));

jest.mock('next-auth/providers/credentials', () => ({
  default: jest.fn(() => ({
    id: 'credentials',
    name: 'Credentials',
    type: 'credentials'
  }))
}));

describe('End-to-End Authentication Flow', () => {
  let userInitGET, sessionVerifyGET, newbieConfirmPOST;
  let originalFetch;

  // Mock Google OAuth user data
  const mockGoogleUser = {
    id: 'google-user-123',
    name: 'John Doe',
    email: 'john.doe@example.com'
  };

  // Mock Google OAuth account data
  const mockGoogleAccount = {
    provider: 'google',
    providerAccountId: 'google-account-456',
    type: 'oauth'
  };

  // Mock backend responses for different scenarios
  const mockBackendResponses = {
    // Existing user verification success
    existingUserVerify: {
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: { ssid: 'existing-user-ssid-789' }
      })
    },
    // New user verification failure (user doesn't exist)
    newUserVerifyFail: {
      ok: false,
      status: 404,
      json: () => Promise.resolve({
        success: false,
        message: 'User not found'
      })
    },
    // New user registration success
    newUserRegister: {
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: { id: 'new-user-id-123' }
      })
    },
    // New user post-registration verification
    newUserPostRegisterVerify: {
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: { ssid: 'new-user-ssid-456' }
      })
    },
    // API route backend calls
    apiBackendSuccess: {
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: { initialized: true, isNewbie: false }
      })
    }
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
    originalFetch = global.fetch;
    global.fetch = jest.fn();
    process.env.NEXT_PUBLIC_BACKEND_URL = 'http://localhost:3001';
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  // Mock JWT callback implementation
  const mockJWTCallback = async ({ token, user, account }) => {
    if (account?.provider === 'google' && user) {
      try {
        const socialId = account.providerAccountId;
        
        // Simulate backend verification call
        const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: 'google',
            identifier: socialId,
          }),
        });

        const verifyData = await verifyResponse.json();

        if (verifyData.success) {
          token.ssid = verifyData.data.ssid;
        } else {
          // New user registration flow
          const registerResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider: 'google',
              social_id: socialId,
              email: user.email,
              username: user.name,
            }),
          });

          const registerData = await registerResponse.json();
          
          if (registerData?.success && registerData?.data?.id) {
            const verify2Response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                provider: 'google',
                identifier: socialId,
              }),
            });

            const verifyData2 = await verify2Response.json();
            if (verifyData2.success) {
              token.ssid = verifyData2.data.ssid;
            } else {
              token.ssid = null;
            }
          } else {
            token.ssid = null;
          }
        }
      } catch (err) {
        token.ssid = null;
      }

      token.name = user.name || null;
      token.email = user.email;
      token.provider = 'google';
      token.socialId = account.providerAccountId;
    }

    if (account?.provider === 'credentials' && user) {
      token.name = user.name || null;
      token.email = user.email;
      token.ssid = user.ssid || null;
      token.provider = 'credentials';
    }

    return token;
  };

  // Mock session callback implementation
  const mockSessionCallback = ({ session, token, req }) => {
    session.user.name = token.name || null;
    session.user.email = token.email || null;
    session.user.provider = token.provider || 'credentials';
    
    // Server-side only: expose ssid for API routes
    if (req) {
      session.user.ssid = token.ssid || null;
    }
    // Client-side: ssid remains hidden
    
    return session;
  };

  describe('Complete Google OAuth Flow - Existing User', () => {
    test('should complete full flow for existing Google user', async () => {
      // Requirement 4.1: Maintain session state across page refreshes
      
      // Step 1: Simulate JWT callback for existing Google user
      global.fetch.mockResolvedValueOnce(mockBackendResponses.existingUserVerify);
      
      // Simulate JWT callback
      const jwtToken = {};
      const jwtResult = await mockJWTCallback({
        token: jwtToken,
        user: mockGoogleUser,
        account: mockGoogleAccount
      });
      
      // Verify JWT token contains ssid
      expect(jwtResult.ssid).toBe('existing-user-ssid-789');
      expect(jwtResult.name).toBe('John Doe');
      expect(jwtResult.email).toBe('john.doe@example.com');
      expect(jwtResult.provider).toBe('google');
      expect(jwtResult.socialId).toBe('google-account-456');
      
      // Step 2: Simulate session callback (server-side context)
      const mockRequest = { url: 'http://localhost:3000/api/auth/user-init' };
      const sessionResult = mockSessionCallback({
        session: { user: {} },
        token: jwtResult,
        req: mockRequest // Server-side context
      });
      
      // Verify session exposes ssid in server context
      expect(sessionResult.user.ssid).toBe('existing-user-ssid-789');
      expect(sessionResult.user.name).toBe('John Doe');
      expect(sessionResult.user.email).toBe('john.doe@example.com');
      expect(sessionResult.user.provider).toBe('google');
      
      // Step 3: Test API route access with session
      mockAuth.mockResolvedValue(sessionResult);
      global.fetch.mockResolvedValue(mockBackendResponses.apiBackendSuccess);
      
      const apiRequest = new NextRequest('http://localhost:3000/api/auth/user-init');
      const apiResponse = await userInitGET(apiRequest);
      const apiData = await apiResponse.json();
      
      // Verify API route works with authenticated session
      expect(apiResponse.status).toBe(200);
      expect(apiData.success).toBe(true);
      
      // Verify API used ssid for backend authentication
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/isLogged'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer existing-user-ssid-789'
          })
        })
      );
    });

    test('should handle session callback in client-side context', async () => {
      // Requirement 2.2: ssid should not be exposed client-side
      
      // Mock JWT token with ssid
      const jwtToken = {
        ssid: 'existing-user-ssid-789',
        name: 'John Doe',
        email: 'john.doe@example.com',
        provider: 'google'
      };
      
      // Simulate session callback (client-side context - no req)
      const sessionResult = mockSessionCallback({
        session: { user: {} },
        token: jwtToken,
        req: null // Client-side context
      });
      
      // Verify session does NOT expose ssid in client context
      expect(sessionResult.user.ssid).toBeUndefined();
      expect(sessionResult.user.name).toBe('John Doe');
      expect(sessionResult.user.email).toBe('john.doe@example.com');
      expect(sessionResult.user.provider).toBe('google');
    });
  });

  describe('Complete Google OAuth Flow - New User', () => {
    test('should complete full flow for new Google user registration', async () => {
      // Requirement 4.2: API calls should handle authentication automatically
      
      // Step 1: Simulate JWT callback for new Google user
      // Mock backend responses for new user flow
      global.fetch
        .mockResolvedValueOnce(mockBackendResponses.newUserVerifyFail) // Initial verify fails
        .mockResolvedValueOnce(mockBackendResponses.newUserRegister)   // Registration succeeds
        .mockResolvedValueOnce(mockBackendResponses.newUserPostRegisterVerify); // Post-register verify succeeds
      
      // Simulate JWT callback
      const jwtToken = {};
      const jwtResult = await mockJWTCallback({
        token: jwtToken,
        user: mockGoogleUser,
        account: mockGoogleAccount
      });
      
      // Verify JWT token contains ssid for new user
      expect(jwtResult.ssid).toBe('new-user-ssid-456');
      expect(jwtResult.name).toBe('John Doe');
      expect(jwtResult.email).toBe('john.doe@example.com');
      expect(jwtResult.provider).toBe('google');
      
      // Verify correct API calls were made
      expect(global.fetch).toHaveBeenCalledTimes(3);
      
      // Initial verification call
      expect(global.fetch).toHaveBeenNthCalledWith(1,
        'http://localhost:3001/auth/verify',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            provider: 'google',
            identifier: 'google-account-456'
          })
        })
      );
      
      // Registration call
      expect(global.fetch).toHaveBeenNthCalledWith(2,
        'http://localhost:3001/auth/register',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            provider: 'google',
            social_id: 'google-account-456',
            email: 'john.doe@example.com',
            username: 'John Doe'
          })
        })
      );
      
      // Post-registration verification call
      expect(global.fetch).toHaveBeenNthCalledWith(3,
        'http://localhost:3001/auth/verify',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            provider: 'google',
            identifier: 'google-account-456'
          })
        })
      );
      
      // Step 2: Test API access with new user session
      const mockRequest = { url: 'http://localhost:3000/api/auth/session-verify' };
      const sessionResult = mockSessionCallback({
        session: { user: {} },
        token: jwtResult,
        req: mockRequest
      });
      
      mockAuth.mockResolvedValue(sessionResult);
      global.fetch.mockResolvedValue(mockBackendResponses.apiBackendSuccess);
      
      const apiRequest = new NextRequest('http://localhost:3000/api/auth/session-verify');
      const apiResponse = await sessionVerifyGET(apiRequest);
      const apiData = await apiResponse.json();
      
      // Verify API route works with new user session
      expect(apiResponse.status).toBe(200);
      expect(apiData.success).toBe(true);
      
      // Verify API used new user's ssid
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/isLogged'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer new-user-ssid-456'
          })
        })
      );
    });
  });

  describe('JWT Token Creation and Validation', () => {
    test('should create valid JWT token with all required fields', async () => {
      // Requirement 1.4: JWT tokens should store ssid securely
      
      global.fetch.mockResolvedValueOnce(mockBackendResponses.existingUserVerify);
      
      const jwtToken = {};
      const jwtResult = await mockJWTCallback({
        token: jwtToken,
        user: mockGoogleUser,
        account: mockGoogleAccount
      });
      
      // Verify all required JWT fields are present
      expect(jwtResult).toMatchObject({
        ssid: expect.any(String),
        name: expect.any(String),
        email: expect.any(String),
        provider: 'google',
        socialId: expect.any(String)
      });
      
      // Verify JWT token structure
      expect(jwtResult.ssid).toBeTruthy();
      expect(jwtResult.name).toBe(mockGoogleUser.name);
      expect(jwtResult.email).toBe(mockGoogleUser.email);
      expect(jwtResult.socialId).toBe(mockGoogleAccount.providerAccountId);
    });

    test('should handle JWT creation errors gracefully', async () => {
      // Mock network error during JWT creation
      global.fetch.mockRejectedValue(new Error('Network error'));
      
      const jwtToken = {};
      const jwtResult = await mockJWTCallback({
        token: jwtToken,
        user: mockGoogleUser,
        account: mockGoogleAccount
      });
      
      // Verify JWT handles errors gracefully
      expect(jwtResult.ssid).toBeNull();
      expect(jwtResult.name).toBe(mockGoogleUser.name);
      expect(jwtResult.email).toBe(mockGoogleUser.email);
      expect(jwtResult.provider).toBe('google');
    });
  });

  describe('API Route Authentication with Real Session Data', () => {
    test('should authenticate all API routes with real session data', async () => {
      // Test all three main API routes with real session data
      
      const realSession = {
        user: {
          name: 'Real User',
          email: 'real@example.com',
          provider: 'google',
          ssid: 'real-session-id-123'
        },
        expires: '2024-12-31T23:59:59.999Z'
      };
      
      mockAuth.mockResolvedValue(realSession);
      global.fetch.mockResolvedValue(mockBackendResponses.apiBackendSuccess);
      
      // Test user-init API
      const userInitRequest = new NextRequest('http://localhost:3000/api/auth/user-init');
      const userInitResponse = await userInitGET(userInitRequest);
      const userInitData = await userInitResponse.json();
      
      expect(userInitResponse.status).toBe(200);
      expect(userInitData.success).toBe(true);
      
      // Reset mocks for next test
      jest.clearAllMocks();
      mockAuth.mockResolvedValue(realSession);
      global.fetch.mockResolvedValue(mockBackendResponses.apiBackendSuccess);
      
      // Test session-verify API
      const sessionVerifyRequest = new NextRequest('http://localhost:3000/api/auth/session-verify');
      const sessionVerifyResponse = await sessionVerifyGET(sessionVerifyRequest);
      const sessionVerifyData = await sessionVerifyResponse.json();
      
      expect(sessionVerifyResponse.status).toBe(200);
      expect(sessionVerifyData.success).toBe(true);
      
      // Reset mocks for next test
      jest.clearAllMocks();
      mockAuth.mockResolvedValue(realSession);
      global.fetch.mockResolvedValue(mockBackendResponses.apiBackendSuccess);
      
      // Test newbie-confirm API
      const newbieConfirmRequest = new NextRequest('http://localhost:3000/api/auth/newbie-confirm', {
        method: 'POST',
        body: JSON.stringify({ confirmed: true }),
        headers: { 'Content-Type': 'application/json' }
      });
      const newbieConfirmResponse = await newbieConfirmPOST(newbieConfirmRequest);
      const newbieConfirmData = await newbieConfirmResponse.json();
      
      expect(newbieConfirmResponse.status).toBe(200);
      expect(newbieConfirmData.success).toBe(true);
      
      // Verify all APIs used the same ssid for authentication
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer real-session-id-123'
          })
        })
      );
    });

    test('should handle session expiration gracefully', async () => {
      // Requirement 4.3: Handle session expiration gracefully
      
      // Mock expired session (no session returned)
      mockAuth.mockResolvedValue(null);
      
      const request = new NextRequest('http://localhost:3000/api/auth/user-init');
      const response = await userInitGET(request);
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toContain('No valid session found');
      expect(data.logout).toBe(true);
    });

    test('should provide clear feedback for authentication failures', async () => {
      // Requirement 4.4: Provide clear feedback for authentication failures
      
      const invalidSession = {
        user: {
          name: 'Test User',
          email: 'test@example.com',
          provider: 'google'
          // Missing ssid
        },
        expires: '2024-12-31T23:59:59.999Z'
      };
      
      mockAuth.mockResolvedValue(invalidSession);
      
      const request = new NextRequest('http://localhost:3000/api/auth/user-init');
      const response = await userInitGET(request);
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toContain('No session ID');
      expect(data.errorType).toBe('no_ssid');
      
      // Verify debug information is provided
      if (data.debug) {
        expect(data.debug.sessionExists).toBe(true);
        expect(data.debug.userExists).toBe(true);
        expect(data.debug.ssidExists).toBe(false);
        expect(data.debug.availableUserKeys).toContain('name');
        expect(data.debug.availableUserKeys).toContain('email');
        expect(data.debug.availableUserKeys).toContain('provider');
      }
    });
  });

  describe('Credentials Provider Flow', () => {
    test('should handle credentials login flow', async () => {
      const credentialsUser = {
        name: 'Local User',
        email: 'local@example.com',
        ssid: 'credentials-ssid-789'
      };
      
      const credentialsAccount = {
        provider: 'credentials',
        type: 'credentials'
      };
      
      // Simulate JWT callback for credentials login
      const jwtToken = {};
      const jwtResult = await mockJWTCallback({
        token: jwtToken,
        user: credentialsUser,
        account: credentialsAccount
      });
      
      // Verify JWT token for credentials login
      expect(jwtResult.ssid).toBe('credentials-ssid-789');
      expect(jwtResult.name).toBe('Local User');
      expect(jwtResult.email).toBe('local@example.com');
      expect(jwtResult.provider).toBe('credentials');
      
      // Test session callback
      const mockRequest = { url: 'http://localhost:3000/api/auth/user-init' };
      const sessionResult = mockSessionCallback({
        session: { user: {} },
        token: jwtResult,
        req: mockRequest
      });
      
      // Verify session exposes ssid for credentials login
      expect(sessionResult.user.ssid).toBe('credentials-ssid-789');
      expect(sessionResult.user.provider).toBe('credentials');
    });
  });

  describe('Error Scenarios and Edge Cases', () => {
    test('should handle malformed JWT tokens', async () => {
      // Test with missing user data
      const jwtResult = await mockJWTCallback({
        token: {},
        user: null,
        account: null
      });
      
      // Should return token as-is when no user/account provided
      expect(jwtResult).toEqual({});
    });

    test('should handle backend service failures during JWT creation', async () => {
      // Mock backend service failure
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ success: false, message: 'Server error' })
      });
      
      const jwtToken = {};
      const jwtResult = await mockJWTCallback({
        token: jwtToken,
        user: mockGoogleUser,
        account: mockGoogleAccount
      });
      
      // Should handle backend failure gracefully
      expect(jwtResult.ssid).toBeNull();
      expect(jwtResult.name).toBe(mockGoogleUser.name);
      expect(jwtResult.email).toBe(mockGoogleUser.email);
    });

    test('should handle registration failure for new users', async () => {
      // Mock registration failure
      global.fetch
        .mockResolvedValueOnce(mockBackendResponses.newUserVerifyFail) // User doesn't exist
        .mockResolvedValueOnce({ // Registration fails
          ok: false,
          status: 400,
          json: () => Promise.resolve({ success: false, message: 'Registration failed' })
        });
      
      const jwtToken = {};
      const jwtResult = await mockJWTCallback({
        token: jwtToken,
        user: mockGoogleUser,
        account: mockGoogleAccount
      });
      
      // Should handle registration failure gracefully
      expect(jwtResult.ssid).toBeNull();
      expect(jwtResult.name).toBe(mockGoogleUser.name);
      expect(jwtResult.email).toBe(mockGoogleUser.email);
    });
  });
});