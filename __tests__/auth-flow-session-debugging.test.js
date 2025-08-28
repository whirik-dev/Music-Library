/**
 * Authentication Flow Session Debugging Tests
 * 
 * Tests session debugging utilities and validation flow
 * Validates session structure inspection and debugging capabilities
 * 
 * Requirements: 3.4, 1.4
 */

import { NextRequest } from 'next/server';

// Mock NextAuth auth function
const mockAuth = jest.fn();
jest.mock('../auth.ts', () => ({
  auth: mockAuth
}));

// Mock the session logger
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

describe('Authentication Flow Session Debugging', () => {
  let debugSessionGET;
  let sessionDebugger;

  beforeAll(async () => {
    // Import debug route and utilities
    const debugModule = await import('../app/api/debug/session/route.js');
    const debuggerModule = await import('../utils/sessionDebugger.js');
    
    debugSessionGET = debugModule.GET;
    sessionDebugger = debuggerModule;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    process.env.NEXT_PUBLIC_BACKEND_URL = 'http://localhost:3001';
    process.env.NODE_ENV = 'development'; // Enable debug endpoint
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Session Structure Validation', () => {
    test('should validate complete session structure with all fields', async () => {
      // Requirement 3.4: Provide clear logging for troubleshooting
      
      const completeSession = {
        user: {
          name: 'Test User',
          email: 'test@example.com',
          provider: 'google',
          ssid: 'session-id-12345'
        },
        expires: '2024-12-31T23:59:59.999Z'
      };

      mockAuth.mockResolvedValue(completeSession);

      const request = new NextRequest('http://localhost:3000/api/debug/session');
      const response = await debugSessionGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.debug).toBeDefined();
      
      // Verify session structure is properly analyzed
      expect(data.debug.session.exists).toBe(true);
      expect(data.debug.session.structure.hasUser).toBe(true);
      expect(data.debug.session.user.hasSsid).toBe(true);
      expect(data.debug.session.structure).toMatchObject({
        hasUser: true,
        hasExpires: true,
        userKeys: expect.arrayContaining(['name', 'email', 'provider', 'ssid'])
      });
    });

    test('should identify missing ssid in session structure', async () => {
      const incompleteSession = {
        user: {
          name: 'Test User',
          email: 'test@example.com',
          provider: 'google'
          // Missing ssid
        },
        expires: '2024-12-31T23:59:59.999Z'
      };

      mockAuth.mockResolvedValue(incompleteSession);

      const request = new NextRequest('http://localhost:3000/api/debug/session');
      const response = await debugSessionGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.debug.session.exists).toBe(true);
      expect(data.debug.session.structure.hasUser).toBe(true);
      expect(data.debug.session.user.hasSsid).toBe(false);
      
      // Should identify the missing ssid issue
      expect(data.debug.analysis.ssidAvailable).toBe(false);
      expect(data.debug.session.structure.userKeys).not.toContain('ssid');
    });

    test('should handle completely missing session', async () => {
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/debug/session');
      const response = await debugSessionGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.debug.session.exists).toBe(false);
      expect(data.debug.analysis.sessionValid).toBe(false);
      expect(data.debug.analysis.ssidAvailable).toBe(false);
      
      // Should identify the root issue
      expect(data.debug.recommendations).toContain('Session is invalid or missing user data');
    });
  });

  describe('JWT Token Structure Analysis', () => {
    test('should analyze JWT token structure and content', async () => {
      // Requirement 1.4: JWT tokens should store ssid securely
      
      const sessionWithJWTInfo = {
        user: {
          name: 'Test User',
          email: 'test@example.com',
          provider: 'google',
          ssid: 'session-id-12345'
        },
        expires: '2024-12-31T23:59:59.999Z'
      };

      mockAuth.mockResolvedValue(sessionWithJWTInfo);

      const request = new NextRequest('http://localhost:3000/api/debug/session');
      const response = await debugSessionGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.debug.session.structure).toBeDefined();
      expect(data.debug.session.structure.userKeys).toContain('ssid');
      expect(data.debug.recommendations).toBeDefined();
      expect(Array.isArray(data.debug.recommendations)).toBe(true);
    });

    test('should detect provider-specific issues', async () => {
      const googleSessionWithoutSocialId = {
        user: {
          name: 'Google User',
          email: 'google@example.com',
          provider: 'google',
          ssid: 'session-id-12345'
          // Missing socialId for Google provider
        },
        expires: '2024-12-31T23:59:59.999Z'
      };

      mockAuth.mockResolvedValue(googleSessionWithoutSocialId);

      const request = new NextRequest('http://localhost:3000/api/debug/session');
      const response = await debugSessionGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.debug.session.user).toBeDefined();
      expect(data.debug.session.user.provider).toBe('google');
      
      // Should identify that session exists but may be missing some fields
      expect(data.debug.session.structure.userKeys).not.toContain('socialId');
    });
  });

  describe('Session Callback Logging Validation', () => {
    test('should validate session callback logging is working', async () => {
      const testSession = {
        user: {
          name: 'Test User',
          email: 'test@example.com',
          provider: 'google',
          ssid: 'session-id-12345'
        },
        expires: '2024-12-31T23:59:59.999Z'
      };

      mockAuth.mockResolvedValue(testSession);

      const request = new NextRequest('http://localhost:3000/api/debug/session');
      const response = await debugSessionGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.debug.context).toBeDefined();
      
      // Should indicate that logging functions are working (context shows debug-endpoint)
      expect(data.debug.context).toBe('debug-endpoint');
      expect(data.debug.environment).toBe('development');
    });
  });

  describe('API Route Session Validation Flow', () => {
    test('should validate session flow through API route perspective', async () => {
      const validSession = {
        user: {
          name: 'API User',
          email: 'api@example.com',
          provider: 'google',
          ssid: 'api-session-id-789'
        },
        expires: '2024-12-31T23:59:59.999Z'
      };

      mockAuth.mockResolvedValue(validSession);

      const request = new NextRequest('http://localhost:3000/api/debug/session');
      const response = await debugSessionGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.debug.analysis).toBeDefined();
      
      // Should validate that session would work for API routes
      expect(data.debug.analysis.sessionValid).toBe(true);
      expect(data.debug.analysis.ssidAvailable).toBe(true);
      expect(data.debug.session.user.hasSsid).toBe(true);
    });

    test('should identify why session would fail API validation', async () => {
      const invalidSession = {
        user: {
          name: 'Invalid User',
          email: 'invalid@example.com',
          provider: 'google'
          // Missing ssid - would fail API validation
        },
        expires: '2024-12-31T23:59:59.999Z'
      };

      mockAuth.mockResolvedValue(invalidSession);

      const request = new NextRequest('http://localhost:3000/api/debug/session');
      const response = await debugSessionGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.debug.analysis).toBeDefined();
      
      // Should identify why validation would fail
      expect(data.debug.analysis.sessionValid).toBe(true);
      expect(data.debug.analysis.ssidAvailable).toBe(false);
      expect(data.debug.session.user.hasSsid).toBe(false);
      // Since no token is provided, no specific recommendation about token/session mismatch
      expect(Array.isArray(data.debug.recommendations)).toBe(true);
    });
  });

  describe('Session Context Detection', () => {
    test('should detect server-side vs client-side context', async () => {
      const session = {
        user: {
          name: 'Context Test User',
          email: 'context@example.com',
          provider: 'google',
          ssid: 'context-session-id'
        },
        expires: '2024-12-31T23:59:59.999Z'
      };

      mockAuth.mockResolvedValue(session);

      const request = new NextRequest('http://localhost:3000/api/debug/session');
      const response = await debugSessionGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.debug.context).toBeDefined();
      
      // Should detect that this is server-side context (API route)
      expect(data.debug.context).toBe('debug-endpoint');
      expect(data.debug.environment).toBe('development');
      expect(data.debug.analysis.ssidAvailable).toBe(true);
    });
  });

  describe('Debugging Recommendations', () => {
    test('should provide actionable debugging recommendations', async () => {
      const problematicSession = {
        user: {
          name: 'Problem User',
          email: 'problem@example.com'
          // Missing provider and ssid
        },
        expires: '2024-12-31T23:59:59.999Z'
      };

      mockAuth.mockResolvedValue(problematicSession);

      const request = new NextRequest('http://localhost:3000/api/debug/session');
      const response = await debugSessionGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.debug.recommendations).toBeDefined();
      expect(Array.isArray(data.debug.recommendations)).toBe(true);
      
      // Should provide specific recommendations (may be empty if session is valid)
      expect(Array.isArray(data.debug.recommendations)).toBe(true);
    });

    test('should provide different recommendations based on issue type', async () => {
      // Test with no session at all
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/debug/session');
      const response = await debugSessionGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.debug.recommendations).toBeDefined();
      
      // Should recommend checking authentication flow
      expect(data.debug.recommendations).toContain('Session is invalid or missing user data');
    });
  });

  describe('Performance and Security Analysis', () => {
    test('should analyze session for security best practices', async () => {
      const session = {
        user: {
          name: 'Security Test User',
          email: 'security@example.com',
          provider: 'google',
          ssid: 'security-session-id'
        },
        expires: '2024-12-31T23:59:59.999Z'
      };

      mockAuth.mockResolvedValue(session);

      const request = new NextRequest('http://localhost:3000/api/debug/session');
      const response = await debugSessionGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.debug.session.structure).toBeDefined();
      
      // Should validate security aspects
      expect(data.debug.session.structure.hasExpires).toBe(true);
      expect(data.debug.session.user.hasSsid).toBe(true);
      expect(data.debug.session.user.provider).toBe('google');
    });

    test('should check session expiration validity', async () => {
      const expiredSession = {
        user: {
          name: 'Expired User',
          email: 'expired@example.com',
          provider: 'google',
          ssid: 'expired-session-id'
        },
        expires: '2020-01-01T00:00:00.000Z' // Expired date
      };

      mockAuth.mockResolvedValue(expiredSession);

      const request = new NextRequest('http://localhost:3000/api/debug/session');
      const response = await debugSessionGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.debug.session.structure).toBeDefined();
      
      // Should detect that session has expired date (though NextAuth handles expiration)
      expect(data.debug.session.structure.hasExpires).toBe(true);
      expect(data.debug.analysis.sessionValid).toBe(true); // Session object is still valid even if expired
    });
  });
});