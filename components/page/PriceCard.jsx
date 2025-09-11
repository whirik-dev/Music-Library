"use client";

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { IconCheck } from "@tabler/icons-react"
import Button from "@/components/ui/Button2";
import paymentStore from "@/stores/paymentStore";
import pricePlans from "@/data/pricePlans";

const priceItems = [
    {
        plan_id: "basic-01",
        planName: "basic",
        price: "7.99",
        feature: [
            "Unlimited downloads",
            "2 music distribution channels",
            "3 normal revision services per month"
        ],
        customStyle: "shadow-xl",
    },
    {
        plan_id: "pro-01",
        planName: "pro",
        price: "14.99",
        feature: [
            "Unlimited downloads",
            "Add 10 music distribution channels",
            "5 normal revision services per month",
            "1 advanced revision service per month",
        ],
        customStyle: "shadow-xl",
        accent: "bg-purple-700",
        primary: true,
    },
    {
        plan_id: "master-01",
        planName: "master",
        price: "35.99",
        feature: [
            "Customizable distribution channels",
            "Unlimited downloads",
            "Tailored revision services",
            "Priority support and dedicated",
        ],
        accent: "bg-orange-500/50 backdrop-blur-sm",
        customStyle: "shadow-xl shadow-orange-900/50",
    }
]

const PriceCardItem = ({ content }) => {
    const router = useRouter();
    const t = useTranslations('pricing');

    const setSelectedMembershipPlan = paymentStore(state => state.setSelectedMembershipPlan);


    const handleSelect = () => {
        setSelectedMembershipPlan({
            plan_id: content.plan_id,
            planName: content.planName,
        });

        router.push('/checkout');
    };

    function formatNumberKR(num) {
        return Number(num).toLocaleString('ko-KR');
    }
    return (
        <div className={`${content.primary && "z-20 scale-110"} flex-1 ${content.accent ? content.accent : "bg-zinc-800/50 backdrop-blur-sm"} 
                         flex flex-col gap-20 px-10 py-8 first:rounded-l-xl last:rounded-r-xl ${content.accent && "rounded-xl"} ${content.customStyle}
        `}
        >
            <div className="font-black uppercase text-lg">
                {t(content.planName)}
            </div>
            <div className="flex flex-col gap-5">
                <div className="flex flex-row gap-4">
                    <div className="text-5xl font-black">
                        {formatNumberKR(pricePlans.filter((item) => item.id === content.planName)[0].pricing.krw.monthly)}
                    </div>
                    <div className="flex flex-col gap-0 text-base/4 justify-center">
                        <div>{t('krw')}</div>
                        <div>{t('per_month')}</div>
                    </div>
                </div>
                <div className="w-2/3">
                    <Button
                        name={t('select_plan')}
                        bg="bg-zinc-300"
                        color="text-zinc-800"
                        onClick={handleSelect}
                    />
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <div className="font-bold">{t('features')}</div>
                {pricePlans.filter((item) => item.id === content.planName)[0].features.map((feature, index) => (
                    <div key={content.plan_id + index} className="flex flex-row gap-2">
                        <div className="size-5 bg-orange-400 flex items-center justify-center rounded-full">
                            <IconCheck size="16" className="inline" />
                        </div>
                        <div className="text-sm">
                            {feature}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const PriceCard = () => {
    return (
        <div className="w-5xl flex flex-row mx-auto mt-20">
            {priceItems.map((item) => (
                <PriceCardItem key={item.plan_id} content={item} />
            ))}
        </div>
    )
}

export default PriceCard;
