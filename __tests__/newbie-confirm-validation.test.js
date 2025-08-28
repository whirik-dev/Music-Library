/**
 * Test for newbie-confirm API route enhanced validation
 */

import { POST } from '../app/api/auth/newbie-confirm/route.js';
import { auth } from '../auth';

// Mock NextAuth
jest.mock('../auth', () => ({
    auth: jest.fn()
}));

// Mock environment variables
const originalEnv = process.env;

describe('/api/auth/newbie-confirm Enhanced Validation Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv };
        process.env.NEXT_PUBLIC_BACKEND_URL = 'https://api.example.com';
        
        // Mock console methods to avoid test output noise
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        process.env = originalEnv;
        jest.restoreAllMocks();
    });

    test('should return 401 with enhanced error details when no session is found', async () => {
        auth.mockResolvedValue(null);

        const response = await POST();
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data).toMatchObject({
            success: false,
            error: 'Unauthorized - No valid session found',
            errorType: 'no_session',
            errorCode: 'AUTH_001',
            message: 'No active session detected. Please log in again.',
            logout: true,
            debug: {
                step: 'session_existence_check',
                sessionExists: false,
                userExists: false,
                ssidExists: false,
                possibleCauses: expect.arrayContaining([
                    'User not logged in',
                    'Session expired',
                    'Invalid session cookie',
                    'NextAuth configuration issue'
                ])
            }
        });
        expect(data.debug.timestamp).toBeDefined();
        expect(data.debug.requestId).toBeDefined();
    });

    test('should return 401 with enhanced error details when session has no user', async () => {
        auth.mockResolvedValue({});

        const response = await POST();
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data).toMatchObject({
            success: false,
            error: 'Unauthorized - No user data in session',
            errorType: 'no_user',
            errorCode: 'AUTH_002',
            message: 'Session exists but contains no user information. Please log in again.',
            logout: true,
            debug: {
                step: 'user_data_check',
                sessionExists: true,
                userExists: false,
                ssidExists: false,
                possibleCauses: expect.arrayContaining([
                    'Malformed session object',
                    'Session callback configuration issue',
                    'JWT token missing user data',
                    'NextAuth session processing error'
                ])
            }
        });
    });

    test('should return 401 with enhanced error details when session has no ssid', async () => {
        auth.mockResolvedValue({
            user: {
                name: 'Test User',
                email: 'test@example.com',
                provider: 'google'
            }
        });

        const response = await POST();
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data).toMatchObject({
            success: false,
            error: 'Unauthorized - No session ID found',
            errorType: 'no_ssid',
            errorCode: 'AUTH_003',
            message: 'Session exists but missing required session identifier. This may indicate a JWT configuration issue.',
            logout: true,
            debug: {
                step: 'ssid_validation_check',
                sessionExists: true,
                userExists: true,
                ssidExists: false,
                availableUserKeys: ['name', 'email', 'provider'],
                provider: 'google',
                email: '[PRESENT]',
                name: '[PRESENT]',
                possibleCauses: expect.arrayContaining([
                    'JWT callback not storing ssid in token',
                    'Session callback not exposing ssid server-side',
                    'NextAuth configuration missing ssid handling',
                    'Token missing ssid from authentication provider'
                ]),
                troubleshooting: expect.arrayContaining([
                    'Check JWT callback in auth.config.ts',
                    'Verify session callback server-side detection',
                    'Confirm ssid is stored during login process',
                    'Review NextAuth session configuration'
                ])
            }
        });
    });

    test('should return 401 when ssid is empty string (treated as no ssid)', async () => {
        auth.mockResolvedValue({
            user: {
                name: 'Test User',
                email: 'test@example.com',
                provider: 'google',
                ssid: '' // Empty string - treated as no ssid
            }
        });

        const response = await POST();
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data).toMatchObject({
            success: false,
            error: 'Unauthorized - No session ID found',
            errorType: 'no_ssid',
            errorCode: 'AUTH_003',
            message: 'Session exists but missing required session identifier. This may indicate a JWT configuration issue.',
            logout: true,
            debug: {
                step: 'ssid_validation_check',
                sessionExists: true,
                userExists: true,
                ssidExists: false
            }
        });
    });

    test('should return 401 when ssid has invalid format (non-string)', async () => {
        auth.mockResolvedValue({
            user: {
                name: 'Test User',
                email: 'test@example.com',
                provider: 'google',
                ssid: 123 // Number instead of string
            }
        });

        const response = await POST();
        const data = await response.json();



        expect(response.status).toBe(401);
        expect(data).toMatchObject({
            success: false,
            error: 'Unauthorized - Invalid session ID format',
            errorType: 'invalid_ssid',
            errorCode: 'AUTH_004',
            message: 'Session ID exists but has invalid format. Please log in again.',
            logout: true,
            debug: {
                step: 'ssid_format_check',
                sessionExists: true,
                userExists: true,
                ssidExists: true,
                ssidType: 'number'
            }
        });
    });

    test('should return 500 when NEXT_PUBLIC_BACKEND_URL is not configured', async () => {
        delete process.env.NEXT_PUBLIC_BACKEND_URL;
        
        auth.mockResolvedValue({
            user: {
                name: 'Test User',
                email: 'test@example.com',
                provider: 'google',
                ssid: 'valid-session-id'
            }
        });

        const response = await POST();
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data).toMatchObject({
            success: false,
            error: 'Backend service configuration error',
            errorCode: 'CONFIG_001'
        });
        expect(data.timestamp).toBeDefined();
        expect(data.requestId).toBeDefined();
    });

    test('should handle network errors with proper error codes', async () => {
        auth.mockResolvedValue({
            user: {
                name: 'Test User',
                email: 'test@example.com',
                provider: 'google',
                ssid: 'valid-session-id'
            }
        });

        // Mock fetch to throw network error
        global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

        const response = await POST();
        const data = await response.json();

        expect(response.status).toBe(503);
        expect(data).toMatchObject({
            success: false,
            error: 'Unable to confirm newbie status - backend service unavailable',
            errorCode: 'NETWORK_001',
            errorDetails: 'Network error'
        });
        expect(data.timestamp).toBeDefined();
        expect(data.requestId).toBeDefined();
    });

    test('should handle backend 401 errors appropriately', async () => {
        auth.mockResolvedValue({
            user: {
                name: 'Test User',
                email: 'test@example.com',
                provider: 'google',
                ssid: 'valid-session-id'
            }
        });

        // Mock fetch to return 401
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 401,
            statusText: 'Unauthorized',
            text: jest.fn().mockResolvedValue('Invalid session')
        });

        const response = await POST();
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data).toMatchObject({
            success: false,
            error: 'Session expired or invalid',
            errorCode: 'BACKEND_401',
            backendStatus: 401,
            details: 'Invalid session'
        });
    });

    test('should successfully process valid newbie confirmation', async () => {
        auth.mockResolvedValue({
            user: {
                name: 'Test User',
                email: 'test@example.com',
                provider: 'google',
                ssid: 'valid-session-id'
            }
        });

        // Mock successful backend response
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue({
                success: true,
                data: { confirmed: true }
            })
        });

        const response = await POST();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toMatchObject({
            success: true,
            data: {
                success: true,
                data: { confirmed: true }
            }
        });
        expect(data.timestamp).toBeDefined();
        expect(data.requestId).toBeDefined();
    });
});