'use client';

import { useEffect, useState, useCallback } from 'react';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
import usePaymentStore from "@/stores/paymentStore";

export default function PaymentModal({ onClose, onSuccess }) {
    const [tossPayments, setTossPayments] = useState(null);

    const {
        paymentStep,
        setPaymentStep,
        selectedMembershipPlan,
        selectedPaymentType,
        checkout,
        currentMembershipPlan
    } = usePaymentStore();

    // pricePlans 데이터 import (실제 경로에 맞게 수정)
    const [pricePlans, setPricePlans] = useState([]);

    useEffect(() => {
        // pricePlans 데이터를 동적으로 import
        import('@/data/pricePlans').then((module) => {
            setPricePlans(module.default || module);
        }).catch(() => {
            console.warn('pricePlans 데이터를 불러올 수 없습니다.');
        });
    }, []);

    // 주문 ID 생성
    const generateOrderId = () => `order_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    // 고객 키 생성
    const generateCustomerKey = () => `customer_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_TEST;

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                if (!clientKey) throw new Error('Missing env: NEXT_PUBLIC_TOSS_CLIENT_TEST');
                const tossPaymentsInstance = await loadTossPayments(clientKey);

                if (mounted) {
                    setTossPayments(tossPaymentsInstance);
                }
            } catch (err) {
                console.error('[TossPayments] load error:', err);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [clientKey]);

    const handlePayment = useCallback(async (method, isInternational = false) => {
        if (!tossPayments) return;

        try {
            const orderId = generateOrderId();
            const customerKey = generateCustomerKey();

            // 결제창 초기화
            const payment = tossPayments.payment({
                customerKey: customerKey
            });

            // 실제 데이터 구조에 맞게 결제 정보 가져오기
            const selectedPlan = selectedMembershipPlan && pricePlans.length > 0 ?
                pricePlans.find((item) => item.id === selectedMembershipPlan.planName) : null;

            // selectedPaymentType에 따라 결제 금액 결정
            const paymentAmount = selectedPlan ? 
                (selectedPaymentType === 'yearly' ? selectedPlan.pricing.krw.yearlyTotal : selectedPlan.pricing.krw.monthly)
                : (checkout?.amount || 10000);
            const planName = typeof selectedMembershipPlan === 'object'
                ? `${selectedMembershipPlan?.planName?.toUpperCase()} 플랜` || selectedMembershipPlan?.plan_id || '프리미엄 플랜'
                : selectedMembershipPlan || '프리미엄 플랜';
            const customerInfo = checkout?.customer || {};

            const paymentData = {
                method: method,
                amount: {
                    currency: 'KRW',
                    value: paymentAmount,
                },
                orderId: orderId,
                orderName: planName,
                successUrl: `${window.location.origin}/payment/success`,
                failUrl: `${window.location.origin}/payment/fail`,
                customerEmail: customerInfo.email || 'customer@example.com',
                customerName: customerInfo.name || '고객',
                customerMobilePhone: customerInfo.phone || '01012345678',
            };

            // 해외 카드 결제인 경우 추가 옵션
            if (method === 'CARD' && isInternational) {
                paymentData.card = {
                    useInternationalCardOnly: true
                };
            }

            // 가상계좌인 경우 추가 옵션
            if (method === 'VIRTUAL_ACCOUNT') {
                paymentData.virtualAccount = {
                    cashReceipt: {
                        type: '소득공제',
                    },
                    useEscrow: false,
                    validHours: 24,
                };
            }

            await payment.requestPayment(paymentData);

            if (onSuccess) onSuccess();
        } catch (err) {
            setPaymentStep(null);
            console.error('[TossPayments] requestPayment error:', err);
        }
    }, [tossPayments, onSuccess, setPaymentStep, checkout, selectedMembershipPlan, selectedPaymentType, pricePlans]);

    return (
        <>
            {paymentStep === 'payment' ? (
                <div className={`fixed inset-0 z-[100] bg-black/30 flex items-center justify-center`}>
                    <div className="w-[500px] bg-foreground rounded-xl p-6 space-y-5">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-background">결제하기</h2>
                            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 cursor-pointer text-2xl">✕</button>
                        </div>

                        <div className="space-y-4">
                            {/* 현재 플랜 정보 */}
                            {currentMembershipPlan && currentMembershipPlan !== 'free' && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="text-sm text-blue-700">
                                        현재 플랜: <span className="font-medium">
                                            {typeof currentMembershipPlan === 'object'
                                                ? currentMembershipPlan?.planName || currentMembershipPlan?.plan_id || currentMembershipPlan
                                                : currentMembershipPlan
                                            }
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* 주문 정보 */}
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold mb-3 text-background">주문 정보</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-background">
                                        <span>
                                            {typeof selectedMembershipPlan === 'object'
                                                ? `${selectedMembershipPlan?.planName?.toUpperCase()} 플랜` || selectedMembershipPlan?.plan_id || '프리미엄 플랜'
                                                : selectedMembershipPlan || '프리미엄 플랜'
                                            }
                                        </span>
                                        <span className="font-bold">
                                            {(() => {
                                                const selectedPlan = selectedMembershipPlan && pricePlans.length > 0 ?
                                                    pricePlans.find((item) => item.id === selectedMembershipPlan.planName) : null;
                                                if (selectedPlan) {
                                                    return selectedPaymentType === 'yearly' 
                                                        ? selectedPlan.pricing.krw.yearlyTotal.toLocaleString()
                                                        : selectedPlan.pricing.krw.monthly.toLocaleString();
                                                }
                                                return (checkout?.amount || 10000).toLocaleString();
                                            })()}원
                                        </span>
                                    </div>

                                    <div className="text-sm text-gray-600">
                                        {selectedPaymentType === 'yearly' ? (
                                            <>연간 결제 (월 {(() => {
                                                const selectedPlan = selectedMembershipPlan && pricePlans.length > 0 ?
                                                    pricePlans.find((item) => item.id === selectedMembershipPlan.planName) : null;
                                                return selectedPlan ? selectedPlan.pricing.krw.yearlyMonthly.toLocaleString() : '8,333';
                                            })()} 원)</>
                                        ) : (
                                            '월간 결제'
                                        )}
                                    </div>

                                    {(() => {
                                        const selectedPlan = selectedMembershipPlan && pricePlans.length > 0 ?
                                            pricePlans.find((item) => item.id === selectedMembershipPlan.planName) : null;
                                        return selectedPaymentType === 'yearly' && selectedPlan?.pricing?.krw?.savings > 0 && (
                                            <div className="flex justify-between text-sm text-green-600">
                                                <span>연간 결제 할인</span>
                                                <span>-{selectedPlan.pricing.krw.savings.toLocaleString()}원</span>
                                            </div>
                                        );
                                    })()}

                                    {/* checkout 객체가 있는 경우 추가 정보 표시 */}
                                    {checkout?.discount && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>추가 할인</span>
                                            <span>-{checkout.discount.toLocaleString()}원</span>
                                        </div>
                                    )}

                                    {checkout?.tax && (
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>세금</span>
                                            <span>{checkout.tax.toLocaleString()}원</span>
                                        </div>
                                    )}

                                    <hr className="my-2" />
                                    <div className="flex justify-between font-bold text-lg text-background">
                                        <span>총 결제금액</span>
                                        <span className="text-blue-600">
                                            {(() => {
                                                const selectedPlan = selectedMembershipPlan && pricePlans.length > 0 ?
                                                    pricePlans.find((item) => item.id === selectedMembershipPlan.planName) : null;
                                                if (selectedPlan) {
                                                    return selectedPaymentType === 'yearly' 
                                                        ? selectedPlan.pricing.krw.yearlyTotal.toLocaleString()
                                                        : selectedPlan.pricing.krw.monthly.toLocaleString();
                                                }
                                                return (checkout?.amount || 10000).toLocaleString();
                                            })()}원
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500">VAT 포함</div>
                                </div>
                            </div>

                            {/* 고객 정보 */}
                            {checkout?.customer && (
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h3 className="font-semibold mb-2">결제자 정보</h3>
                                    <div className="space-y-1 text-sm">
                                        {checkout.customer.name && (
                                            <div>이름: {checkout.customer.name}</div>
                                        )}
                                        {checkout.customer.email && (
                                            <div>이메일: {checkout.customer.email}</div>
                                        )}
                                        {checkout.customer.phone && (
                                            <div>연락처: {checkout.customer.phone}</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* 결제 수단 선택 */}
                            <div className="space-y-3">
                                <h3 className="font-semibold">결제 수단 선택</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    <button
                                        onClick={() => handlePayment('CARD', false)}
                                        disabled={!tossPayments}
                                        className="p-4 border border-gray-300 rounded-lg text-left hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">국내 카드</div>
                                                <div className="text-sm text-gray-500">신용카드, 체크카드</div>
                                            </div>
                                            <div className="text-2xl">💳</div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handlePayment('CARD', true)}
                                        disabled={!tossPayments}
                                        className="p-4 border border-gray-300 rounded-lg text-left hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">해외 카드</div>
                                                <div className="text-sm text-gray-500">VISA, Master, JCB, UnionPay</div>
                                            </div>
                                            <div className="text-2xl">🌍</div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handlePayment('VIRTUAL_ACCOUNT')}
                                        disabled={!tossPayments}
                                        className="p-4 border border-gray-300 rounded-lg text-left hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">가상계좌</div>
                                                <div className="text-sm text-gray-500">계좌이체</div>
                                            </div>
                                            <div className="text-2xl">🏦</div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handlePayment('TRANSFER')}
                                        disabled={!tossPayments}
                                        className="p-4 border border-gray-300 rounded-lg text-left hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">계좌이체</div>
                                                <div className="text-sm text-gray-500">실시간 계좌이체</div>
                                            </div>
                                            <div className="text-2xl">💰</div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* 결제 안내 */}
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="text-sm text-yellow-800">
                                    <div className="font-medium mb-1">결제 안내</div>
                                    <ul className="text-xs space-y-1">
                                        <li>• 결제 완료 후 즉시 서비스 이용이 가능합니다</li>
                                        <li>• 결제 내역은 이메일로 발송됩니다</li>
                                        <li>• 문의사항은 고객센터로 연락해주세요</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="text-xs text-gray-400 text-center">
                                {tossPayments ? '결제 수단을 선택해주세요' : '토스페이먼츠 로딩 중...'}
                            </div>

                            <div className="text-xs text-gray-400 text-center">
                                안전한 결제를 위해 토스페이먼츠를 사용합니다
                            </div>
                        </div>
                    </div>
                </div>
            ) : (<></>)}
        </>
    );
}