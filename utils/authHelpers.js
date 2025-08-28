/**
 * Standardized Authentication Helpers
 * Provides consistent session validation across all API routes
 */

import { auth } from '@/auth';
import { getToken } from "next-auth/jwt";

/**
 * Validates session for API routes with consistent error handling
 * @param {Request} request - The request object
 * @returns {Promise<Object>} Validation result with session or error response
 */
export async function validateAPISession(request) {
  const timestamp = new Date().toISOString();
  const requestId = Math.random().toString(36).substring(2, 15);

  try {
    // 🔒 보안: 클라이언트 세션에서는 SSID가 숨겨져 있으므로 
    // 서버에서는 JWT 토큰에서 직접 SSID를 가져옴
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    // Check token exists
    if (!token) {
      return {
        isValid: false,
        error: {
          success: false,
          error: 'Unauthorized - No valid session found',
          errorType: 'no_session',
          errorCode: 'AUTH_001',
          message: 'No active session detected. Please log in again.',
          logout: true,
          timestamp,
          requestId
        },
        status: 401
      };
    }



    // Check SSID exists in token
    if (!token.ssid) {
      return {
        isValid: false,
        error: {
          success: false,
          error: 'Unauthorized - No session ID found',
          errorType: 'no_ssid',
          errorCode: 'AUTH_003',
          message: 'Session exists but missing required session identifier.',
          logout: true,
          timestamp,
          requestId
        },
        status: 401
      };
    }

    // Validate SSID format
    if (typeof token.ssid !== 'string' || token.ssid.trim().length === 0) {
      return {
        isValid: false,
        error: {
          success: false,
          error: 'Unauthorized - Invalid session ID format',
          errorType: 'invalid_ssid',
          errorCode: 'AUTH_004',
          message: 'Session ID exists but has invalid format. Please log in again.',
          logout: true,
          timestamp,
          requestId
        },
        status: 401
      };
    }

    // 클라이언트용 세션도 가져와서 기본 정보 확인
    const session = await auth();

    // Session is valid
    return {
      isValid: true,
      session,
      ssid: token.ssid, // JWT 토큰에서 가져온 SSID 사용
      requestId,
      timestamp
    };

  } catch (error) {
    console.error('Session validation error:', error.message);

    return {
      isValid: false,
      error: {
        success: false,
        error: 'Internal server error during session validation',
        errorCode: 'FATAL_001',
        timestamp,
        requestId
      },
      status: 500
    };
  }
}

/**
 * Makes authenticated request to backend service
 * @param {string} endpoint - Backend endpoint path
 * @param {string} ssid - Session ID for authentication
 * @param {Object} options - Request options
 * @returns {Promise<Object>} Response data or error
 */
export async function makeAuthenticatedRequest(endpoint, ssid, options = {}) {
  const { method = 'GET', body = null, timeout = 30000 } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      throw new Error('Backend URL not configured');
    }

    const requestOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ssid}`
      },
      signal: controller.signal
    };

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(`${backendUrl}${endpoint}`, requestOptions);
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    return await response.json();

  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }

    throw error;
  }
}

/**
 * Creates standardized error response
 * @param {string} message - Error message
 * @param {string} errorCode - Error code
 * @param {number} status - HTTP status code
 * @param {Object} additionalData - Additional error data
 * @returns {Object} Standardized error response
 */
export function createErrorResponse(message, errorCode, status = 500, additionalData = {}) {
  return {
    success: false,
    error: message,
    errorCode,
    timestamp: new Date().toISOString(),
    ...additionalData
  };
}