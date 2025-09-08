"use client"
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';

import usePaymentStore from "@/stores/paymentStore";

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

function SelectPlan({ data, onClick, selected }) {
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
                {data.description}, VAT포함
            </span>
        </div>
    )
}

// 애니메이션 숫자 컴포넌트 - 0에서 목표값까지 카운트업
function AnimatedNumber({ value, prefix = "", suffix = "" }) {
    const [currentValue, setCurrentValue] = useState(0);
    const targetValue = Number(value) || 0;

    useEffect(() => {
        setCurrentValue(0); // 항상 0에서 시작

        const duration = 1000; // 1초 애니메이션
        const steps = 60; // 60프레임
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

function CalculateDetail({ name, content, className, total = false, yearly = false, animated = false }) {
    function price2string(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // content가 숫자인지 문자열인지 확인
    const isNumeric = typeof content === 'number' || (!isNaN(Number(content)) && content !== '' && content !== null && content !== undefined);
    const numericValue = isNumeric ? Number(content) : 0;



    return (
        <div className={`flex flex-row justify-between mt-3 first:mt-0 ${className} ${total ? 'text-lg font-bold border-t pt-3' : ''}`}>
            <div className={total ? "text-lg font-bold" : "font-medium"}>{name}</div>
            <div className="">
                {animated ? (
                    <AnimatedNumber key={`${name}-${numericValue}`} value={numericValue} suffix="원" />
                ) : (
                    `${isNumeric ? price2string(numericValue) + '원' : content}`
                )}
                {yearly && " × 12개월"}
            </div>
        </div>
    )
}



export default function Checkout() {
    const router = useRouter();
    const {
        paymentStep,
        setPaymentStep,
        selectedMembershipPlan,
        setSelectedMembershipPlan,
        selectedPaymentType,
        setSelectedPaymentType
    } = usePaymentStore();
    // 이용약관 동의 상태
    const [isTermsAgreed, setIsTermsAgreed] = useState(false);
    // 선택된 결제 수단
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('CARD');
    // 토스페이먼츠 인스턴스
    const [tossPayments, setTossPayments] = useState(null);

    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_TEST;

    useEffect(() => {
        // selectedMembershipPlan이 없거나 필수 속성이 없으면 가격 페이지로 리다이렉트
        // 단, paymentStep이 'payment'일 때는 리다이렉트하지 않음 (결제 진행 중)
        if ((!selectedMembershipPlan ||
            !selectedMembershipPlan.planName ||
            !selectedMembershipPlan.plan_id) &&
            paymentStep !== 'payment') {
            router.push('/price');
        }
    }, [selectedMembershipPlan, router, paymentStep]);

    // 토스페이먼츠 초기화
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

    // 주문 ID 생성
    const generateOrderId = () => `order_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    // 고객 키 생성
    const generateCustomerKey = () => `customer_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    const handlePayment = useCallback(async (method, isInternational = false) => {
        if (!tossPayments) {
            alert('결제 시스템을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        if (!isTermsAgreed) {
            alert('이용약관에 동의해주세요.');
            return;
        }

        try {
            const orderId = generateOrderId();
            const customerKey = generateCustomerKey();

            // 결제창 초기화
            const payment = tossPayments.payment({
                customerKey: customerKey
            });

            // 결제 정보 계산
            const selectedPlan = selectedMembershipPlan ?
                pricePlans.find((item) => item.id === selectedMembershipPlan.planName) : null;

            const paymentAmount = selectedPlan ?
                (selectedPaymentType === 'yearly' ? selectedPlan.pricing.krw.yearlyTotal : selectedPlan.pricing.krw.monthly)
                : 10000;

            const planName = `${selectedMembershipPlan?.planName?.toUpperCase()} 플랜 (${selectedPaymentType === 'yearly' ? '연간' : '월간'})`;

            const paymentData = {
                method: method,
                amount: {
                    currency: 'KRW',
                    value: paymentAmount,
                },
                orderId: orderId,
                orderName: planName,
                successUrl: `${window.location.origin}/payment?r=success`,
                failUrl: `${window.location.origin}/payment?r=fail`,
                customerEmail: 'customer@example.com',
                customerName: '고객',
                customerMobilePhone: '01012345678',
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

        } catch (err) {
            console.error('[TossPayments] requestPayment error:', err);
            alert('결제 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    }, [tossPayments, isTermsAgreed, selectedMembershipPlan, selectedPaymentType]);

    function formatNumberKR(num) {
        return Number(num).toLocaleString('ko-KR');
    }

    // 안전한 가격 정보 가져오기
    const selectedPlan = selectedMembershipPlan ?
        pricePlans.find((item) => item.id === selectedMembershipPlan.planName) : null;

    const priceYearlyMonthly = selectedPlan?.pricing.krw.yearlyMonthly || 0; // 연간 결제 시 월 단가
    const priceMonthly = selectedPlan?.pricing.krw.monthly || 0; // 월간 결제 가격
    const priceYearlyTotal = selectedPlan?.pricing.krw.yearlyTotal || 0; // 연간 총액
    const monthlySavings = priceMonthly - priceYearlyMonthly;
    const savings = selectedPlan?.pricing.krw.savings || 0; // 절약 금액 (총)

    return (
        <CheckoutWrapper>
            <CheckoutPage className="bg-foreground/3">
                <Logo className="mb-20" />

                <CheckoutTicker name="subscription" />
                <div className="text-5xl uppercase">
                    {selectedMembershipPlan?.planName || 'Unknown'} Plan
                </div>
                <div className="">
                    {selectedPlan?.features?.map((feature, index) => (
                        <CheckoutFeature key={(selectedMembershipPlan?.plan_id || 'unknown') + index}>{feature}</CheckoutFeature>
                    )) || <div>플랜 정보를 불러올 수 없습니다.</div>}
                </div>

                <div className="mt-20" />
                <div className="flex flex-row gap-5">
                    <SelectPlan
                        data={{
                            price: `${formatNumberKR(priceYearlyMonthly)}원`,
                            priceHighlight: true,
                            interval: " / 월 (연간결제)",
                            promotionRatio: savings > 0 ? `${formatNumberKR(savings)}원 절약` : '',
                            description: `${selectedMembershipPlan?.planName?.toUpperCase()}플랜 - 연간 결제`
                        }}
                        onClick={() => setSelectedPaymentType('yearly')}
                        selected={selectedPaymentType === 'yearly'}
                    />
                    <SelectPlan
                        data={{
                            price: `${formatNumberKR(priceMonthly)}원`,
                            priceHighlight: true,
                            interval: " / 월",
                            description: `${selectedMembershipPlan?.planName?.toUpperCase()}플랜 - 월간 결제`
                        }}
                        onClick={() => setSelectedPaymentType('monthly')}
                        selected={selectedPaymentType === 'monthly'}
                    />
                </div>
                <div className="text-2xl">
                    {/* 39,000 KRW (VAT포함) */}
                </div>

                <div className="text-xs opacity-30">
                    주식회사 휘릭에이아이 <br />
                    이용약관 l 개인정보처리방침
                </div>
            </CheckoutPage>
            <CheckoutPage>
                <div className="mt-0" />
                <div className="w-full flex flex-col gap-5 rounded-sm p-10 bg-foreground/2">
                    <CalculateDetail name="" content={`${selectedMembershipPlan?.planName?.toUpperCase()} PLAN`} className="font-bold text-lg mb-3" />
                    {selectedPaymentType === 'yearly' ? (
                        <div key="yearly-plan">
                            <CalculateDetail name="월 단가" content={priceYearlyMonthly} animated />
                            <CalculateDetail name="할인" content={-monthlySavings} animated />
                            <CalculateDetail name="연간 총액" content={priceYearlyTotal + savings} className="mt-7" animated />
                            <CalculateDetail name="할인 총액" content={-savings} animated />
                            <CalculateDetail name="최종 결제 금액" content={priceYearlyTotal} total className="mt-5" animated />
                        </div>
                    ) : (
                        <div key="monthly-plan">
                            <CalculateDetail name="월간 요금" content={priceMonthly} animated />
                            <CalculateDetail name="할인 금액" content={0} animated />
                            <CalculateDetail name="최종 결제 금액" content={priceMonthly} total className="mt-5" animated />
                        </div>
                    )}
                </div>

                <div className="w-full flex flex-col gap-5 rounded-sm p-10 bg-foreground/2">
                    <div className="text-lg font-semibold">결제방법</div>

                    {/* Payment Options Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <label className="flex flex-row items-center p-4 border border-zinc-300 dark:border-zinc-600 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors">
                            <input
                                type="radio"
                                name="payment"
                                value="CARD"
                                className="mr-3 text-blue-600"
                                defaultChecked
                                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                            />
                            <div className="flex items-center justify-between w-full">
                                <div>
                                    <span className="font-medium text-sm">국내 카드</span>
                                    <div className="text-xs text-gray-500">신용카드, 체크카드</div>
                                </div>
                                {/* <div className="text-2xl">💳</div> */}
                            </div>
                        </label>

                        <label className="flex flex-row items-center p-4 border border-zinc-300 dark:border-zinc-600 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors">
                            <input
                                type="radio"
                                name="payment"
                                value="FOREIGN_CARD"
                                className="mr-3 text-blue-600"
                                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                            />
                            <div className="flex items-center justify-between w-full">
                                <div>
                                    <span className="font-medium text-sm">해외 카드</span>
                                    <div className="text-xs text-gray-500">VISA, Master, JCB, UnionPay</div>
                                </div>
                                {/* <div className="text-2xl">🌍</div> */}
                            </div>
                        </label>

                        {/* <label className="flex flex-row items-center p-4 border border-zinc-300 dark:border-zinc-600 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors">
                            <input
                                type="radio"
                                name="payment"
                                value="VIRTUAL_ACCOUNT"
                                className="mr-3 text-blue-600"
                                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                            />
                            <div className="flex items-center justify-between w-full">
                                <div>
                                    <span className="font-medium text-sm">가상계좌</span>
                                    <div className="text-xs text-gray-500">계좌이체</div>
                                </div>
                            </div>
                        </label>

                        <label className="flex flex-row items-center p-4 border border-zinc-300 dark:border-zinc-600 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors">
                            <input
                                type="radio"
                                name="payment"
                                value="TRANSFER"
                                className="mr-3 text-blue-600"
                                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                            />
                            <div className="flex items-center justify-between w-full">
                                <div>
                                    <span className="font-medium text-sm">계좌이체</span>
                                    <div className="text-xs text-gray-500">실시간 계좌이체</div>
                                </div>
                            </div>
                        </label> */}
                    </div>

                    {/* Security Notice */}
                    <div className="flex flex-col gap-3 items-start space-x-2 text-sm text-zinc-600 dark:text-zinc-400 mt-4">
                        {/* <div className="flex flex-row">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            <span>SSL 보안 결제</span>
                        </div> */}
                        <div>
                            <input
                                type="checkbox"
                                name="terms"
                                checked={isTermsAgreed}
                                onChange={(e) => setIsTermsAgreed(e.target.checked)}
                                className="mr-1 text-blue-600"
                            />
                            <span className="font-medium text-sm">이용약관에 동의합니다.</span>
                        </div>
                    </div>

                </div>

                <Button
                    name={tossPayments ? "결제하기" : "결제 시스템 로딩 중..."}
                    className={`w-full ${(!isTermsAgreed || !tossPayments) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    bg={(isTermsAgreed && tossPayments) ? "bg-purple-600 font-bold" : "bg-gray-400 font-bold"}
                    onClick={() => {
                        if (selectedPaymentMethod === 'FOREIGN_CARD') {
                            handlePayment('CARD', true);
                        } else {
                            handlePayment(selectedPaymentMethod, false);
                        }
                    }}
                />
                <Button
                    name="(dev only) 결제성공or실패"
                    onClick={() => { router.push('/payment') }}
                />
            </CheckoutPage>

        </CheckoutWrapper>
    );
}
