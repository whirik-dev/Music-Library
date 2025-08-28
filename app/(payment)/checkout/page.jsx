"use client"
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import usePaymentStore from "@/stores/paymentStore";

import Logo from "@/components/Logo";
import Button from "@/components/ui/Button2";
import PaymentModal from "@/components/payment/PaymentModal";

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
        setSelectedMembershipPlan
    } = usePaymentStore();

    // 선택된 결제 방식 상태 (yearly: 연간, monthly: 월간)
    const [selectedPaymentType, setSelectedPaymentType] = useState('yearly');
    // 이용약관 동의 상태
    const [isTermsAgreed, setIsTermsAgreed] = useState(false);

    useEffect(() => {
        // selectedMembershipPlan이 없거나 필수 속성이 없으면 가격 페이지로 리다이렉트
        // 단, paymentStep이 'payment'일 때는 리다이렉트하지 않음 (결제 진행 중)
        if ((!selectedMembershipPlan ||
            !selectedMembershipPlan.planName ||
            !selectedMembershipPlan.plan_id) &&
            paymentStep !== 'payment') {
            router.push('/price');
        }
    }, [selectedMembershipPlan, router, paymentStep])

    function nextStepHandler() {
        if (!isTermsAgreed) {
            alert('이용약관에 동의해주세요.');
            return;
        }
        setPaymentStep('payment');
    }

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
                    <div className="grid grid-cols-3 gap-3">
                        <label className="flex flex-row items-center p-4 border border-zinc-300 dark:border-zinc-600 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors">
                            <input type="radio" name="payment" value="card" className="mr-3 text-blue-600" defaultChecked />
                            <span className="font-medium text-sm">신용카드</span>
                        </label>

                        {/* <label className="flex flex-row items-center p-4 border border-zinc-300 dark:border-zinc-600 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors">
                            <input type="radio" name="payment" value="card" className="mr-3 text-blue-600" defaultChecked />
                            <span className="font-medium text-sm">해외신용카드</span>
                        </label>

                        <label className="flex flex-row items-center p-4 border border-zinc-300 dark:border-zinc-600 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors">
                            <input type="radio" name="payment" value="paypal" className="mr-3 text-blue-600" />
                            <div className="text-blue-600 font-bold text-sm mr-3">PayPal</div>
                            <span className="font-medium text-sm">PayPal</span>
                        </label>

                        <label className="flex flex-row items-center p-4 border border-zinc-300 dark:border-zinc-600 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors">
                            <input type="radio" name="payment" value="kakaopay" className="mr-3 text-blue-600" />
                            <div className="w-16 h-6 bg-yellow-400 rounded flex items-center justify-center mr-3">
                                <span className="text-xs font-bold text-black">Kakao</span>
                            </div>
                            <span className="font-medium text-sm">카카오페이</span>
                        </label>

                        <label className="flex flex-row items-center p-4 border border-zinc-300 dark:border-zinc-600 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors">
                            <input type="radio" name="payment" value="naverpay" className="mr-3 text-blue-600" />
                            <div className="w-16 h-6 bg-green-500 rounded flex items-center justify-center mr-3">
                                <span className="text-xs font-bold text-white">NAVER</span>
                            </div>
                            <span className="font-medium text-sm">네이버페이</span>
                        </label>

                        <label className="flex flex-row items-center p-4 border border-zinc-300 dark:border-zinc-600 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors">
                            <input type="radio" name="payment" value="apple" className="mr-3 text-blue-600" />
                            <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                            </svg>
                            <span className="font-medium text-sm">Apple Pay</span>
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
                    name="결제하기"
                    className={`w-full ${!isTermsAgreed ? 'opacity-50 cursor-not-allowed' : ''}`}
                    bg={isTermsAgreed ? "bg-purple-600 font-bold" : "bg-gray-400 font-bold"}
                    onClick={nextStepHandler}
                />
                <Button
                    name="(dev only) 결제성공or실패"
                    onClick={()=>{router.push('/payment')}}
                />
            </CheckoutPage>
            <PaymentModal onClose={() => setPaymentStep(null)} />
        </CheckoutWrapper>
    );
}
