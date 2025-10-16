"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useSession } from 'next-auth/react';
import { IconCheck, IconStar } from "@tabler/icons-react"
import Button from "@/components/ui/Button2";
import paymentStore from "@/stores/paymentStore";
import useAuthStore from "@/stores/authStore";
import pricePlans from "@/data/pricePlans";

const PriceCardItem = ({ plan, isYearly, isPopular }) => {
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations('pricing');
    const { data: session } = useSession();
    const setSelectedMembershipPlan = paymentStore(state => state.setSelectedMembershipPlan);
    const setSelectedPaymentType = paymentStore(state => state.setSelectedPaymentType);
    const toggleAuthModal = useAuthStore(state => state.toggleAuthModal);

    const handleSelect = () => {
        // 로그인 체크
        if (!session) {
            // 로그인이 안 되어 있으면 로그인 모달 띄우기
            toggleAuthModal(true);
            return;
        }

        // 플랜 정보 설정
        setSelectedMembershipPlan({
            plan_id: `${plan.id}-${isYearly ? 'yearly' : 'monthly'}`,
            planName: plan.id,
            billing: isYearly ? 'yearly' : 'monthly'
        });
        
        // 결제 타입 설정
        setSelectedPaymentType(isYearly ? 'yearly' : 'monthly');
        
        console.log('Selected Plan:', {
            plan_id: `${plan.id}-${isYearly ? 'yearly' : 'monthly'}`,
            planName: plan.id,
            billing: isYearly ? 'yearly' : 'monthly',
            paymentType: isYearly ? 'yearly' : 'monthly'
        });
        
        router.push('/checkout');
    };

    const isKorean = locale === 'ko';
    const currency = isKorean ? 'krw' : 'usd';
    const currencySymbol = isKorean ? '₩' : '$';
    
    function formatNumber(num) {
        if (isKorean) {
            return Number(num).toLocaleString('ko-KR');
        }
        return Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    const currentPrice = isYearly ? plan.pricing[currency].yearlyMonthly : plan.pricing[currency].monthly;
    const originalPrice = plan.pricing[currency].monthly;
    const savings = isYearly ? (isKorean ? plan.pricing.krw.savings : (plan.pricing.usd.monthly * 12 - plan.pricing.usd.yearlyTotal)) : 0;
    const discount = isYearly ? Math.round(((originalPrice - plan.pricing[currency].yearlyMonthly) / originalPrice) * 100) : 0;

    return (
        <div className={`
            relative flex-1 bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50
            flex flex-col gap-6 p-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl
            ${isPopular ? 'ring-2 ring-purple-500 bg-gradient-to-b from-purple-900/20 to-zinc-800/50' : ''}
            sm:p-8 lg:gap-8
        `}>
            {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                        <IconStar size={16} />
                        {t('most_popular')}
                    </div>
                </div>
            )}
            
            <div className="flex flex-col gap-2">
                <h3 className="font-black uppercase text-xl lg:text-2xl text-white">
                    {t(plan.id)}
                </h3>
                <p className="text-zinc-400 text-sm">
                    {t(`${plan.id}_description`)}
                </p>
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl lg:text-5xl font-black text-white">
                            {currencySymbol}{formatNumber(currentPrice)}
                        </span>
                        <span className="text-zinc-400 text-sm">
                            / {t('per_month')}
                        </span>
                    </div>
                    <p className="text-zinc-500 text-xs">
                        {t('vat_separate')}
                    </p>
                </div>
                
                {isYearly && (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="text-zinc-400 line-through text-sm">
                                {currencySymbol}{formatNumber(originalPrice)}
                            </span>
                            <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                                {discount}% OFF
                            </span>
                        </div>
                        <p className="text-green-400 text-sm">
                            {t('yearly_savings', { amount: formatNumber(savings) })}
                        </p>
                    </div>
                )}
                
                <Button
                    name={t('select_plan')}
                    bg={isPopular ? "bg-purple-600 hover:bg-purple-700" : "bg-zinc-300 hover:bg-zinc-200"}
                    color={isPopular ? "text-white" : "text-zinc-800"}
                    onClick={handleSelect}
                    className="w-full transition-colors duration-200"
                />
            </div>

            <div className="flex flex-col gap-3">
                <h4 className="font-bold text-white">{t('features')}</h4>
                <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <div className="size-5 bg-green-500 flex items-center justify-center rounded-full flex-shrink-0 mt-0.5">
                                <IconCheck size="14" className="text-white" />
                            </div>
                            <span className="text-sm text-zinc-300 leading-relaxed">
                                {feature}
                            </span>
                        </div>
                    ))}
                </div>
                
                <div className="mt-4 p-3 bg-zinc-700/30 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-zinc-400">
                            {t('monthly_credits')}: <span className="text-white font-bold">{plan.monthlyCredits}</span>
                        </div>
                        <div className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">
                            {t('bonus')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PriceCard = () => {
    const [isYearly, setIsYearly] = useState(true);
    const t = useTranslations('pricing');

    return (
        <div className="w-full max-w-7xl mx-auto mt-12 px-4 sm:px-6 lg:px-8">
            {/* Billing Toggle */}
            <div className="flex justify-center mb-12">
                <div className="bg-zinc-800/50 backdrop-blur-sm p-1 rounded-xl border border-zinc-700/50">
                    <div className="flex">
                        <button
                            onClick={() => setIsYearly(false)}
                            className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                !isYearly 
                                    ? 'bg-white text-zinc-900 shadow-lg' 
                                    : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                            {t('monthly_payment')}
                        </button>
                        <button
                            onClick={() => setIsYearly(true)}
                            className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                                isYearly 
                                    ? 'bg-white text-zinc-900 shadow-lg' 
                                    : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                            {t('yearly_payment')}
                            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                {t('max_discount')}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Price Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {pricePlans.map((plan, index) => (
                    <PriceCardItem 
                        key={plan.id} 
                        plan={plan} 
                        isYearly={isYearly}
                        isPopular={index === 1} // PRO 플랜을 인기 플랜으로 설정
                    />
                ))}
            </div>

            {/* Additional Info */}
            <div className="mt-12 text-center">
                <p className="text-zinc-400 text-sm">
                    {t('cancel_anytime')}
                </p>
            </div>
        </div>
    );
};

export default PriceCard;
