"use client"
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
import { useTranslations, useLocale } from 'next-intl';

import usePaymentStore from "@/stores/paymentStore";
import useAuthStore from "@/stores/authStore";
import { useGoogleAnalytics } from "@/hooks/useGoogleAnalytics";
import { trackPayment, trackPageView, trackButtonClick } from "@/lib/analytics";

import Logo from "@/components/Logo";
import Button from "@/components/ui/Button2";
import SignInModal from "@/components/auth/SignInModal";
import InputField from "@/components/ui/InputField";

import pricePlans from "@/data/pricePlans";

// Helper components - not exported to avoid Next.js page export conflicts
function CheckoutWrapper({ children }) {
    return (
        <div className="w-screen">
            <div className="flex flex-col lg:flex-row lg:h-screen">
                {children}
            </div>
        </div>
    )
}

function CheckoutPage({ children, className }) {
    return (
        <div className={`w-screen lg:w-1/2 lg:h-full px-5 xl:px-10 2xl:px-30 py-5 md:py-20 ${className}`}>
            <div className="w-full h-full flex flex-col gap-5 items-start justify-start">
                {children}
            </div>
        </div>
    )
}

function CheckoutTicker({ name, className }) {
    return (
        <div className={`bg-foreground text-background px-1 rounded-sm text-sm font-bold uppercase ${className}`} >
            {name}
        </div>
    )
}

function CheckoutFeature({ children }) {
    return (
        <div className="flex flex-row gap-3">
            <div className="">
                +
            </div>
            {children}
        </div>
    )
}

function SelectPlan({ data, onClick, selected, t, userInfo, toggleAuthModal }) {
    const handleClick = () => {
        if (!userInfo) {
            // 로그인이 안 되어 있으면 로그인 모달 띄우기
            toggleAuthModal(true);
            return;
        }
        // 로그인이 되어 있으면 원래 onClick 실행
        onClick();
    };

    return (
        <div className={`relative border-2 p-5 rounded-sm cursor-pointer transition-all
                        ${selected ? "border-purple-500 bg-purple-500/10" : "border-foreground/30"} 
                        ${data.promotionRatio ? "" : "opacity-50"} hover:border-foreground/80 `}
            onClick={handleClick}
        >
            {data.promotionRatio && (
                <div className="absolute -top-3 -left-3 px-2 pt-1 pb-1 bg-red-500 text-sm -rotate-5 font-black rounded-xs">
                    {data.promotionRatio}
                </div>
            )}
            <span className={`text-2xl ${data.priceHighlight && "text-white"}`}>
                {data.price}
            </span>

            <span className="text-xs">
                {data.interval}
            </span>
            <br />
            <span className="text-xs">
                {data.description}, {t('payment.vat_excluded')}
            </span>
        </div>
    )
}

