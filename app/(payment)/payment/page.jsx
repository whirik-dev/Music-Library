"use client"
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { IconCheck, IconX } from "@tabler/icons-react";

import AuthProvider from "@/components/auth/AuthProvider";

import usePaymentStore from "@/stores/paymentStore";
import useUiStore from "@/stores/uiStore";

import Button from "@/components/ui/Button2";
import {
    formatAmount,
    getPaymentStatusText,
    getPaymentMethodText,
    validatePaymentData,
    getPaymentErrorMessage
} from "@/utils/payment";


const PaymentPageWrapper = ({ children }) => {
    return (
        <div className="w-screen">
            <div className="flex flex-col lg:flex-row lg:h-screen items-center justify-center">
                {children}
            </div>

            <AuthProvider />
        </div>
    )
}

export default function Payment() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const {
        selectedMembershipPlan,
        setPaymentResult,
        setPaymentStatus: setStorePaymentStatus,
        setPaymentError: setStorePaymentError,
    } = usePaymentStore();
    const {
        setCurrentPopup,
        setCurrentPopupArgument
    } = useUiStore();

    // 토스페이먼츠 결제 응답 파라미터
    const resultParam = searchParams.get('r'); // 'success' 또는 'fail'
    const paymentType = searchParams.get('type'); // 'billing' 또는 일반 결제

    // 일반 결제 파라미터
    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');
    const orderName = searchParams.get('orderName');

    // 빌링키 발급 파라미터
    const authKey = searchParams.get('authKey');
    const customerKey = searchParams.get('customerKey');

    // 결제 실패 파라미터
    const errorCode = searchParams.get('code');
    const errorMessage = searchParams.get('message');

    // 결제 상태 관리
    const [paymentStatus, setPaymentStatus] = useState('loading'); // 'loading', 'success', 'failed'
    const [paymentData, setPaymentData] = useState(null);
    const [error, setError] = useState(null);

    console.log('결제 응답 파라미터:', {
        resultParam,
        paymentType,
        paymentKey,
        orderId,
        amount,
        authKey,
        customerKey,
        errorCode,
        errorMessage
    });

    // 빌링키 발급 및 첫 결제 API 호출
    const confirmBillingPayment = async (authKey, customerKey, orderId, amount, orderName, originalAmount, promotionCode) => {
        try {
            setPaymentStatus('loading');
            setStorePaymentStatus('processing');

            // 세션 체크
            if (!session || !session.user || !session.user.ssid) {
                const errorMsg = '로그인 정보를 확인할 수 없습니다.';
                setPaymentStatus('failed');
                setError(errorMsg);
                setStorePaymentStatus('failed');
                setStorePaymentError(errorMsg);
                return;
            }

            const userSsid = session.user.ssid;

            // Step 1: 빌링키 발급
            const issueResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/billing/issue-key`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userSsid}`
                },
                body: JSON.stringify({
                    authKey,
                    customerKey
                })
            });

            const issueData = await issueResponse.json();
            console.log('빌링키 발급 응답:', issueData);

            if (!issueResponse.ok) {
                const errorMsg = issueData.error || issueData.message || '빌링키 발급 중 오류가 발생했습니다.';
                setPaymentStatus('failed');
                setError(errorMsg);
                setStorePaymentStatus('failed');
                setStorePaymentError(errorMsg);
                return;
            }

            const responseData = issueData.data || issueData;
            const billingKey = responseData.billingKey;

            if (!billingKey) {
                const errorMsg = '빌링키를 받지 못했습니다.';
                setPaymentStatus('failed');
                setError(errorMsg);
                setStorePaymentStatus('failed');
                setStorePaymentError(errorMsg);
                return;
            }

            // Step 2: 빌링 사이클 생성 및 첫 결제
            // orderName에서 멤버십 정보 파싱 (예: "PRO PLAN (yearly payment)" -> tier: PRO, cycle: YEARLY)
            const tierMatch = orderName?.match(/^(\w+)\s+PLAN/i);
            const cycleMatch = orderName?.match(/\((yearly|monthly)/i);

            const membershipTier = tierMatch ? tierMatch[1].toUpperCase() : 'BASIC';
            const cycleType = cycleMatch && cycleMatch[1].toLowerCase() === 'yearly' ? 'YEARLY' : 'MONTHLY';
            const billingDay = cycleType === 'MONTHLY' ? new Date().getDate() : new Date().getMonth() * 30 + new Date().getDate();
            const membershipDuration = cycleType === 'MONTHLY' ? 30 : 365;

            // 다음 결제일 계산
            const now = new Date();
            const nextBillingDate = new Date(now);
            if (cycleType === 'MONTHLY') {
                nextBillingDate.setMonth(now.getMonth() + 1);
            } else {
                nextBillingDate.setFullYear(now.getFullYear() + 1);
            }

            const billingCreatePayload = {
                customerKey,
                billingKey,
                cycleType,
                billingDay,
                amount: Number(amount),
                originalAmount: originalAmount ? Number(originalAmount) : Number(amount),
                orderName,
                membershipTier,
                membershipDuration,
                nextBillingDate: nextBillingDate.toISOString(),
                next_billing_date: nextBillingDate.toISOString(), // snake_case로도 시도
                maxRetries: 3,
                executeFirstPayment: true
            };

            // promotionCode가 있으면 추가 (빈 문자열이 아닐 때만)
            if (promotionCode && promotionCode.trim()) {
                billingCreatePayload.promotionCode = promotionCode;
            }

            console.log('빌링 사이클 생성 요청 데이터:', billingCreatePayload);
            console.log('프로모션 코드:', promotionCode);
            console.log('원래 금액:', originalAmount);

            const createResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/billing/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userSsid}`
                },
                body: JSON.stringify(billingCreatePayload)
            });

            const createData = await createResponse.json();
            console.log('빌링 사이클 생성 응답:', createData);

            if (createResponse.ok) {
                setPaymentStatus('success');
                setPaymentData(createData.data);
                setStorePaymentStatus('success');
                setPaymentResult(createData.data);
                setStorePaymentError(null);
            } else {
                const errorMsg = createData.error || '빌링 사이클 생성 중 오류가 발생했습니다.';
                setPaymentStatus('failed');
                setError(errorMsg);
                setStorePaymentStatus('failed');
                setStorePaymentError(errorMsg);
            }
        } catch (error) {
            console.error('빌링 처리 오류:', error);
            const errorMsg = '빌링 처리 중 네트워크 오류가 발생했습니다.';
            setPaymentStatus('failed');
            setError(errorMsg);
            setStorePaymentStatus('failed');
            setStorePaymentError(errorMsg);
        }
    };

    // 일반 결제 승인 API 호출
    const confirmPayment = async (paymentKey, orderId, amount) => {
        try {
            setPaymentStatus('loading');
            setStorePaymentStatus('processing');

            // 세션 체크
            if (!session || !session.user || !session.user.ssid) {
                const errorMsg = '로그인 정보를 확인할 수 없습니다.';
                setPaymentStatus('failed');
                setError(errorMsg);
                setStorePaymentStatus('failed');
                setStorePaymentError(errorMsg);
                return;
            }

            const userSsid = session.user.ssid;

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payments/confirm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userSsid}`
                },
                body: JSON.stringify({
                    paymentKey,
                    orderId,
                    amount: Number(amount)
                })
            });

            const data = await response.json();
            console.log('일반 결제 승인 응답:', data);

            if (response.ok) {
                setPaymentStatus('success');
                setPaymentData(data);
                setStorePaymentStatus('success');
                setPaymentResult(data);
                setStorePaymentError(null);
            } else {
                const errorMsg = data.error || '결제 승인 중 오류가 발생했습니다.';
                setPaymentStatus('failed');
                setError(errorMsg);
                setStorePaymentStatus('failed');
                setStorePaymentError(errorMsg);
            }
        } catch (error) {
            console.error('결제 승인 오류:', error);
            const errorMsg = '결제 승인 중 네트워크 오류가 발생했습니다.';
            setPaymentStatus('failed');
            setError(errorMsg);
            setStorePaymentStatus('failed');
            setStorePaymentError(errorMsg);
        }
    };

    const paymentSuccessHandler = () => {
        router.push('/');
        setCurrentPopup("membership");
        setCurrentPopupArgument({ planName: selectedMembershipPlan?.planName });
    }

    // 결제 성공 시 5초 후 자동 이동 (선택사항)
    useEffect(() => {
        if (paymentStatus === 'success') {
            const timer = setTimeout(() => {
                // 자동 이동을 원하지 않으면 이 부분을 주석 처리하세요
                // paymentSuccessHandler();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [paymentStatus]);

    // 결제 응답 처리
    useEffect(() => {
        // 세션 로딩 중이면 대기
        if (status === 'loading') {
            return;
        }

        // 빌링 타입: authKey와 customerKey로 빌링키 발급 및 첫 결제
        if (resultParam === 'success' && paymentType === 'billing' && authKey && customerKey) {
            // 세션 스토리지에서 결제 정보 가져오기
            const billingPaymentInfoStr = sessionStorage.getItem('billingPaymentInfo');
            let originalAmount = null;
            let promotionCode = null;
            let storedOrderName = orderName;
            let storedAmount = amount;

            console.log('세션 스토리지 원본:', billingPaymentInfoStr);

            if (billingPaymentInfoStr) {
                try {
                    const billingPaymentInfo = JSON.parse(billingPaymentInfoStr);
                    console.log('파싱된 결제 정보:', billingPaymentInfo);
                    
                    originalAmount = billingPaymentInfo.originalAmount;
                    promotionCode = billingPaymentInfo.promotionCode;
                    storedOrderName = billingPaymentInfo.orderName || orderName;
                    storedAmount = billingPaymentInfo.amount || amount;
                    
                    console.log('추출된 값:', { originalAmount, promotionCode, storedOrderName, storedAmount });
                    
                    // 사용 후 삭제
                    sessionStorage.removeItem('billingPaymentInfo');
                } catch (e) {
                    console.error('Failed to parse billing payment info:', e);
                }
            } else {
                console.warn('세션 스토리지에 billingPaymentInfo가 없습니다.');
            }

            confirmBillingPayment(authKey, customerKey, orderId, storedAmount, storedOrderName, originalAmount, promotionCode);
        }
        // 일반 결제: r=success이고 필요한 파라미터가 모두 있는 경우
        else if (resultParam === 'success' && paymentKey && orderId && amount) {
            // 결제 데이터 검증
            const validation = validatePaymentData(paymentKey, orderId, amount);
            if (!validation.isValid) {
                const errorMsg = validation.error;
                setPaymentStatus('failed');
                setError(errorMsg);
                setStorePaymentStatus('failed');
                setStorePaymentError(errorMsg);
                return;
            }

            confirmPayment(paymentKey, orderId, amount);
        }
        // r=fail이거나 결제 실패 시
        else if (resultParam === 'fail' || errorCode || errorMessage) {
            let errorMsg = '결제가 실패했습니다.';

            if (errorCode && errorMessage) {
                errorMsg = getPaymentErrorMessage(errorCode) || `${errorCode}: ${decodeURIComponent(errorMessage)}`;
            } else if (errorMessage) {
                errorMsg = decodeURIComponent(errorMessage);
            }

            setPaymentStatus('failed');
            setError(errorMsg);
            setStorePaymentStatus('failed');
            setStorePaymentError(errorMsg);
        }
        // 파라미터가 없는 경우 (직접 접근)
        else {
            const errorMsg = '잘못된 접근입니다.';
            setPaymentStatus('failed');
            setError(errorMsg);
            setStorePaymentStatus('failed');
            setStorePaymentError(errorMsg);
        }
    }, [session, status, resultParam, paymentType, paymentKey, orderId, amount, authKey, customerKey, orderName, errorCode, errorMessage]);
    // 로딩 상태 렌더링 (세션 로딩 중이거나 결제 처리 중)
    if (status === 'loading' || paymentStatus === 'loading') {
        return (
            <PaymentPageWrapper>
                <div className="text-center flex flex-col justify-center items-center gap-3">
                    <div className="size-48 flex items-center justify-center border-6 rounded-full p-3 opacity-10 border-blue-500">
                        <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-blue-500"></div>
                    </div>
                    <div className="my-10">
                        <div className="text-lg font-semibold mb-2">
                            {status === 'loading' ? '로그인 정보를 확인하고 있습니다...' : '결제를 처리하고 있습니다...'}
                        </div>
                        <div className="text-sm text-gray-500">잠시만 기다려주세요.</div>
                    </div>
                </div>
            </PaymentPageWrapper>
        );
    }

    const isSuccess = paymentStatus === 'success';

    return (
        <PaymentPageWrapper>
            <div className="text-center flex flex-col justify-center items-center gap-3">
                <div className={`size-48 flex items-center justify-center border-6 rounded-full p-3 opacity-10 ${isSuccess ? 'border-green-500' : 'border-red-500'}`}>
                    {isSuccess ? (
                        <IconCheck size={100} className="text-green-500" />
                    ) : (
                        <IconX size={100} className="text-red-500" />
                    )}
                </div>
                <div className="my-10">
                    <div className="text-xl font-bold mb-2">
                        {isSuccess ? "결제가 성공적으로 이루어졌습니다!" : "결제가 실패했습니다"}
                    </div>
                    <div className="text-sm text-gray-600">
                        {isSuccess
                            ? "결제가 정상적으로 처리되었습니다."
                            : "결제 처리 중 문제가 발생했습니다."
                        }
                    </div>
                </div>

                {/* 에러 메시지 표시 */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-5 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {isSuccess ? (
                    <>
                        {/* {paymentData?.receipt?.url && (
                            <Button
                                className="w-full"
                                name="영수증 보기"
                                onClick={() => window.open(paymentData.receipt.url, '_blank')}
                            />
                        )} */}
                        <Button className="w-full" name="확인" onClick={paymentSuccessHandler} />
                    </>
                ) : (
                    <>
                        <Button className="w-full" name="이전 단계로" onClick={() => router.push("/checkout")} />
                        {/* <Button className="w-full opacity-10" name="DEV: 성공으로 바꾸기" onClick={() => setPaymentStatus('success')} /> */}
                    </>
                )}

                {/* 결제 정보 표시 */}
                {(paymentData || (orderId && paymentKey && amount)) && (
                    <div className="p-4 bg-background rounded-lg mb-5 text-sm bg text-foreground/20">
                        <h3 className="font-semibold mb-2">결제 정보</h3>
                        {paymentData ? (
                            <>
                                <div>주문번호: {paymentData.orderId}</div>
                                <div>결제키: {paymentData.paymentKey}</div>
                                <div>결제금액: {formatAmount(paymentData.totalAmount, paymentData.currency)}</div>
                                <div>결제수단: {getPaymentMethodText(paymentData.method)}</div>
                                <div>결제상태: {getPaymentStatusText(paymentData.status)}</div>
                                {paymentData.approvedAt && (
                                    <div>승인시간: {new Date(paymentData.approvedAt).toLocaleString('ko-KR')}</div>
                                )}
                                {paymentData.orderName && (
                                    <div>상품명: {paymentData.orderName}</div>
                                )}
                            </>
                        ) : (
                            <>
                                <div>주문번호: {orderId}</div>
                                <div>결제키: {paymentKey}</div>
                                <div>결제금액: {formatAmount(amount)}</div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </PaymentPageWrapper>
    )
}
