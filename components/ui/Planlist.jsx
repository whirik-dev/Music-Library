import { IconCheck } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button";
import pricePlans from "@/data/pricePlans";
import useModalStore from "@/stores/modalStore";
const Planlist = () => {
    const router = useRouter();
    const { init } = useModalStore();

    const upgradeBtnHandler = () => {
        init(); // 모달 상태 초기화 (path, depth, modalParameter 등 모두 초기화)
        router.push('/price');
    }


    return (
        <div className="px-3">
            <ul>
                {pricePlans.map((plan) => (
                    <li key={plan.id} className={`border-1 mb-4 rounded-md ${plan.id === 'pro' ? 'border-purple-400' : plan.id === 'master' ? 'border-orange-400' : 'border-white/60'}`}>
                        <div className="uppercase font-bold p-4">
                            {plan.name} plan
                        </div>
                        <div className="pl-4 pr-1">
                            <div className="flex flex-row items-center">
                                <div className="flex-1">
                                    <div className="text-2xl font-bold">
                                        {plan.pricing.usd.monthly} USD
                                        <span className="text-sm">/mo.</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <Button name="upgrade now" onClick={upgradeBtnHandler} />
                                </div>
                            </div>
                        </div>
                        <div className="p-4">
                            {plan.features.map((feature) => (
                                <div key={feature} className="flex flex-row gap-2 items-center">
                                    <div className="size-5 bg-orange-400 flex items-center justify-center rounded-full">
                                        <IconCheck size="16" className="inline" />
                                    </div>
                                    {feature}
                                </div>
                            ))}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Planlist;