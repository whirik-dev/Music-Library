import { IconCheck } from "@tabler/icons-react"
import Button from "@/components/ui/Button";
const Planlist = () => {


    const priceItems = [
        {
            plan_id : "basic-01",
            planName : "basic plan",
            price : "7.99",
            feature : [
                "Unlimited downloads",
                "2 music distribution channels",
                "3 normal revision services per month"
            ],
            customStyle : "shadow-xl",
            accentB : "border-white/60"
        },
        {
            plan_id : "pro-01",
            planName : "pro plan",
            price : "14.99",
            feature : [
                "Unlimited downloads",
                "Add 10 music distribution channels",
                "5 normal revision services per month",
                "1 advanced revision service per month",
            ],
            customStyle : "shadow-xl",
            accent : "bg-purple-700",
            accentB : "border-purple-400",
            primary : true,
        },
        {
            plan_id : "master-01",
            planName : "master plan",
            price : "35.99",
            feature : [
                "Customizable distribution channels",
                "Unlimited downloads",
                "Tailored revision services",
                "Priority support and dedicated",
            ],
            accent : "bg-orange-500/50 backdrop-blur-sm",
            accentB : "border-orange-400",
            customStyle : "shadow-xl shadow-orange-900/50",
        }
    ]


    return (
        <div className="px-3">
            <ul>
                {priceItems.map((item)=>(
                <li key={item.plan_id} className={`border-1 mb-4 rounded-md ${item.accentB}`}>
                    <div className="uppercase font-bold p-4">
                        {item.planName}
                    </div>
                    <div className="pl-4 pr-1">
                        <div className="flex flex-row items-center">
                            <div className="flex-1">
                                <div className="text-2xl font-bold">
                                    {item.price} USD
                                    <span className="text-sm">/mo.</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <Button name="upgrade now"/>
                            </div>
                        </div>
                    </div>
                    <div className="p-4">
                        {item.feature.map((feature)=>(
                            <div key={feature} className="flex flex-row gap-2 items-center">
                                <div className="size-5 bg-orange-400 flex items-center justify-center rounded-full">
                                    <IconCheck size="16" className="inline"/>
                                </div>
                                {feature}
                            </div>
                        ))}
                    </div>

                    {/* <div className={`${item.accent} px-6 py-3 rounded-md m-2 text-center uppercase inline-block`}>Upgrade Now</div> */}
                </li>
                ))}
            </ul>
        </div>
    )
}

export default Planlist;