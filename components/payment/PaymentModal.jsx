'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
import usePaymentStore from "@/stores/paymentStore";

export default function PaymentModal({ onClose, onSuccess }) {
    const [tossPayments, setTossPayments] = useState(null);
    const t = useTranslations('payment');
    const tError = useTranslations('errors');

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
                if (!clientKey) throw new Error(tError('missing_toss_client_key'));
                const tossPaymentsInstance = await loadTossPayments(clientKey);

                if (mounted) {
                    setTossPayments(tossPaymentsInstance);
                }
            } catch (err) {
                console.error(tError('toss_payments_load_error'), err);
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
                ? `${selectedMembershipPlan?.planName?.toUpperCase()} ${t('plan')}` || selectedMembershipPlan?.plan_id || t('basic_plan')
                : selectedMembershipPlan || t('basic_plan');
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
                customerEmail: customerInfo.email || t('customer_email_placeholder'),
                customerName: customerInfo.name || t('customer_name_placeholder'),
                customerMobilePhone: customerInfo.phone || t('customer_phone_placeholder'),
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
                        type: t('income_deduction'),
                    },
                    useEscrow: false,
                    validHours: 24,
                };
            }

            await payment.requestPayment(paymentData);

            if (onSuccess) onSuccess();
        } catch (err) {
            setPaymentStep(null);
            console.error(tError('toss_payments_request_error'), err);
        }
    }, [tossPayments, onSuccess, setPaymentStep, checkout, selectedMembershipPlan, selectedPaymentType, pricePlans]);

    return (
        <>
            {paymentStep === 'payment' ? (
                <div className={`fixed inset-0 z-[100] bg-black/30 flex items-center justify-center`}>
                    <div className="w-[500px] bg-foreground rounded-xl p-6 space-y-5">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-background">{t('payment')}</h2>
                            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 cursor-pointer text-2xl">✕</button>
                        </div>

                        <div className="space-y-4">
                            {/* 현재 플랜 정보 */}
                            {currentMembershipPlan && currentMembershipPlan !== 'free' && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="text-sm text-blue-700">
                                        {t('current_plan')}: <span className="font-medium">
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
                                <h3 className="font-semibold mb-3 text-background">{t('order_info')}</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-background">
                                        <span>
                                            {typeof selectedMembershipPlan === 'object'
                                                ? `${selectedMembershipPlan?.planName?.toUpperCase()} ${t('plan')}` || selectedMembershipPlan?.plan_id || t('basic_plan')
                                                : selectedMembershipPlan || t('basic_plan')
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
                                            })()} {t('won')}
                                        </span>
                                    </div>

                                    <div className="text-sm text-gray-600">
                                        {selectedPaymentType === 'yearly' ? (
                                            <>{t('yearly_payment')} ({t('monthly')} {(() => {
                                                const selectedPlan = selectedMembershipPlan && pricePlans.length > 0 ?
                                                    pricePlans.find((item) => item.id === selectedMembershipPlan.planName) : null;
                                                return selectedPlan ? selectedPlan.pricing.krw.yearlyMonthly.toLocaleString() : '8,333';
                                            })()} {t('won')})</>
                                        ) : (
                                            t('monthly_payment')
                                        )}
                                    </div>

                                    {(() => {
                                        const selectedPlan = selectedMembershipPlan && pricePlans.length > 0 ?
                                            pricePlans.find((item) => item.id === selectedMembershipPlan.planName) : null;
                                        return selectedPaymentType === 'yearly' && selectedPlan?.pricing?.krw?.savings > 0 && (
                                            <div className="flex justify-between text-sm text-green-600">
                                                <span>{t('yearly_payment')} {t('discount')}</span>
                                                <span>-{selectedPlan.pricing.krw.savings.toLocaleString()} {t('won')}</span>
                                            </div>
                                        );
                                    })()}

                                    {/* checkout 객체가 있는 경우 추가 정보 표시 */}
                                    {checkout?.discount && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>{t('discount')}</span>
                                            <span>-{checkout.discount.toLocaleString()} {t('won')}</span>
                                        </div>
                                    )}

                                    {checkout?.tax && (
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>Tax</span>
                                            <span>{checkout.tax.toLocaleString()} {t('won')}</span>
                                        </div>
                                    )}

                                    <hr className="my-2" />
                                    <div className="flex justify-between font-bold text-lg text-background">
                                        <span>{t('final_payment_amount')}</span>
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
                                            })()} {t('won')}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500">{t('vat_included')}</div>
                                </div>
                            </div>

                            {/* 고객 정보 */}
                            {checkout?.customer && (
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h3 className="font-semibold mb-2">{t('customer_info')}</h3>
                                    <div className="space-y-1 text-sm">
                                        {checkout.customer.name && (
                                            <div>{t('name')}: {checkout.customer.name}</div>
                                        )}
                                        {checkout.customer.email && (
                                            <div>{t('email')}: {checkout.customer.email}</div>
                                        )}
                                        {checkout.customer.phone && (
                                            <div>{t('phone')}: {checkout.customer.phone}</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* 결제 수단 선택 */}
                            <div className="space-y-3">
                                <h3 className="font-semibold">{t('select_payment_method')}</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    <button
                                        onClick={() => handlePayment('CARD', false)}
                                        disabled={!tossPayments}
                                        className="p-4 border border-gray-300 rounded-lg text-left hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">{t('domestic_card')}</div>
                                                <div className="text-sm text-gray-500">{t('credit_debit_card')}</div>
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
                                                <div className="font-medium">{t('foreign_card')}</div>
                                                <div className="text-sm text-gray-500">{t('visa_master_jcb_unionpay')}</div>
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
                                                <div className="font-medium">{t('virtual_account')}</div>
                                                <div className="text-sm text-gray-500">{t('account_transfer')}</div>
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
                                                <div className="font-medium">{t('bank_transfer')}</div>
                                                <div className="text-sm text-gray-500">{t('real_time_transfer')}</div>
                                            </div>
                                            <div className="text-2xl">💰</div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* 결제 안내 */}
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="text-sm text-yellow-800">
                                    <div className="font-medium mb-1">{t('payment_guide')}</div>
                                    <ul className="text-xs space-y-1">
                                        <li>{t('payment_guide_1')}</li>
                                        <li>{t('payment_guide_2')}</li>
                                        <li>{t('payment_guide_3')}</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="text-xs text-gray-400 text-center">
                                {tossPayments ? t('select_payment_method') : t('toss_payments_loading')}
                            </div>

                            <div className="text-xs text-gray-400 text-center">
                                {t('secure_payment')}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (<></>)}
        </>
    );
}