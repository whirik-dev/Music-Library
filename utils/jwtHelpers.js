import { getToken } from "next-auth/jwt";

// 토큰 캐시
let tokenCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 30 * 1000; // 30초 캐시

/**
 * 클라이언트에서 JWT 토큰의 인증 상태를 확인하는 함수
 */
export async function checkAuthStatus() {
  try {
    // 캐시 확인
    if (tokenCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
      return tokenCache.hasAuth || false;
    }

    // 클라이언트에서는 인증 상태만 확인
    const response = await fetch('/api/auth/status', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      // 캐시 업데이트
      tokenCache = data;
      cacheTimestamp = Date.now();
      return data.hasAuth || false;
    }
    
    // 실패 시 캐시 클리어
    tokenCache = null;
    cacheTimestamp = null;
    return false;
  } catch (error) {
    console.error('Failed to check auth status:', error);
    // 에러 시 캐시 클리어
    tokenCache = null;
    cacheTimestamp = null;
    return false;
  }
}

/**
 * 서버에서 JWT 토큰의 ssid를 가져오는 함수
 */
export async function getSSIDFromTokenServer(req) {
  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    return token?.ssid || null;
  } catch (error) {
    console.error('Failed to get SSID from server token:', error);
    return null;
  }
}

/**
 * JWT 토큰에서 사용자 정보를 가져오는 함수 (ssid 제외)
 */
export async function getUserFromToken() {
  try {
    // 캐시 확인
    if (tokenCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
      return {
        email: tokenCache.email,
        name: tokenCache.name,
        provider: tokenCache.provider,
        hasAuth: tokenCache.hasAuth
      };
    }

    const response = await fetch('/api/auth/status', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      // 캐시 업데이트
      tokenCache = data;
      cacheTimestamp = Date.now();
      
      return {
        email: data.email,
        name: data.name,
        provider: data.provider,
        hasAuth: data.hasAuth
      };
    }
    
    // 실패 시 캐시 클리어
    tokenCache = null;
    cacheTimestamp = null;
    return null;
  } catch (error) {
    console.error('Failed to get user from token:', error);
    // 에러 시 캐시 클리어
    tokenCache = null;
    cacheTimestamp = null;
    return null;
  }
}

/**
 * 토큰 캐시를 클리어하는 함수 (로그아웃 시 사용)
 */
export function clearTokenCache() {
  tokenCache = null;
  cacheTimestamp = null;
}