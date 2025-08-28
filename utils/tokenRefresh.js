/**
 * JWT 토큰 자동 갱신 유틸리티
 */

let refreshTimer = null;

/**
 * 토큰 만료 시간 확인
 */
export async function getTokenExpiry() {
  try {
    const response = await fetch('/api/auth/token-info', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.exp; // Unix timestamp
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get token expiry:', error);
    return null;
  }
}

/**
 * 토큰 갱신
 */
export async function refreshToken() {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    });
    
    return response.ok;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
}

/**
 * 자동 토큰 갱신 시작
 */
export function startTokenRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }

  const checkAndRefresh = async () => {
    const expiry = await getTokenExpiry();
    
    if (expiry) {
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = expiry - now;
      
      // 만료 5분 전에 갱신
      if (timeUntilExpiry <= 5 * 60) {
        console.log('Refreshing token...');
        const success = await refreshToken();
        
        if (!success) {
          console.error('Token refresh failed, user may need to re-login');
          // 갱신 실패 시 로그아웃 처리
          window.location.href = '/';
        }
      }
    }
  };

  // 1분마다 토큰 상태 확인
  refreshTimer = setInterval(checkAndRefresh, 60 * 1000);
  
  // 즉시 한 번 실행
  checkAndRefresh();
}

/**
 * 자동 토큰 갱신 중지
 */
export function stopTokenRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}