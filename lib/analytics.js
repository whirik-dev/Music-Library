import { event } from './gtag';

// 일반적인 이벤트 추적 함수들
export const trackEvent = (action, category, label, value) => {
  event({
    action,
    category,
    label,
    value,
  });
};

// 음악 재생 이벤트
export const trackMusicPlay = (musicId, musicTitle, artist) => {
  trackEvent('play_music', 'Music', `[${musicId}] ${musicTitle} - ${artist}`);
};

// 음악 정지 이벤트
export const trackMusicStop = (musicId, musicTitle, artist) => {
  trackEvent('stop_music', 'Music', `[${musicId}] ${musicTitle} - ${artist}`);
};

// 음악 다운로드 이벤트
export const trackMusicDownload = (musicId, musicTitle = 'Unknown Title', artist = 'Unknown Artist') => {
  trackEvent('download_music', 'Music', `[${musicId}] ${musicTitle} - ${artist}`);
};

// 음악 즐겨찾기 이벤트
export const trackMusicFavorite = (musicId, musicTitle = 'Unknown Title', artist = 'Unknown Artist', action) => {
  trackEvent(`${action}_favorite`, 'Music', `[${musicId}] ${musicTitle} - ${artist}`);
};

// 검색 이벤트
export const trackSearch = (searchTerm) => {
  trackEvent('search', 'Search', searchTerm);
};

// 결제 이벤트
export const trackPayment = (paymentMethod, amount) => {
  trackEvent('payment', 'Payment', paymentMethod, amount);
};

// 페이지 방문 이벤트
export const trackPageView = (pageName) => {
  trackEvent('page_view', 'Navigation', pageName);
};

// 버튼 클릭 이벤트
export const trackButtonClick = (buttonName, location) => {
  trackEvent('click', 'Button', `${buttonName} - ${location}`);
};

// 사용자 인증 이벤트
export const trackUserAuth = (action, method) => {
  trackEvent(action, 'Authentication', method);
};

// 필터 사용 이벤트
export const trackFilterUsage = (filterType, filterValue) => {
  trackEvent('filter_usage', 'Search', `${filterType}: ${filterValue}`);
};

// 에러 이벤트
export const trackError = (errorType, errorMessage, location) => {
  trackEvent('error', errorType, `${location}: ${errorMessage}`);
};