// Animated number component - count up from 0 to target value
function AnimatedNumber({ value, prefix = "", suffix = "" }) {
    const [currentValue, setCurrentValue] = useState(0);
    const targetValue = Number(value) || 0;

    useEffect(() => {
        setCurrentValue(0); // Always start from 0

        const duration = 1000; // 1 second animation
        const steps = 60; // 60 frames
        const increment = targetValue / steps;
        let step = 0;

        const timer = setInterval(() => {
            step++;
            if (step >= steps) {
                setCurrentValue(targetValue);
                clearInterval(timer);
            } else {
                setCurrentValue(Math.round(increment * step));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [targetValue]);

    return (
        <span>
            {prefix}{currentValue.toLocaleString('ko-KR')}{suffix}
        </span>
    );
}

function CalculateDetail({ name, content, className, total = false, yearly = false, animated = false, t }) {
    function price2string(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // Check if content is numeric or string
    const isNumeric = typeof content === 'number' || (!isNaN(Number(content)) && content !== '' && content !== null && content !== undefined);
    const numericValue = isNumeric ? Number(content) : 0;

    return (
        <div className={`flex flex-row justify-between mt-3 first:mt-0 ${className} ${total ? 'text-lg font-bold border-t pt-3' : ''}`}>
            <div className={total ? "text-lg font-bold" : "font-medium"}>{name}</div>
            <div className="">
                {animated ? (
                    <AnimatedNumber key={`${name}-${numericValue}`} value={numericValue} suffix={t('payment.won')} />
                ) : (
                    `${isNumeric ? price2string(numericValue) + t('payment.won') : content}`
                )}
                {yearly && t('payment.months_12')}
            </div>
        </div>
    )
}

export default function Checkout() {
    const t = useTranslations();
    const router = useRouter();
    const {
        paymentStep,
        selectedMembershipPlan,
        selectedPaymentType,
        setSelectedPaymentType
    } = usePaymentStore();

    // Google Analytics 추적
    useGoogleAnalytics();

    // 로케일 정보 가져오기
    const locale = useLocale();
    const isKorean = locale === 'ko';

    // 사용자 정보 가져오기
    const { userInfo, toggleAuthModal } = useAuthStore();
    // Terms agreement state
    const [isTermsAgreed, setIsTermsAgreed] = useState(false);


    // TossPayments instance
    const [tossPayments, setTossPayments] = useState(null);

    // 한국어일 때는 빌링 클라이언트 키, 아닐 때는 기존 클라이언트 키 사용
    const clientKey = isKorean
        ? process.env.NEXT_PUBLIC_TOSS_BILLING_CLIENT
        : process.env.NEXT_PUBLIC_TOSS_CLIENT;

    useEffect(() => {
        // Redirect to price page if:
        // 1. User is not logged in
        // 2. selectedMembershipPlan is missing or lacks required properties
        // However, do not redirect when paymentStep is 'payment' (payment in progress)
        if (paymentStep !== 'payment') {
            if (!userInfo ||
                !selectedMembershipPlan ||
                !selectedMembershipPlan.planName ||
                !selectedMembershipPlan.plan_id) {
                router.push('/price');
            } else {
                // 결제 페이지 방문 추적
                trackPageView('Checkout');
            }
        }
    }, [selectedMembershipPlan, selectedPaymentType, router, paymentStep, userInfo]);

    // Initialize TossPayments
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                if (!clientKey) {
                    alert(t('errors.missing_toss_client_key'));
                    return;
                }

                // 클라이언트 키 형식 검증 (test_ 또는 live_로 시작해야 함)
                if (!clientKey.startsWith('test_') && !clientKey.startsWith('live_')) {
                    alert(t('errors.invalid_toss_client_key'));
                    return;
                }

                const tossPaymentsInstance = await loadTossPayments(clientKey);

                if (mounted) {
                    setTossPayments(tossPaymentsInstance);
                }
            } catch (err) {
                alert(t('errors.toss_load_failed'));
            }
        })();
        return () => {
            mounted = false;
        };
    }, [clientKey, t]);

    // Generate order ID
    const generateOrderId = () => `order_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    // Generate customer key
    const generateCustomerKey = () => `customer_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    const handlePayment = useCallback(async (method) => {
        if (!tossPayments) {
            alert(t('payment.payment_system_loading'));
            return;
        }

        if (!isTermsAgreed) {
            alert(t('payment.agree_to_terms'));
            return;
        }



        // 중복 결제 방지
        if (paymentStep === 'payment') {
            alert(t('payment.payment_in_progress'));
            return;
        }

        try {
            const orderId = generateOrderId();
            const customerKey = generateCustomerKey();

            // Initialize payment window
            const payment = tossPayments.payment({
                customerKey: customerKey
            });

            // Calculate payment information
            const selectedPlan = selectedMembershipPlan ?
                pricePlans.find((item) => item.id === selectedMembershipPlan.planName) : null;

            if (!selectedPlan) {
                alert(t('payment.invalid_plan_error'));
                return;
            }

            const baseAmount = selectedPaymentType === 'yearly'
                ? selectedPlan.pricing.krw.yearlyTotal
                : selectedPlan.pricing.krw.monthly;

            // 최소 결제 금액 검증 (100원)
            if (baseAmount < 100) {
                alert(t('payment.minimum_amount_error'));
                return;
            }

            const planName = `${selectedMembershipPlan?.planName?.toUpperCase()} ${t('payment.plan')} (${selectedPaymentType === 'yearly' ? t('payment.yearly_payment') : t('payment.monthly_payment')})`;

            let paymentData;

            if (isKorean) {
                // 한국어: 토스 빌링 (자동결제) 사용
                paymentData = {
                    method: 'BILLING', // 빌링 방식
                    amount: baseAmount,
                    orderId: orderId,
                    orderName: planName.length > 100 ? planName.substring(0, 100) : planName,
                    successUrl: `${window.location.origin}/payment?r=success`,
                    failUrl: `${window.location.origin}/payment?r=fail`,
                };
            } else {
                // 비한국어: PayPal 해외간편결제 사용
                // PayPal은 USD로 결제 (KRW를 USD로 환산)
                // 임시 환율: 1 USD = 1300 KRW (실제로는 실시간 환율 API 사용 권장)
                const exchangeRate = 1300;
                const baseAmountUSD = Math.round((baseAmount / exchangeRate) * 100) / 100; // 소수점 2자리
                const paymentAmount = baseAmountUSD;

                paymentData = {
                    method: 'FOREIGN_EASY_PAY', // PayPal은 해외간편결제 방식
                    amount: {
                        currency: 'USD', // PayPal은 USD 필수
                        value: paymentAmount,
                    },
                    orderId: orderId,
                    orderName: planName.length > 100 ? planName.substring(0, 100) : planName,
                    successUrl: `${window.location.origin}/payment?r=success`,
                    failUrl: `${window.location.origin}/payment?r=fail`,
                    foreignEasyPay: {
                        provider: 'PAYPAL', // 필수: PayPal 제공자 지정
                        country: 'KR', // 구매자 위치 국가 (한국)
                        // PayPal 추가 옵션 (선택사항)
                        paymentMethodOptions: {
                            paypal: {
                                setTransactionContext: {
                                    // PayPal STC 파라미터 (구매자 정보)
                                    sender_account_id: userInfo?.email?.split('@')[0] || 'user',
                                    sender_first_name: userInfo?.name?.split(' ')[0] || 'User',
                                    sender_last_name: userInfo?.name?.split(' ')[1] || 'Name',
                                    sender_email: userInfo?.email || 'user@example.com',
                                    sender_country_code: 'KR',
                                    sender_create_date: new Date().toISOString(),
                                }
                            }
                        }
                    }
                };
            }

            // 사용자 정보가 있으면 추가
            if (userInfo) {
                if (userInfo.email) {
                    paymentData.customerEmail = userInfo.email;
                }
                if (userInfo.name) {
                    paymentData.customerName = userInfo.name;
                }
            }

            // Additional options for virtual account
            if (method === 'VIRTUAL_ACCOUNT') {
                paymentData.virtualAccount = {
                    cashReceipt: {
                        type: t('payment.income_deduction'),
                    },
                    useEscrow: false,
                    validHours: 24,
                };
            }

            // 결제 시도 추적
            trackPayment(
                isKorean ? 'BILLING' : 'PAYPAL',
                isKorean ? totalWithVat : totalWithVatUSD
            );
            trackButtonClick('Payment Attempt', 'Checkout Page');

            // 빌링의 경우 requestBillingAuth 사용, 그 외에는 requestPayment 사용
            if (isKorean && method === 'BILLING') {
                await payment.requestBillingAuth({
                    method: 'CARD', // 빌링은 카드만 지원
                    successUrl: `${window.location.origin}/payment?r=success&type=billing`,
                    failUrl: `${window.location.origin}/payment?r=fail&type=billing`,
                    customerEmail: userInfo?.email || 'user@example.com',
                    customerName: userInfo?.name || 'User Name',
                });
            } else {
                await payment.requestPayment(paymentData);
            }

        } catch (err) {
            // 에러 타입별 처리
            if (err.code === 'USER_CANCEL') {
                // 사용자가 결제를 취소한 경우
                return;
            } else if (err.code === 'COMMON_ERROR') {
                if (isKorean) {
                    alert('자동결제 처리 중 오류가 발생했습니다.\n계약 상태를 확인하거나 고객센터(1544-7772)로 문의해주세요.');
                } else {
                    alert('Payment processing error occurred.\nPlease check the contract status or contact customer service.');
                }
            } else if (err.message && err.message.includes('provider')) {
                alert(isKorean ? '자동결제 설정에 문제가 있습니다. 잠시 후 다시 시도해주세요.' : 'Payment settings issue. Please try again later.');
            } else if (err.code === 'INVALID_CARD_COMPANY') {
                alert(t('payment.invalid_card_error'));
            } else if (err.code === 'EXCEED_MAX_DAILY_PAYMENT_COUNT') {
                alert(t('payment.daily_limit_exceeded'));
            } else if (err.code === 'FORBIDDEN_REQUEST') {
                alert(isKorean ? '결제 요청이 거부되었습니다. API 키를 확인해주세요.' : 'Payment request denied. Please check API key.');
            } else if (err.code === 'UNAUTHORIZED_KEY') {
                alert(isKorean ? '인증되지 않은 API 키입니다. 설정을 확인해주세요.' : 'Unauthorized API key. Please check settings.');
            } else if (err.code === 'NOT_SUPPORTED_METHOD') {
                alert(isKorean ? '자동결제 계약이 필요합니다. 고객센터(1544-7772)로 문의해주세요.' : 'Subscription payment contract required. Please contact customer service.');
            } else {
                alert(t('payment.payment_error') + ': ' + (err.message || err.code || 'Unknown error'));
            }
        }
    }, [tossPayments, isTermsAgreed, selectedMembershipPlan, selectedPaymentType, userInfo, t, paymentStep, isKorean]);

    function formatNumberKR(num) {
        return Number(num).toLocaleString('ko-KR');
    }

    // Safely get price information
    const selectedPlan = selectedMembershipPlan ?
        pricePlans.find((item) => item.id === selectedMembershipPlan.planName) : null;

    const priceYearlyMonthly = selectedPlan?.pricing.krw.yearlyMonthly || 0; // Monthly unit price for yearly payment
    const priceMonthly = selectedPlan?.pricing.krw.monthly || 0; // Monthly payment price
    const priceYearlyTotal = selectedPlan?.pricing.krw.yearlyTotal || 0; // Yearly total amount
    const monthlySavings = priceMonthly - priceYearlyMonthly;
    const savings = selectedPlan?.pricing.krw.savings || 0; // Total savings amount

    // Calculate amounts
    const baseAmount = selectedPaymentType === 'yearly' ? priceYearlyTotal : priceMonthly;
    const exchangeRate = 1300; // 임시 환율 (실제로는 실시간 환율 API 사용 권장)
    const vatAmount = Math.round(baseAmount * 0.1);
    const totalWithVat = baseAmount + vatAmount;
    const totalWithVatUSD = Math.round((totalWithVat / exchangeRate) * 100) / 100;

    return (
        <>
            <SignInModal />
            <CheckoutWrapper>
                <CheckoutPage className="bg-foreground/3">
                    <Logo className="mb-20" />

                    <CheckoutTicker name={t('payment.subscription')} />
                    <div className="text-5xl uppercase">
                        {selectedMembershipPlan?.planName || t('payment.unknown_plan')} {t('payment.plan')}
                    </div>
                    <div className="">
                        {selectedPlan?.features?.map((feature, index) => (
                            <CheckoutFeature key={(selectedMembershipPlan?.plan_id || t('payment.unknown_plan').toLowerCase()) + index}>{feature}</CheckoutFeature>
                        )) || <div>{t('errors.price_plans_load_failed')}</div>}
                    </div>

                    <div className="mt-20" />
                    <div className="flex flex-row gap-5">
                        <SelectPlan
                            data={{
                                price: `${formatNumberKR(priceYearlyMonthly)}${t('payment.won')}`,
                                priceHighlight: true,
                                interval: t('payment.monthly_yearly'),
                                promotionRatio: savings > 0 ? `${formatNumberKR(savings)}${t('payment.won')} ${t('payment.savings')}` : '',
                                description: `${selectedMembershipPlan?.planName?.toUpperCase()} ${t('payment.plan')} ${t('payment.plan_yearly')}`
                            }}
                            onClick={() => setSelectedPaymentType('yearly')}
                            selected={selectedPaymentType === 'yearly'}
                            t={t}
                            userInfo={userInfo}
                            toggleAuthModal={toggleAuthModal}
                        />
                        <SelectPlan
                            data={{
                                price: `${formatNumberKR(priceMonthly)}${t('payment.won')}`,
                                priceHighlight: true,
                                interval: t('payment.monthly'),
                                description: `${selectedMembershipPlan?.planName?.toUpperCase()} ${t('payment.plan')} ${t('payment.plan_monthly')}`
                            }}
                            onClick={() => setSelectedPaymentType('monthly')}
                            selected={selectedPaymentType === 'monthly'}
                            t={t}
                            userInfo={userInfo}
                            toggleAuthModal={toggleAuthModal}
                        />
                    </div>

                    <div className="text-xs opacity-30">
                        {t('payment.company_info')} <br />
                        {t('payment.terms_privacy_short')}
                    </div>
                </CheckoutPage>
                <CheckoutPage>
                    <div className="mt-0" />
                    <div className="w-full flex flex-col gap-5 rounded-sm p-10 bg-foreground/2">
                        <CalculateDetail name="" content={t('payment.plan_name_format', { planName: selectedMembershipPlan?.planName?.toUpperCase() || 'UNKNOWN' })} className="font-bold text-lg mb-3" t={t} />
                        {selectedPaymentType === 'yearly' ? (
                            <div key="yearly-plan">
                                <CalculateDetail name={t('payment.monthly_unit_price')} content={priceYearlyMonthly} animated t={t} />
                                <CalculateDetail name={t('payment.discount')} content={-monthlySavings} animated t={t} />
                                <CalculateDetail name={t('payment.yearly_total_amount')} content={priceYearlyTotal + savings} className="mt-7" animated t={t} />
                                <CalculateDetail name={t('payment.total_discount')} content={-savings} animated t={t} />
                                <CalculateDetail name={t('payment.final_payment_amount')} content={priceYearlyTotal} animated t={t} />
                                <CalculateDetail name={t('payment.vat_amount')} content={vatAmount} animated t={t} />
                                <CalculateDetail name={t('payment.final_payment_amount')} content={totalWithVat} total className="mt-5" animated t={t} />
                            </div>
                        ) : (
                            <div key="monthly-plan">
                                <CalculateDetail name={t('payment.monthly_charge')} content={priceMonthly} animated t={t} />
                                <CalculateDetail name={t('payment.discount_amount')} content={0} animated t={t} />
                                <CalculateDetail name={t('payment.vat_amount')} content={vatAmount} animated t={t} />
                                <CalculateDetail name={t('payment.final_payment_amount')} content={totalWithVat} total className="mt-5" animated t={t} />
                            </div>
                        )}
                    </div>

                    <div className="w-full flex flex-col gap-5 rounded-sm px-10 py-5 bg-foreground/2">
                        <div className="text-lg font-semibold">Promotion Code</div>
                        <div className="flex flex-col flex-1 gap-3">
                            <div className="flex flex-row gap-5">
                                <InputField className="flex-1" />
                                <Button name="apply"/>
                            </div>
                            <div className="text-xs">
                                여기에 쿠폰 상태 알림
                            </div>
                        </div>
                    </div>

                    <div className="w-full flex flex-col gap-5 rounded-sm px-10 py-5 bg-foreground/2">
                        <div className="text-lg font-semibold">{t('payment.payment_methods')}</div>

                        {/* Payment Options */}
                        <div className="grid grid-cols-1 gap-3">
                            {/* 한국어일 때는 토스 빌링, 아닐 때는 PayPal */}
                            {isKorean ? (
                                // 자동결제 (구독) 옵션 (한국어)
                                <label className="flex flex-row items-center p-4 border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20 rounded-lg cursor-pointer">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="BILLING"
                                        className="mr-3 text-purple-600"
                                        defaultChecked
                                    />
                                    <div className="flex items-center justify-between w-full">
                                        <div>
                                            <span className="font-medium text-sm">Subscription Payment</span>
                                            <div className="text-xs text-gray-500">Credit card and debit card automatic payment</div>
                                            {/* <div className="text-xs text-purple-600 mt-1">
                                                Amount: ₩{formatNumberKR(totalWithVat)}
                                            </div> */}
                                        </div>
                                        <div className="text-2xl">💳</div>
                                    </div>
                                </label>
                            ) : (
                                // PayPal 옵션 (비한국어)
                                <label className="flex flex-row items-center p-4 border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg cursor-pointer">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="PAYPAL"
                                        className="mr-3 text-blue-600"
                                        defaultChecked
                                    />
                                    <div className="flex items-center justify-between w-full">
                                        <div>
                                            <span className="font-medium text-sm">PayPal</span>
                                            <div className="text-xs text-gray-500">Safe and secure international payment</div>
                                            {/* <div className="text-xs text-blue-600 mt-1">
                                                Amount: ${totalWithVatUSD} USD (≈ ₩{formatNumberKR(totalWithVat)})
                                            </div> */}
                                        </div>
                                        <div className="text-2xl">🌐</div>
                                    </div>
                                </label>
                            )}
                        </div>
                        
                        {/* Payment Guide */}
                        {/* <div className={`mt-4 p-4 ${isKorean ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800' : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'} rounded-lg`}>
                            <div className="flex items-start space-x-3">
                                <div className={`${isKorean ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'} mt-0.5`}>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    {isKorean ? (
                                        <>
                                            <h4 className="text-sm font-medium text-purple-900 dark:text-purple-100">Subscription Payment</h4>
                                            <p className="mt-1 text-sm text-purple-700 dark:text-purple-200">
                                                Register your card information for automatic recurring payments. Safe and convenient domestic payment service.
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">PayPal Payment</h4>
                                            <p className="mt-1 text-sm text-blue-700 dark:text-blue-200">
                                                You will be redirected to PayPal to complete your payment securely. The amount will be charged in USD.
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div> */}
                    </div>

                    {/* Security Notice */}
                    <div className="flex flex-col gap-3 items-start space-x-2 text-sm text-zinc-600 dark:text-zinc-400 mt-4">
                        <div>
                            <input
                                type="checkbox"
                                name="terms"
                                checked={isTermsAgreed}
                                onChange={(e) => setIsTermsAgreed(e.target.checked)}
                                className="mr-1 text-blue-600"
                            />
                            <span className="font-medium text-sm">{t('payment.terms_agreement')}</span>
                        </div>
                    </div>

                    <Button
                        name={tossPayments ? t('payment.pay_button') : t('payment.payment_system_loading_button')}
                        className={`w-full ${(!isTermsAgreed || !tossPayments) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        bg={(isTermsAgreed && tossPayments) ? (isKorean ? "bg-purple-600 font-bold" : "bg-blue-600 font-bold") : "bg-gray-400 font-bold"}
                        onClick={() => {
                            if (isKorean) {
                                // 한국어: 토스 빌링 실행
                                handlePayment('BILLING');
                            } else {
                                // 비한국어: PayPal 해외간편결제 실행
                                handlePayment('FOREIGN_EASY_PAY');
                            }
                        }}
                    />
                </CheckoutPage>
            </CheckoutWrapper>
        </>
    );
}