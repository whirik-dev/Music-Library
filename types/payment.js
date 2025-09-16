/**
 * 결제 관련 타입 정의
 */

// 결제 상태
export const PAYMENT_STATUS = {
    READY: 'READY',                     // 결제 대기
    IN_PROGRESS: 'IN_PROGRESS',         // 결제 진행 중
    WAITING_FOR_DEPOSIT: 'WAITING_FOR_DEPOSIT', // 입금 대기
    DONE: 'DONE',                       // 결제 완료
    CANCELED: 'CANCELED',               // 결제 취소
    PARTIAL_CANCELED: 'PARTIAL_CANCELED', // 부분 취소
    ABORTED: 'ABORTED',                 // 결제 중단
    EXPIRED: 'EXPIRED'                  // 결제 만료
};

// 결제 수단
export const PAYMENT_METHOD = {
    CARD: '카드',
    VIRTUAL_ACCOUNT: '가상계좌',
    TRANSFER: '계좌이체',
    MOBILE_PHONE: '휴대폰',
    CULTURE_GIFT_CERTIFICATE: '문화상품권',
    BOOK_CULTURE_GIFT_CERTIFICATE: '도서문화상품권',
    GAME_CULTURE_GIFT_CERTIFICATE: '게임문화상품권',
    PAYPAL: 'PAYPAL',
    FOREIGN_EASY_PAY: 'FOREIGN_EASY_PAY'
};

// 결제 타입
export const PAYMENT_TYPE = {
    NORMAL: 'NORMAL',       // 일반결제
    BILLING: 'BILLING',     // 자동결제
    BRANDPAY: 'BRANDPAY'    // 브랜드페이
};

// 웹훅 이벤트 타입
export const WEBHOOK_EVENT_TYPE = {
    PAYMENT_STATUS_CHANGED: 'PAYMENT_STATUS_CHANGED',
    DEPOSIT_CALLBACK: 'DEPOSIT_CALLBACK',
    CANCEL_STATUS_CHANGED: 'CANCEL_STATUS_CHANGED',
    METHOD_UPDATED: 'METHOD_UPDATED',
    CUSTOMER_STATUS_CHANGED: 'CUSTOMER_STATUS_CHANGED'
};

// 결제 에러 코드
export const PAYMENT_ERROR_CODE = {
    INVALID_REQUEST: 'INVALID_REQUEST',
    NOT_FOUND_PAYMENT: 'NOT_FOUND_PAYMENT',
    FORBIDDEN_REQUEST: 'FORBIDDEN_REQUEST',
    REJECT_CARD_COMPANY: 'REJECT_CARD_COMPANY',
    INVALID_API_KEY: 'INVALID_API_KEY',
    INVALID_SECRET_KEY: 'INVALID_SECRET_KEY',
    EXCEED_MAX_DAILY_PAYMENT_COUNT: 'EXCEED_MAX_DAILY_PAYMENT_COUNT',
    NOT_SUPPORTED_BANK: 'NOT_SUPPORTED_BANK',
    INVALID_CARD_EXPIRATION: 'INVALID_CARD_EXPIRATION',
    INVALID_STOPPED_CARD: 'INVALID_STOPPED_CARD',
    EXCEED_MAX_DAILY_PAYMENT_AMOUNT: 'EXCEED_MAX_DAILY_PAYMENT_AMOUNT'
};

// 통화 코드
export const CURRENCY = {
    KRW: 'KRW',
    USD: 'USD',
    JPY: 'JPY',
    EUR: 'EUR'
};

// 결제 데이터 스키마 (JSDoc 스타일)
/**
 * @typedef {Object} PaymentData
 * @property {string} paymentKey - 결제 고유 키
 * @property {string} orderId - 주문번호
 * @property {string} orderName - 주문명
 * @property {number} totalAmount - 총 결제금액
 * @property {number} balanceAmount - 취소 가능 금액
 * @property {string} status - 결제 상태
 * @property {string} method - 결제 수단
 * @property {string} currency - 통화
 * @property {string} requestedAt - 결제 요청 시간
 * @property {string} approvedAt - 결제 승인 시간
 * @property {boolean} useEscrow - 에스크로 사용 여부
 * @property {Object} receipt - 영수증 정보
 * @property {string} receipt.url - 영수증 URL
 */

/**
 * @typedef {Object} PaymentRequest
 * @property {string} paymentKey - 결제 고유 키
 * @property {string} orderId - 주문번호
 * @property {number} amount - 결제금액
 */

/**
 * @typedef {Object} PaymentError
 * @property {string} code - 에러 코드
 * @property {string} message - 에러 메시지
 */