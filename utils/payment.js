/**
 * 결제 관련 유틸리티 함수들
 */

// 결제 금액 포맷팅
export const formatAmount = (amount, currency = 'KRW') => {
    if (!amount) return '0';
    
    const numAmount = Number(amount);
    
    if (currency === 'KRW') {
        return `${numAmount.toLocaleString()} 원`;
    } else if (currency === 'USD') {
        return `$${numAmount.toFixed(2)}`;
    }
    
    return `${numAmount.toLocaleString()} ${currency}`;
};

// 결제 상태 한글 변환
export const getPaymentStatusText = (status) => {
    const statusMap = {
        'READY': '결제 대기',
        'IN_PROGRESS': '결제 진행 중',
        'WAITING_FOR_DEPOSIT': '입금 대기',
        'DONE': '결제 완료',
        'CANCELED': '결제 취소',
        'PARTIAL_CANCELED': '부분 취소',
        'ABORTED': '결제 중단',
        'EXPIRED': '결제 만료'
    };
    
    return statusMap[status] || status;
};

// 결제 수단 한글 변환
export const getPaymentMethodText = (method) => {
    const methodMap = {
        '카드': '신용/체크카드',
        '가상계좌': '가상계좌',
        '계좌이체': '계좌이체',
        '휴대폰': '휴대폰 결제',
        '문화상품권': '문화상품권',
        '도서문화상품권': '도서문화상품권',
        '게임문화상품권': '게임문화상품권',
        'PAYPAL': 'PayPal',
        'FOREIGN_EASY_PAY': '해외간편결제'
    };
    
    return methodMap[method] || method;
};

// 주문번호 생성
export const generateOrderId = (prefix = 'ORDER') => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}_${timestamp}_${random}`;
};

// 결제 에러 메시지 한글 변환
export const getPaymentErrorMessage = (errorCode) => {
    const errorMap = {
        'INVALID_REQUEST': '잘못된 요청입니다.',
        'NOT_FOUND_PAYMENT': '결제 정보를 찾을 수 없습니다.',
        'FORBIDDEN_REQUEST': '허용되지 않은 요청입니다.',
        'REJECT_CARD_COMPANY': '카드사에서 거절된 결제입니다.',
        'INVALID_API_KEY': 'API 키가 유효하지 않습니다.',
        'INVALID_SECRET_KEY': '시크릿 키가 유효하지 않습니다.',
        'EXCEED_MAX_DAILY_PAYMENT_COUNT': '일일 최대 결제 횟수를 초과했습니다.',
        'NOT_SUPPORTED_BANK': '지원하지 않는 은행입니다.',
        'INVALID_CARD_EXPIRATION': '카드 유효기간이 잘못되었습니다.',
        'INVALID_STOPPED_CARD': '정지된 카드입니다.',
        'EXCEED_MAX_DAILY_PAYMENT_AMOUNT': '일일 최대 결제 금액을 초과했습니다.',
        'NOT_SUPPORTED_MONTHLY_INSTALLMENT_PLAN': '지원하지 않는 할부 개월 수입니다.',
        'INVALID_CARD_INSTALLMENT_PLAN': '잘못된 할부 개월 수입니다.',
        'NOT_SUPPORTED_CARD_TYPE': '지원하지 않는 카드 타입입니다.',
        'INVALID_CARD_NUMBER': '잘못된 카드번호입니다.',
        'INVALID_UNREGISTERED_SUBMALL': '등록되지 않은 서브몰입니다.',
        'NOT_REGISTERED_BUSINESS': '등록되지 않은 사업자입니다.'
    };
    
    return errorMap[errorCode] || '결제 처리 중 오류가 발생했습니다.';
};

// 결제 데이터 검증
export const validatePaymentData = (paymentKey, orderId, amount) => {
    if (!paymentKey || typeof paymentKey !== 'string') {
        return { isValid: false, error: '결제키가 유효하지 않습니다.' };
    }
    
    if (!orderId || typeof orderId !== 'string') {
        return { isValid: false, error: '주문번호가 유효하지 않습니다.' };
    }
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        return { isValid: false, error: '결제금액이 유효하지 않습니다.' };
    }
    
    return { isValid: true };
};

// 결제 성공 여부 확인
export const isPaymentSuccess = (status) => {
    return status === 'DONE';
};

// 결제 실패 여부 확인
export const isPaymentFailed = (status) => {
    return ['CANCELED', 'ABORTED', 'EXPIRED'].includes(status);
};

// 결제 대기 여부 확인
export const isPaymentPending = (status) => {
    return ['READY', 'IN_PROGRESS', 'WAITING_FOR_DEPOSIT'].includes(status);
};