"use client"
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
import { useTranslations } from 'next-intl';

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
                {data.description}, {t('payment.vat_included')}
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
        setPaymentStep,
        selectedMembershipPlan,
        setSelectedMembershipPlan,
        selectedPaymentType,
        setSelectedPaymentType
    } = usePaymentStore();
    // Terms agreement state
    const [isTermsAgreed, setIsTermsAgreed] = useState(false);
    // Selected payment method
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('CARD');

    // TossPayments instance
    const [tossPayments, setTossPayments] = useState(null);

    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT;

    useEffect(() => {
        // Redirect to price page if selectedMembershipPlan is missing or lacks required properties
        // However, do not redirect when paymentStep is 'payment' (payment in progress)
        if ((!selectedMembershipPlan ||
            !selectedMembershipPlan.planName ||
            !selectedMembershipPlan.plan_id) &&
            paymentStep !== 'payment') {
            router.push('/price');
        }
    }, [selectedMembershipPlan, router, paymentStep]);

    // Initialize TossPayments
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                if (!clientKey) throw new Error(t('errors.missing_toss_client_key'));
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

            const paymentAmount = selectedPlan ?
                (selectedPaymentType === 'yearly' ? selectedPlan.pricing.krw.yearlyTotal : selectedPlan.pricing.krw.monthly)
                : 10000;

            const planName = `${selectedMembershipPlan?.planName?.toUpperCase()} ${t('payment.plan')} (${selectedPaymentType === 'yearly' ? t('payment.yearly_payment') : t('payment.monthly_payment')})`;

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
                customerEmail: t('payment.customer_email_placeholder'),
                customerName: t('payment.customer_name_placeholder'),
                customerMobilePhone: t('payment.customer_phone_placeholder'),
            };

            // Additional options for international card payment
            if (method === 'CARD' && isInternational) {
                paymentData.card = {
                    useInternationalCardOnly: true,
                    flowMode: "DEFAULT", // Explicitly set to integrated payment window
                    useEscrow: false,
                    useCardPoint: false,
                    useAppCardOnly: false
                };
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

            await payment.requestPayment(paymentData);

        } catch (err) {
            console.error('[TossPayments] requestPayment error:', err);
            alert(t('payment.payment_error'));
        }
    }, [tossPayments, isTermsAgreed, selectedMembershipPlan, selectedPaymentType]);

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
                            <CalculateDetail name={t('payment.final_payment_amount')} content={priceYearlyTotal} total className="mt-5" animated t={t} />
                        </div>
                    ) : (
                        <div key="monthly-plan">
                            <CalculateDetail name={t('payment.monthly_charge')} content={priceMonthly} animated t={t} />
                            <CalculateDetail name={t('payment.discount_amount')} content={0} animated t={t} />
                            <CalculateDetail name={t('payment.final_payment_amount')} content={priceMonthly} total className="mt-5" animated t={t} />
                        </div>
                    )}
                </div>

                <div className="w-full flex flex-col gap-5 rounded-sm p-10 bg-foreground/2">
                    <div className="text-lg font-semibold">{t('payment.payment_methods')}</div>

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
                                    <span className="font-medium text-sm">{t('payment.domestic_card')}</span>
                                    <div className="text-xs text-gray-500">{t('payment.credit_debit_card')}</div>
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
                                    <span className="font-medium text-sm">{t('payment.foreign_card')}</span>
                                    <div className="text-xs text-gray-500">{t('payment.visa_master_description')}</div>
                                </div>
                                {/* <div className="text-2xl">🌍</div> */}
                            </div>
                        </label>
                    </div>

                    {/* Guide message when foreign card is selected */}
                    {selectedPaymentMethod === 'FOREIGN_CARD' && (
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <div className="flex items-start space-x-3">
                                <div className="text-blue-600 dark:text-blue-400 mt-0.5">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">{t('payment.foreign_card_guide_title')}</h4>
                                    <p className="mt-1 text-sm text-blue-700 dark:text-blue-200">
                                        {t('payment.foreign_card_guide_description')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

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
                        if (selectedPaymentMethod === 'FOREIGN_CARD') {
                            handlePayment('CARD', true);
                        } else {
                            handlePayment(selectedPaymentMethod, false);
                        }
                    }}
                />
            </CheckoutPage>
        </CheckoutWrapper>
    );
}
