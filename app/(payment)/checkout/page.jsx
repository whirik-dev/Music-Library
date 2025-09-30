"use client"
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
import { useTranslations } from 'next-intl';

import usePaymentStore from "@/stores/paymentStore";
import useAuthStore from "@/stores/authStore";

import Logo from "@/components/Logo";
import Button from "@/components/ui/Button2";

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

function SelectPlan({ data, onClick, selected, t }) {
    return (
        <div className={`relative border-2 p-5 rounded-sm cursor-pointer transition-all
                        ${selected ? "border-purple-500 bg-purple-500/10" : "border-foreground/30"} 
                        ${data.promotionRatio ? "" : "opacity-50"} hover:border-foreground/80 `}
            onClick={onClick}
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

    // 사용자 정보 가져오기
    const { userInfo } = useAuthStore();
    // Terms agreement state
    const [isTermsAgreed, setIsTermsAgreed] = useState(false);
    // Selected payment method
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('PAYPAL');

    // TossPayments instance
    const [tossPayments, setTossPayments] = useState(null);

    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT;

    useEffect(() => {
        console.log('Checkout - selectedMembershipPlan:', selectedMembershipPlan);
        console.log('Checkout - selectedPaymentType:', selectedPaymentType);
        console.log('Checkout - paymentStep:', paymentStep);

        // Redirect to price page if selectedMembershipPlan is missing or lacks required properties
        // However, do not redirect when paymentStep is 'payment' (payment in progress)
        if ((!selectedMembershipPlan ||
            !selectedMembershipPlan.planName ||
            !selectedMembershipPlan.plan_id) &&
            paymentStep !== 'payment') {
            console.log('Redirecting to price page - missing plan data');
            router.push('/price');
        }
    }, [selectedMembershipPlan, selectedPaymentType, router, paymentStep]);

    // Initialize TossPayments
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                if (!clientKey) {
                    console.error('[TossPayments] Client key is missing');
                    alert(t('errors.missing_toss_client_key'));
                    return;
                }

                // 클라이언트 키 형식 검증 (test_ 또는 live_로 시작해야 함)
                if (!clientKey.startsWith('test_') && !clientKey.startsWith('live_')) {
                    console.error('[TossPayments] Invalid client key format:', clientKey?.substring(0, 10));
                    alert(t('errors.invalid_toss_client_key'));
                    return;
                }

                // 라이브 키 사용 시 경고 및 상점 상태 확인 안내
                if (clientKey.startsWith('live_')) {
                    console.warn('[TossPayments] Using LIVE key - make sure this is intended for production');
                    console.warn('[TossPayments] If getting 500 errors, check:');
                    console.warn('1. 토스페이먼츠 개발자센터에서 상점 심사 상태 확인');
                    console.warn('2. 카드사 심사 완료 여부 확인');
                    console.warn('3. 결제수단별 활성화 상태 확인');
                    console.warn('4. API 버전 설정 확인 (권장: 2022-11-16)');
                }

                const tossPaymentsInstance = await loadTossPayments(clientKey);

                if (mounted) {
                    setTossPayments(tossPaymentsInstance);
                }
            } catch (err) {
                console.error('[TossPayments] load error:', err);
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

    const handlePayment = useCallback(async (method, isInternational = false) => {
        if (!tossPayments) {
            alert(t('payment.payment_system_loading'));
            return;
        }

        if (!isTermsAgreed) {
            alert(t('payment.agree_to_terms'));
            return;
        }

        // 로그인 상태 확인
        if (!userInfo) {
            alert(t('payment.login_required'));
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

            // PayPal은 USD로 결제 (KRW를 USD로 환산)
            // 임시 환율: 1 USD = 1300 KRW (실제로는 실시간 환율 API 사용 권장)
            const exchangeRate = 1300;
            const baseAmountUSD = Math.round((baseAmount / exchangeRate) * 100) / 100; // 소수점 2자리
            const paymentAmount = baseAmountUSD;

            const planName = `${selectedMembershipPlan?.planName?.toUpperCase()} ${t('payment.plan')} (${selectedPaymentType === 'yearly' ? t('payment.yearly_payment') : t('payment.monthly_payment')})`;

            // PayPal 해외간편결제 데이터
            const paymentData = {
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
                    country: 'US', // PayPal은 US 설정
                    // products 정보 추가 (PayPal 판매자 보호를 위해 권장)
                    products: [{
                        name: planName,
                        quantity: 1,
                        unitAmount: paymentAmount,
                        currency: 'USD',
                        description: `${selectedMembershipPlan?.planName} subscription plan`
                    }]
                }
            };

            // 사용자 정보가 있으면 추가
            if (userInfo) {
                if (userInfo.email) {
                    paymentData.customerEmail = userInfo.email;
                }
                if (userInfo.name) {
                    paymentData.customerName = userInfo.name;
                }
            }

            // 디버깅을 위한 로그 추가
            console.log('Payment Data:', paymentData);
            console.log('Client Key:', clientKey?.substring(0, 10) + '...');

            // 파라미터 검증
            const validation = {
                orderId: {
                    value: paymentData.orderId,
                    valid: /^[A-Za-z0-9_=-]{6,64}$/.test(paymentData.orderId),
                    length: paymentData.orderId?.length
                },
                orderName: {
                    value: paymentData.orderName,
                    valid: paymentData.orderName && paymentData.orderName.length <= 100,
                    length: paymentData.orderName?.length
                },
                amount: {
                    value: paymentData.amount.value,
                    valid: paymentData.amount.value >= 100,
                    currency: paymentData.amount.currency
                },
                urls: {
                    successUrl: paymentData.successUrl,
                    failUrl: paymentData.failUrl,
                    validSuccess: paymentData.successUrl?.startsWith('https://'),
                    validFail: paymentData.failUrl?.startsWith('https://')
                }
            };

            console.log('Parameter Validation:', validation);

            // 검증 실패 시 경고
            if (!validation.orderId.valid) {
                console.error('Invalid orderId format. Must be 6-64 chars, alphanumeric + _=-');
            }
            if (!validation.orderName.valid) {
                console.error('Invalid orderName. Must be <= 100 chars and not empty');
            }
            if (!validation.amount.valid) {
                console.error('Invalid amount. Must be >= 100');
            }
            if (!validation.urls.validSuccess || !validation.urls.validFail) {
                console.error('Invalid URLs. Must start with https://');
            }

            // PayPal 해외간편결제 설정 확인
            if (method === 'FOREIGN_EASY_PAY') {
                console.log('�  Setting up PayPal payment');
                console.log('PayPal payment data:', {
                    method: paymentData.method,
                    currency: paymentData.amount.currency,
                    amount: paymentData.amount.value,
                    country: paymentData.foreignEasyPay?.country
                });
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

            console.log('Requesting payment with TossPayments SDK...');
            console.log('Environment check:', {
                origin: window.location.origin,
                protocol: window.location.protocol,
                hostname: window.location.hostname,
                userAgent: navigator.userAgent.substring(0, 100)
            });

            // 현재 연결된 MID 확인을 위한 임시 테스트
            console.log('Testing TossPayments instance:', {
                hasInstance: !!tossPayments,
                clientKeyPrefix: clientKey?.substring(0, 15),
                // MID는 결제 완료 후 응답에서 확인 가능
            });

            await payment.requestPayment(paymentData);

        } catch (err) {
            console.error('[TossPayments] requestPayment error:', err);
            console.error('Error details:', {
                code: err.code,
                message: err.message,
                stack: err.stack,
                // 추가 디버깅 정보
                clientKeyUsed: clientKey?.substring(0, 15) + '...',
                paymentDataSent: {
                    method: paymentData.method,
                    amount: paymentData.amount,
                    orderId: paymentData.orderId,
                    orderName: paymentData.orderName?.substring(0, 50) + '...'
                }
            });

            // 에러 타입별 처리
            if (err.code === 'USER_CANCEL') {
                // 사용자가 결제를 취소한 경우
                return;
            } else if (err.code === 'COMMON_ERROR') {
                console.error('[TossPayments] COMMON_ERROR - PayPal 관련 가능한 원인:');
                console.error('1. PayPal 계약 미완료 (고객센터 1544-7772 문의 필요)');
                console.error('2. 해외간편결제 MID 미설정');
                console.error('3. PayPal 결제수단 비활성화');
                console.error('4. API 키 불일치 (해외간편결제용 키 필요)');
                alert('PayPal 결제 처리 중 오류가 발생했습니다.\nPayPal 계약 상태를 확인하거나 고객센터(1544-7772)로 문의해주세요.');
            } else if (err.code === 'INVALID_CARD_COMPANY') {
                alert(t('payment.invalid_card_error'));
            } else if (err.code === 'EXCEED_MAX_DAILY_PAYMENT_COUNT') {
                alert(t('payment.daily_limit_exceeded'));
            } else if (err.code === 'FORBIDDEN_REQUEST') {
                alert('결제 요청이 거부되었습니다. API 키를 확인해주세요.');
            } else if (err.code === 'UNAUTHORIZED_KEY') {
                alert('인증되지 않은 API 키입니다. 설정을 확인해주세요.');
            } else {
                alert(t('payment.payment_error') + ': ' + (err.message || err.code || 'Unknown error'));
            }
        }
    }, [tossPayments, isTermsAgreed, selectedMembershipPlan, selectedPaymentType, userInfo, t, paymentStep]);

    function formatNumberKR(num) {
        return Number(num).toLocaleString('ko-KR');
    }

    // Safely get price information
    const selectedPlan = selectedMembershipPlan ?
        pricePlans.find((item) => item.id === selectedMembershipPlan.planName) : null;

    console.log('Price calculation debug:', {
        selectedMembershipPlan,
        selectedPlan,
        selectedPaymentType,
        pricePlansAvailable: pricePlans.map(p => p.id)
    });

    const priceYearlyMonthly = selectedPlan?.pricing.krw.yearlyMonthly || 0; // Monthly unit price for yearly payment
    const priceMonthly = selectedPlan?.pricing.krw.monthly || 0; // Monthly payment price
    const priceYearlyTotal = selectedPlan?.pricing.krw.yearlyTotal || 0; // Yearly total amount
    const monthlySavings = priceMonthly - priceYearlyMonthly;
    const savings = selectedPlan?.pricing.krw.savings || 0; // Total savings amount

    // Calculate amounts for PayPal (USD)
    const baseAmount = selectedPaymentType === 'yearly' ? priceYearlyTotal : priceMonthly;
    const exchangeRate = 1300; // 임시 환율 (실제로는 실시간 환율 API 사용 권장)
    const baseAmountUSD = Math.round((baseAmount / exchangeRate) * 100) / 100;
    const vatAmount = Math.round(baseAmount * 0.1);
    const totalWithVat = baseAmount + vatAmount;
    const totalWithVatUSD = Math.round((totalWithVat / exchangeRate) * 100) / 100;

    console.log('Calculated prices:', {
        priceYearlyMonthly,
        priceMonthly,
        priceYearlyTotal,
        baseAmount,
        vatAmount,
        totalWithVat
    });

    return (
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
                    />
                </div>
                <div className="text-2xl">
                    {/* 39,000 KRW (VAT included) */}
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

                <div className="w-full flex flex-col gap-5 rounded-sm p-10 bg-foreground/2">
                    <div className="text-lg font-semibold">{t('payment.payment_methods')}</div>

                    {/* Payment Options */}
                    <div className="grid grid-cols-1 gap-3">
                        {/* Domestic Card Option - 주석처리됨 */}
                        {/* 
                        <label className="flex flex-row items-center p-4 border border-zinc-300 dark:border-zinc-600 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors">
                            <input
                                type="radio"
                                name="payment"
                                value="CARD"
                                className="mr-3 text-blue-600"
                                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                            />
                            <div className="flex items-center justify-between w-full">
                                <div>
                                    <span className="font-medium text-sm">국내 카드</span>
                                    <div className="text-xs text-gray-500">신용카드, 체크카드</div>
                                </div>
                                <div className="text-2xl">💳</div>
                            </div>
                        </label>
                        */}

                        {/* PayPal Payment Option */}
                        <label className="flex flex-row items-center p-4 border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg cursor-pointer">
                            <input
                                type="radio"
                                name="payment"
                                value="PAYPAL"
                                className="mr-3 text-blue-600"
                                defaultChecked
                                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                            />
                            <div className="flex items-center justify-between w-full">
                                <div>
                                    <span className="font-medium text-sm">PayPal</span>
                                    <div className="text-xs text-gray-500">Safe and secure international payment</div>
                                    <div className="text-xs text-blue-600 mt-1">
                                        Amount: ${totalWithVatUSD} USD (≈ ₩{formatNumberKR(totalWithVat)})
                                    </div>
                                </div>
                                <div className="text-2xl">🌐</div>
                            </div>
                        </label>
                    </div>

                    {/* PayPal Guide */}
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-start space-x-3">
                            <div className="text-blue-600 dark:text-blue-400 mt-0.5">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">PayPal Payment</h4>
                                <p className="mt-1 text-sm text-blue-700 dark:text-blue-200">
                                    You will be redirected to PayPal to complete your payment securely. The amount will be charged in USD.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Additional payment methods can be added here */}
                </div>

                {/* Security Notice */}
                <div className="flex flex-col gap-3 items-start space-x-2 text-sm text-zinc-600 dark:text-zinc-400 mt-4">
                    {/* SSL security notice can be added here */}
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
                    bg={(isTermsAgreed && tossPayments) ? "bg-purple-600 font-bold" : "bg-gray-400 font-bold"}
                    onClick={() => {
                        console.log('🌐 Initiating PayPal payment:', {
                            selectedMethod: selectedPaymentMethod,
                            amountUSD: totalWithVatUSD,
                            amountKRW: totalWithVat
                        });
                        // PayPal 해외간편결제 실행
                        handlePayment('FOREIGN_EASY_PAY', false);
                    }}
                />
            </CheckoutPage>
        </CheckoutWrapper>
    );
}
