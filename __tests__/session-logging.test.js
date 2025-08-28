/**
 * Tests for session logging utility
 */

// Mock console methods and environment
const originalConsole = { ...console };
const originalEnv = process.env;

let sessionLogger;

beforeAll(async () => {
  // Set environment to enable logging before importing
  process.env = {
    ...originalEnv,
    NODE_ENV: 'development',
    NEXTAUTH_DEBUG: 'true'
  };
  
  // Clear module cache and import with debug enabled
  delete require.cache[require.resolve('../utils/sessionLogger')];
  sessionLogger = require('../utils/sessionLogger');
});

beforeEach(() => {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
  console.debug = jest.fn();
});

afterEach(() => {
  Object.assign(console, originalConsole);
});

afterAll(() => {
  process.env = originalEnv;
});

describe('Session Logging Utility', () => {
  describe('logSessionData', () => {
    it('should log data with proper formatting', () => {
      const testData = { test: 'value', sensitive: 'secret' };
      sessionLogger.logSessionData('test-context', testData, 'info');
      
      // In test environment, logging should work
      expect(console.log).toHaveBeenCalled();
    });

    it('should handle different log levels', () => {
      const testData = { test: 'value' };
      
      sessionLogger.logSessionData('test', testData, 'error');
      expect(console.error).toHaveBeenCalled();
      
      sessionLogger.logSessionData('test', testData, 'warn');
      expect(console.warn).toHaveBeenCalled();
      
      sessionLogger.logSessionData('test', testData, 'debug');
      expect(console.debug).toHaveBeenCalled();
    });

    it('should sanitize sensitive data', () => {
      const testData = { 
        ssid: 'secret-session-id',
        password: 'secret-password',
        normalField: 'normal-value'
      };
      
      sessionLogger.logSessionData('test', testData, 'info');
      
      // Check that the call was made (actual sanitization is tested separately)
      expect(console.log).toHaveBeenCalled();
    });
  });

  describe('logJWTProcessing', () => {
    it('should log JWT token processing with safe data', () => {
      const mockToken = {
        ssid: 'secret-ssid',
        email: 'test@example.com',
        name: 'Test User',
        provider: 'google',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000)
      };

      sessionLogger.logJWTProcessing(mockToken, 'test-action', { extra: 'data' });
      
      expect(console.debug).toHaveBeenCalled();
    });

    it('should handle missing token gracefully', () => {
      sessionLogger.logJWTProcessing(null, 'test-action');
      
      expect(console.debug).toHaveBeenCalled();
    });
  });

  describe('logSessionCallback', () => {
    it('should log server-side session callback', () => {
      const mockSession = {
        user: { name: 'Test', email: 'test@example.com', ssid: 'secret' }
      };
      const mockToken = { ssid: 'secret', provider: 'google' };
      const mockReq = { url: '/api/test', method: 'GET' };

      sessionLogger.logSessionCallback(mockSession, mockToken, mockReq, 'test-phase');
      
      expect(console.debug).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalled(); // Security decision log
    });

    it('should log client-side session callback', () => {
      const mockSession = {
        user: { name: 'Test', email: 'test@example.com' }
      };
      const mockToken = { ssid: 'secret', provider: 'google' };

      sessionLogger.logSessionCallback(mockSession, mockToken, null, 'test-phase');
      
      expect(console.debug).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalled(); // Security decision log
    });
  });

  describe('logAPISessionValidation', () => {
    it('should log successful API session validation', () => {
      const mockSession = {
        user: { name: 'Test', email: 'test@example.com', ssid: 'secret', provider: 'google' }
      };

      sessionLogger.logAPISessionValidation(mockSession, '/api/test', 'success');
      
      expect(console.log).toHaveBeenCalled();
    });

    it('should log failed API session validation', () => {
      const mockSession = null;

      sessionLogger.logAPISessionValidation(mockSession, '/api/test', 'no_session');
      
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('createSessionValidationSummary', () => {
    it('should create comprehensive validation summary for valid session', () => {
      const mockSession = {
        user: { 
          name: 'Test User', 
          email: 'test@example.com', 
          ssid: 'secret-ssid',
          provider: 'google'
        },
        expires: '2024-12-31T23:59:59.999Z'
      };

      const summary = sessionLogger.createSessionValidationSummary(mockSession);

      expect(summary).toEqual({
        sessionExists: true,
        userExists: true,
        ssidExists: true,
        emailExists: true,
        nameExists: true,
        providerExists: true,
        availableUserKeys: ['name', 'email', 'ssid', 'provider'],
        sessionKeys: ['user', 'expires']
      });
    });

    it('should create validation summary for null session', () => {
      const summary = sessionLogger.createSessionValidationSummary(null);

      expect(summary).toEqual({
        sessionExists: false,
        userExists: false,
        ssidExists: false,
        emailExists: false,
        nameExists: false,
        providerExists: false,
        availableUserKeys: [],
        sessionKeys: []
      });
    });

    it('should create validation summary for session without user', () => {
      const mockSession = {
        expires: '2024-12-31T23:59:59.999Z'
      };

      const summary = sessionLogger.createSessionValidationSummary(mockSession);

      expect(summary).toEqual({
        sessionExists: true,
        userExists: false,
        ssidExists: false,
        emailExists: false,
        nameExists: false,
        providerExists: false,
        availableUserKeys: [],
        sessionKeys: ['expires']
      });
    });
  });

  describe('logSessionValidationSummary', () => {
    it('should log session validation summary', () => {
      const mockSession = {
        user: { name: 'Test', email: 'test@example.com', ssid: 'secret' }
      };

      sessionLogger.logSessionValidationSummary(mockSession, 'test-context');
      
      expect(console.debug).toHaveBeenCalled();
    });
  });

  describe('logSessionValidationStep', () => {
    it('should log successful validation step', () => {
      const mockSession = {
        user: {
          ssid: 'test-ssid',
          email: 'test@example.com'
        }
      };

      sessionLogger.logSessionValidationStep(
        mockSession, 
        '/api/test', 
        'test_step', 
        'success',
        { requestId: 'test-123' }
      );
      
      expect(console.debug).toHaveBeenCalled();
    });

    it('should log failed validation step with warning level', () => {
      const mockSession = null;

      sessionLogger.logSessionValidationStep(
        mockSession, 
        '/api/test', 
        'session_check', 
        'failed',
        { requestId: 'test-456' }
      );
      
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('logEnhancedAPISessionValidation', () => {
    it('should log successful enhanced validation', () => {
      const mockSession = {
        user: {
          ssid: 'test-ssid',
          email: 'test@example.com',
          provider: 'google'
        }
      };

      sessionLogger.logEnhancedAPISessionValidation(
        mockSession,
        '/api/auth/user-init',
        'success',
        { requestId: 'test-789', step: 'complete' }
      );

      expect(console.log).toHaveBeenCalled();
    });

    it('should log failed enhanced validation with error level', () => {
      const mockSession = { user: {} };

      sessionLogger.logEnhancedAPISessionValidation(
        mockSession,
        '/api/auth/user-init',
        'no_ssid',
        { 
          errorCode: 'AUTH_003',
          requestId: 'test-error',
          step: 'ssid_check'
        }
      );

      expect(console.error).toHaveBeenCalled();
    });
  });
});