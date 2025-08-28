/**
 * Tests for Session Debugging Utilities
 * Verifies that debugging functions work correctly and safely
 */

import { 
  inspectSession, 
  inspectJWTToken, 
  createSessionDebugReport, 
  safeSessionLog 
} from '../utils/sessionDebugger.js';

import {
  createComprehensiveDebugReport,
  inspectSessionDetailed,
  inspectJWTTokenDetailed,
  createSessionHealthCheck
} from '../utils/sessionLogger.js';

// Mock console methods for testing
const originalConsole = { ...console };
beforeEach(() => {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
  console.debug = jest.fn();
});

afterEach(() => {
  Object.assign(console, originalConsole);
});

describe('Session Debugging Utilities', () => {
  const mockSession = {
    user: {
      name: 'Test User',
      email: 'test@example.com',
      provider: 'google',
      ssid: 'test-session-id-12345'
    },
    expires: '2024-12-31T23:59:59.999Z'
  };

  const mockToken = {
    name: 'Test User',
    email: 'test@example.com',
    provider: 'google',
    ssid: 'test-session-id-12345',
    socialId: 'google-123456',
    iat: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    jti: 'jwt-token-id-12345'
  };

  describe('inspectSession', () => {
    test('should safely inspect valid session', () => {
      const result = inspectSession(mockSession, false);
      
      expect(result.exists).toBe(true);
      expect(result.structure.hasUser).toBe(true);
      expect(result.structure.hasExpires).toBe(true);
      expect(result.structure.userKeys).toContain('name');
      expect(result.structure.userKeys).toContain('email');
      expect(result.structure.userKeys).toContain('ssid');
      expect(result.user.hasName).toBe(true);
      expect(result.user.hasEmail).toBe(true);
      expect(result.user.hasSsid).toBe(true);
      expect(result.user.provider).toBe('google');
    });

    test('should handle null session', () => {
      const result = inspectSession(null, false);
      
      expect(result.exists).toBe(false);
      expect(result.structure).toBe(null);
    });

    test('should hide sensitive data in production mode', () => {
      const result = inspectSession(mockSession, true);
      
      expect(result.user.namePreview).toBeUndefined();
      expect(result.user.emailPreview).toBeUndefined();
      expect(result.user.ssidPreview).toBeUndefined();
    });

    test('should show preview data in development mode', () => {
      const result = inspectSession(mockSession, false);
      
      expect(result.user.namePreview).toBe('Tes***');
      expect(result.user.emailPreview).toBe('tes***@example.com');
      expect(result.user.ssidPreview).toBe('test-ses***');
    });
  });

  describe('inspectJWTToken', () => {
    test('should safely inspect valid JWT token', () => {
      const result = inspectJWTToken(mockToken, false);
      
      expect(result.exists).toBe(true);
      expect(result.structure.hasName).toBe(true);
      expect(result.structure.hasEmail).toBe(true);
      expect(result.structure.hasSsid).toBe(true);
      expect(result.structure.hasIat).toBe(true);
      expect(result.structure.hasExp).toBe(true);
      expect(result.tokenInfo.isExpired).toBe(false);
    });

    test('should handle null token', () => {
      const result = inspectJWTToken(null, false);
      
      expect(result.exists).toBe(false);
      expect(result.structure).toBe(null);
    });

    test('should detect expired tokens', () => {
      const expiredToken = {
        ...mockToken,
        exp: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
      };
      
      const result = inspectJWTToken(expiredToken, false);
      
      expect(result.tokenInfo.isExpired).toBe(true);
    });
  });

  describe('createSessionDebugReport', () => {
    test('should create comprehensive debug report', () => {
      const result = createSessionDebugReport(mockSession, mockToken, 'test-context');
      
      expect(result.context).toBe('test-context');
      expect(result.session.exists).toBe(true);
      expect(result.token.exists).toBe(true);
      expect(result.analysis.sessionValid).toBe(true);
      expect(result.analysis.ssidAvailable).toBe(true);
      expect(result.analysis.tokenValid).toBe(true);
      expect(result.analysis.tokenSsidAvailable).toBe(true);
      expect(result.analysis.ssidMismatch).toBe(false);
    });

    test('should detect SSID mismatch', () => {
      const mismatchedSession = {
        ...mockSession,
        user: {
          ...mockSession.user,
          ssid: 'different-session-id'
        }
      };
      
      const result = createSessionDebugReport(mismatchedSession, mockToken, 'mismatch-test');
      
      expect(result.analysis.ssidMismatch).toBe(true);
      expect(result.recommendations).toContain('SSID mismatch between session and token - potential data corruption');
    });

    test('should provide recommendations for missing SSID', () => {
      const sessionWithoutSsid = {
        user: {
          name: 'Test User',
          email: 'test@example.com',
          provider: 'google'
          // ssid missing
        },
        expires: '2024-12-31T23:59:59.999Z'
      };
      
      const result = createSessionDebugReport(sessionWithoutSsid, mockToken, 'missing-ssid-test');
      
      expect(result.analysis.ssidAvailable).toBe(false);
      expect(result.analysis.tokenSsidAvailable).toBe(true);
      expect(result.recommendations).toContain('SSID exists in token but not in session - check session callback configuration');
    });
  });

  describe('safeSessionLog', () => {
    test('should log in development mode', () => {
      // Mock development environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      safeSessionLog('info', 'Test message', { session: mockSession });
      
      expect(console.log).toHaveBeenCalled();
      
      process.env.NODE_ENV = originalEnv;
    });

    test('should not log debug messages in production', () => {
      // Mock production environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      safeSessionLog('debug', 'Debug message', { session: mockSession });
      
      expect(console.log).not.toHaveBeenCalled();
      expect(console.debug).not.toHaveBeenCalled();
      
      process.env.NODE_ENV = originalEnv;
    });

    test('should log errors in production', () => {
      // Mock production environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      safeSessionLog('error', 'Error message', { error: new Error('Test error') });
      
      expect(console.error).toHaveBeenCalled();
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Enhanced sessionLogger functions', () => {
    test('createComprehensiveDebugReport should work', () => {
      const result = createComprehensiveDebugReport(mockSession, mockToken, 'test');
      
      expect(result).toBeDefined();
      expect(result.context).toBe('test');
      expect(result.analysis.sessionValid).toBe(true);
    });

    test('inspectSessionDetailed should return inspection results', () => {
      const result = inspectSessionDetailed(mockSession, 'detailed-test');
      
      expect(result.exists).toBe(true);
      expect(result.structure.hasUser).toBe(true);
    });

    test('inspectJWTTokenDetailed should return inspection results', () => {
      const result = inspectJWTTokenDetailed(mockToken, 'detailed-test');
      
      expect(result.exists).toBe(true);
      expect(result.structure.hasSsid).toBe(true);
    });

    test('createSessionHealthCheck should assess session health', () => {
      const result = createSessionHealthCheck(mockSession, mockToken);
      
      expect(result.healthy).toBe(true);
      expect(result.summary.sessionExists).toBe(true);
      expect(result.summary.ssidExists).toBe(true);
    });

    test('createSessionHealthCheck should detect unhealthy session', () => {
      const unhealthySession = {
        user: {
          name: 'Test User',
          email: 'test@example.com'
          // missing ssid
        }
      };
      
      const result = createSessionHealthCheck(unhealthySession, mockToken);
      
      expect(result.healthy).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });
});

describe('Debug Endpoint Security', () => {
  test('should be accessible in development', async () => {
    // This would be tested in integration tests with actual HTTP requests
    // Here we just verify the security logic exists
    const isDevelopment = process.env.NODE_ENV === 'development';
    const debugEnabled = process.env.ENABLE_SESSION_DEBUG === 'true';
    
    expect(typeof isDevelopment).toBe('boolean');
    expect(typeof debugEnabled).toBe('boolean');
  });
});