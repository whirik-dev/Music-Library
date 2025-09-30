"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { IconCheck, IconStar } from "@tabler/icons-react";
import useAuthStore from '@/stores/authStore';
import usePaymentStore from '@/stores/paymentStore';
import modalStore from "@/stores/modalStore";
import pricePlans from "@/data/pricePlans";
import ModalCard from "@/components/modal/ModalCard";

const UpgradePlanItem = ({ plan, isYearly, isPopular, onSelect }) => {
    const t = useTranslations('pricing');

    function formatNumberKR(num) {
        return Number(num).toLocaleString('ko-KR');
    }

    const currentPrice = isYearly ? plan.pricing.krw.yearlyMonthly : plan.pricing.krw.monthly;
    const originalPrice = plan.pricing.krw.monthly;
    const savings = isYearly ? plan.pricing.krw.savings : 0;
    const discount = isYearly ? Math.round(((originalPrice - plan.pricing.krw.yearlyMonthly) / originalPrice) * 100) : 0;

    return (
        <div className={`
            relative bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50
            flex flex-col gap-4 p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl
            ${isPopular ? 'ring-2 ring-purple-500 bg-gradient-to-b from-purple-900/20 to-zinc-800/50' : ''}
        `}>
            {isPopular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <IconStar size={12} />
                        {t('most_popular')}
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-1">
                <h3 className="font-black uppercase text-lg text-white">
                    {t(plan.id)}
                </h3>
                <p className="text-zinc-400 text-xs">
                    {t(`${plan.id}_description`)}
                </p>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">
                        ₩{formatNumberKR(currentPrice)}
                    </span>
                    <span className="text-zinc-400 text-xs">
                        / {t('per_month')}
                    </span>
                </div>
                <p className="text-zinc-500 text-xs">
                    {t('vat_separate')}
                </p>

                {isYearly && (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="text-zinc-400 line-through text-xs">
                                ₩{formatNumberKR(originalPrice)}
                            </span>
                            <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                                {discount}% OFF
                            </span>
                        </div>
                        <p className="text-green-400 text-xs">
                            연간 ₩{formatNumberKR(savings)} 절약
                        </p>
                    </div>
                )}

                <button
                    onClick={() => onSelect(plan, isYearly)}
                    className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors duration-200 ${isPopular
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "bg-zinc-300 hover:bg-zinc-200 text-zinc-800"
                        }`}
                >
                    {t('select_plan')}
                </button>
            </div>

            <div className="flex flex-col gap-2">
                <h4 className="font-bold text-white text-sm">{t('features')}</h4>
                <div className="space-y-1">
                    {plan.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                            <div className="size-4 bg-green-500 flex items-center justify-center rounded-full flex-shrink-0 mt-0.5">
                                <IconCheck size="10" className="text-white" />
                            </div>
                            <span className="text-xs text-zinc-300 leading-relaxed">
                                {feature}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-2 p-2 bg-zinc-700/30 rounded-lg">
                    <div className="text-xs text-zinc-400">
                        {t('monthly_credits')}: <span className="text-white font-bold">{plan.monthlyCredits}</span>
                        <span className="ml-2 bg-orange-500 text-white px-1 py-0.5 rounded text-xs font-bold">
                            {t('bonus')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ModalPageUpgradePlan = () => {
    const [isYearly, setIsYearly] = useState(true);
    const t = useTranslations('modal');
    const tPricing = useTranslations('pricing');
    const router = useRouter();

    const membership = useAuthStore(state => state.membership);
    const setSelectedMembershipPlan = usePaymentStore(state => state.setSelectedMembershipPlan);
    const { init } = modalStore();

    // 현재 플랜보다 상위 플랜만 필터링
    const getUpgradeablePlans = () => {
        const planOrder = ['free', 'basic', 'pro', 'master'];
        const currentPlanIndex = planOrder.indexOf(membership || 'free');

        return pricePlans.filter((plan, index) => {
            const planIndex = planOrder.indexOf(plan.id);
            return planIndex > currentPlanIndex;
        });
    };

    const upgradeablePlans = getUpgradeablePlans();

    const handlePlanSelect = (plan, isYearly) => {
        setSelectedMembershipPlan({
            plan_id: `${plan.id}-${isYearly ? 'yearly' : 'monthly'}`,
            planName: plan.id,
            billing: isYearly ? 'yearly' : 'monthly'
        });

        init(); // 모달 닫기
        router.push('/checkout');
    };

    if (upgradeablePlans.length === 0) {
        return (
            <div className="flex flex-col h-full">
                <ModalCard title={t('upgrade_plans')} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="p-6 text-center">
                        <div className="text-zinc-400 mb-4">
                            You're already on the highest plan!
                        </div>
                        <div className="text-2xl font-bold text-white mb-2">
                            {membership?.toUpperCase()} PLAN
                        </div>
                        <p className="text-zinc-500 text-sm">
                            Thank you for being a premium member.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <ModalCard title={t('upgrade_plans')} />

            <div className="flex-1 overflow-y-auto">
                <div className="p-4 pb-6">
                    {/* Billing Toggle */}
                    <div className="flex justify-center mb-6">
                        <div className="bg-zinc-800/50 backdrop-blur-sm p-1 rounded-lg border border-zinc-700/50">
                            <div className="flex">
                                <button
                                    onClick={() => setIsYearly(false)}
                                    className={`px-4 py-2 rounded-md text-xs font-medium transition-all duration-200 ${!isYearly
                                        ? 'bg-white text-zinc-900 shadow-lg'
                                        : 'text-zinc-400 hover:text-white'
                                        }`}
                                >
                                    {tPricing('monthly_payment')}
                                </button>
                                <button
                                    onClick={() => setIsYearly(true)}
                                    className={`px-4 py-2 rounded-md text-xs font-medium transition-all duration-200 relative ${isYearly
                                        ? 'bg-white text-zinc-900 shadow-lg'
                                        : 'text-zinc-400 hover:text-white'
                                        }`}
                                >
                                    {tPricing('yearly_payment')}
                                    <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded-full">
                                        최대 28%
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Current Plan Info */}
                    <div className="mb-6 p-3 bg-zinc-700/30 rounded-lg border border-zinc-600/50">
                        <div className="text-xs text-zinc-400 mb-1">Current Plan</div>
                        <div className="text-sm font-bold text-white uppercase">
                            {membership || 'FREE'} PLAN
                        </div>
                    </div>

                    {/* Upgrade Plans */}
                    <div className="space-y-4">
                        {upgradeablePlans.map((plan, index) => (
                            <UpgradePlanItem
                                key={plan.id}
                                plan={plan}
                                isYearly={isYearly}
                                isPopular={index === 0} // 첫 번째 업그레이드 가능한 플랜을 인기 플랜으로 설정
                                onSelect={handlePlanSelect}
                            />
                        ))}
                    </div>

                    {/* Additional Info */}
                    <div className="mt-6 text-center">
                        <p className="text-zinc-500 text-xs">
                            {tPricing('cancel_anytime')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalPageUpgradePlan;