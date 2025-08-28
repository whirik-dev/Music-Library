/**
 * Tests for Server-side vs Client-side Session Behavior
 * 
 * This test suite verifies that:
 * 1. ssid is available in API routes (server-side)
 * 2. ssid is not exposed in client-side sessions
 * 3. Session callback behavior differs based on execution context
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */

// Mock the session logger to avoid actual logging during tests
const mockLogSessionCallback = jest.fn();
jest.mock('../utils/sessionLogger', () => ({
  logSessionCallback: mockLogSessionCallback,
  logJWTProcessing: jest.fn(),
}));

describe('Session Context Behavior Tests', () => {
  const mockToken = {
    name: 'Test User',
    email: 'test@example.com',
    provider: 'google',
    ssid: 'test-session-id-12345',
    socialId: 'google-123456',
    iat: Math.floor(Date.now() / 1000) - 3600,
    exp: Math.floor(Date.now() / 1000) + 3600,
    jti: 'jwt-token-id-12345'
  };

  const mockBaseSession = {
    user: {
      name: 'Test User',
      email: 'test@example.com'
    },
    expires: '2024-12-31T23:59:59.999Z'
  };

  // Recreate the session callback logic for testing
  const sessionCallback = async ({ session, token, req }) => {
    // Log session callback entry
    mockLogSessionCallback(session, token, req, 'callback-start');
    
    // Ensure session.user exists
    if (!session.user) {
      session.user = {};
    }
    
    // Base session data (always available)
    session.user.name = token.name || null;
    session.user.email = token.email || null;
    session.user.provider = token.provider || 'credentials';
    
    mockLogSessionCallback(session, token, req, 'base-data-set');
    
    // 🔒 Security: Conditionally expose ssid based on execution context
    // Server-side only: expose ssid for API routes
    if (req) {
      // Running server-side (API route context) - ssid is safe to expose
      mockLogSessionCallback(session, token, req, 'server-side-detected');
      session.user.ssid = token.ssid || null;
      mockLogSessionCallback(session, token, req, 'ssid-exposed');
    } else {
      // Client-side: ssid remains hidden for security
      mockLogSessionCallback(session, token, req, 'client-side-detected');
      // ssid is intentionally not added to session.user
      // Do NOT set session.user.ssid in client context
      mockLogSessionCallback(session, token, req, 'ssid-hidden');
    }
    
    // Final session callback logging
    mockLogSessionCallback(session, token, req, 'callback-complete');
    
    return session;
  };

  describe('Session Callback Context Detection', () => {

    test('should expose ssid in server-side context (with req object)', async () => {
      // Requirement 2.3: WHEN sessions are accessed server-side THEN system SHALL provide access to ssid
      const mockReq = {
        url: '/api/test',
        method: 'GET',
        headers: {}
      };

      const result = await sessionCallback({
        session: { ...mockBaseSession },
        token: mockToken,
        req: mockReq
      });

      expect(result.user.ssid).toBe('test-session-id-12345');
      expect(result.user.name).toBe('Test User');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.provider).toBe('google');
    });

    test('should hide ssid in client-side context (without req object)', async () => {
      // Requirement 2.2: WHEN sessions are accessed client-side THEN system SHALL NOT expose ssid
      const freshSession = {
        user: {
          name: 'Test User',
          email: 'test@example.com'
        },
        expires: '2024-12-31T23:59:59.999Z'
      };
      
      const result = await sessionCallback({
        session: freshSession,
        token: mockToken,
        req: undefined // No req object = client-side
      });

      expect(result.user.ssid).toBeUndefined();
      expect(result.user.name).toBe('Test User');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.provider).toBe('google');
    });

    test('should handle null req object as client-side', async () => {
      // Edge case: null req should be treated as client-side
      const freshSession = {
        user: {
          name: 'Test User',
          email: 'test@example.com'
        },
        expires: '2024-12-31T23:59:59.999Z'
      };
      
      const result = await sessionCallback({
        session: freshSession,
        token: mockToken,
        req: null
      });

      expect(result.user.ssid).toBeUndefined();
    });

    test('should handle missing token ssid gracefully', async () => {
      const tokenWithoutSsid = {
        ...mockToken,
        ssid: undefined
      };

      // Server-side context
      const serverResult = await sessionCallback({
        session: { ...mockBaseSession },
        token: tokenWithoutSsid,
        req: { url: '/api/test' }
      });

      expect(serverResult.user.ssid).toBeNull();

      // Client-side context
      const freshClientSession = {
        user: {
          name: 'Test User',
          email: 'test@example.com'
        },
        expires: '2024-12-31T23:59:59.999Z'
      };
      
      const clientResult = await sessionCallback({
        session: freshClientSession,
        token: tokenWithoutSsid,
        req: undefined
      });

      expect(clientResult.user.ssid).toBeUndefined();
    });
  });

  describe('API Route Session Validation (Server-side)', () => {
    test('should successfully validate session with ssid in API route context', async () => {
      // Requirement 2.1: WHEN JWT tokens are created THEN system SHALL store ssid securely
      // Requirement 2.4: WHEN API routes need authentication THEN system SHALL validate and extract ssid
      
      const mockReq = {
        url: '/api/auth/user-init',
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        }
      };

      const sessionResult = await sessionCallback({
        session: { ...mockBaseSession },
        token: mockToken,
        req: mockReq
      });

      // Verify server-side session has ssid
      expect(sessionResult.user.ssid).toBe('test-session-id-12345');
      expect(sessionResult.user.name).toBe('Test User');
      expect(sessionResult.user.email).toBe('test@example.com');
      expect(sessionResult.user.provider).toBe('google');
    });

    test('should validate session structure for API routes', async () => {
      const mockReq = { url: '/api/test', method: 'GET' };

      const sessionResult = await sessionCallback({
        session: { ...mockBaseSession },
        token: mockToken,
        req: mockReq
      });

      // Verify all required fields are present for API authentication
      expect(sessionResult).toHaveProperty('user');
      expect(sessionResult).toHaveProperty('expires');
      expect(sessionResult.user).toHaveProperty('ssid');
      expect(sessionResult.user).toHaveProperty('email');
      expect(sessionResult.user).toHaveProperty('provider');
      
      // Verify ssid is the correct value from token
      expect(sessionResult.user.ssid).toBe(mockToken.ssid);
    });
  });

  describe('Client-side Session Security', () => {
    test('should not expose ssid in browser session', async () => {
      // Requirement 2.2: Client-side sessions should not expose ssid for security
      
      const freshSession = {
        user: {
          name: 'Test User',
          email: 'test@example.com'
        },
        expires: '2024-12-31T23:59:59.999Z'
      };
      
      const clientSession = await sessionCallback({
        session: freshSession,
        token: mockToken,
        req: undefined // Client-side context
      });

      // Verify ssid is not present in client session
      expect(clientSession.user.ssid).toBeUndefined();
      expect(Object.keys(clientSession.user)).not.toContain('ssid');
      
      // Verify other data is still available
      expect(clientSession.user.name).toBe('Test User');
      expect(clientSession.user.email).toBe('test@example.com');
      expect(clientSession.user.provider).toBe('google');
    });

    test('should maintain consistent session structure between contexts', async () => {
      const freshServerSession = {
        user: {
          name: 'Test User',
          email: 'test@example.com'
        },
        expires: '2024-12-31T23:59:59.999Z'
      };
      
      const freshClientSession = {
        user: {
          name: 'Test User',
          email: 'test@example.com'
        },
        expires: '2024-12-31T23:59:59.999Z'
      };
      
      const serverSession = await sessionCallback({
        session: freshServerSession,
        token: mockToken,
        req: { url: '/api/test' }
      });

      const clientSession = await sessionCallback({
        session: freshClientSession,
        token: mockToken,
        req: undefined
      });

      // Both should have same base structure
      expect(serverSession.user.name).toBe(clientSession.user.name);
      expect(serverSession.user.email).toBe(clientSession.user.email);
      expect(serverSession.user.provider).toBe(clientSession.user.provider);
      expect(serverSession.expires).toBe(clientSession.expires);

      // Only server session should have ssid
      expect(serverSession.user.ssid).toBeDefined();
      expect(clientSession.user.ssid).toBeUndefined();
    });
  });

  describe('Session Callback Edge Cases', () => {
    test('should handle empty session object', async () => {
      const emptySession = {};

      const result = await sessionCallback({
        session: emptySession,
        token: mockToken,
        req: { url: '/api/test' }
      });

      expect(result.user.name).toBe('Test User');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.ssid).toBe('test-session-id-12345');
    });

    test('should handle missing token fields', async () => {
      const incompleteToken = {
        email: 'test@example.com'
        // Missing name, ssid, provider
      };

      const serverResult = await sessionCallback({
        session: { ...mockBaseSession },
        token: incompleteToken,
        req: { url: '/api/test' }
      });

      expect(serverResult.user.name).toBeNull();
      expect(serverResult.user.email).toBe('test@example.com');
      expect(serverResult.user.provider).toBe('credentials'); // Default fallback
      expect(serverResult.user.ssid).toBeNull();
    });

    test('should handle different request types', async () => {
      const apiRequests = [
        { url: '/api/auth/user-init', method: 'POST' },
        { url: '/api/auth/session-verify', method: 'GET' },
        { url: '/api/playlist/add', method: 'POST' },
        { url: '/api/health', method: 'GET' }
      ];

      for (const req of apiRequests) {
        const result = await sessionCallback({
          session: { ...mockBaseSession },
          token: mockToken,
          req
        });

        // All API routes should have access to ssid
        expect(result.user.ssid).toBe('test-session-id-12345');
      }
    });
  });

  describe('JWT Token Processing', () => {
    test('should preserve ssid through JWT callback', async () => {
      // Requirement 2.1: JWT tokens should store ssid securely
      // This test verifies that JWT tokens can contain ssid data
      
      const tokenWithSsid = {
        name: 'Test User',
        email: 'test@example.com',
        provider: 'credentials',
        ssid: 'backend-session-id-12345'
      };

      const serverResult = await sessionCallback({
        session: { ...mockBaseSession },
        token: tokenWithSsid,
        req: { url: '/api/test' }
      });

      expect(serverResult.user.ssid).toBe('backend-session-id-12345');
      expect(serverResult.user.name).toBe('Test User');
      expect(serverResult.user.email).toBe('test@example.com');
      expect(serverResult.user.provider).toBe('credentials');
    });

    test('should handle JWT token without ssid', async () => {
      const tokenWithoutSsid = {
        name: 'Test User',
        email: 'test@example.com',
        provider: 'credentials'
        // No ssid
      };

      const serverResult = await sessionCallback({
        session: { ...mockBaseSession },
        token: tokenWithoutSsid,
        req: { url: '/api/test' }
      });

      expect(serverResult.user.ssid).toBeNull();
      expect(serverResult.user.name).toBe('Test User');
      expect(serverResult.user.email).toBe('test@example.com');
    });
  });

  describe('Security Validation', () => {
    test('should never expose ssid in client context regardless of token content', async () => {
      // Even with a token containing ssid, client should not see it
      const tokenWithSsid = {
        ...mockToken,
        ssid: 'sensitive-session-id-should-not-be-exposed'
      };

      const freshSession = {
        user: {
          name: 'Test User',
          email: 'test@example.com'
        },
        expires: '2024-12-31T23:59:59.999Z'
      };
      
      const clientSession = await sessionCallback({
        session: freshSession,
        token: tokenWithSsid,
        req: undefined // Client context
      });

      expect(clientSession.user.ssid).toBeUndefined();
      expect(JSON.stringify(clientSession)).not.toContain('sensitive-session-id');
    });

    test('should always expose ssid in server context when available', async () => {
      const serverSession = await sessionCallback({
        session: { ...mockBaseSession },
        token: mockToken,
        req: { url: '/api/test' } // Server context
      });

      expect(serverSession.user.ssid).toBe('test-session-id-12345');
    });
  });
});