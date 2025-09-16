"use client"

import { useState, useEffect } from "react";
import { IconCheck } from "@tabler/icons-react";
import useUiStore from "@/stores/uiStore";
import useAuthStore from "@/stores/authStore";

import useConfetti from "@/hooks/useConfetti";

import PopupBase from "./PopupBase";
import Button from "@/components/ui/Button2";
import pricePlans from "@/data/pricePlans";

const MembershipPopup = () => {
    const { setCurrentPopup, currentPopupArgument } = useUiStore();
    const { userInfo, membership } = useAuthStore(); 

    const [ planName, setPlanName ] = useState(
        currentPopupArgument?.planName ? `${currentPopupArgument?.planName} plan` : 
        membership ? membership : 
        null
    );

    const { fireConfetti } = useConfetti();

    useEffect(()=>{
        setPlanName(membership);
        fireConfetti();
    })

    const popupCloseHandler = () => {
        setCurrentPopup(null);
    }

    const selectedPlan = planName ?
        pricePlans.find((item) => item.id === planName) : null;

        console.log(membership);
    return (
        <PopupBase onClose={popupCloseHandler} 
                   className={`
                    ${planName === 'basic' ? `bg-gradient-to-br! from-green-500! to-lime-500!` :
                    planName === 'pro' ? `bg-gradient-to-br from-purple-500 to-indigo-700` :
                    planName === 'master' ? `bg-gradient-to-br from-amber-500 to-amber-700` :
                    `bg-gradient-to-br from-neutral-500 to-neutral-700`}
                    transition-colors duration-1000
                   `}

        >
            <div className={`w-full h-full flex flex-col gap-5 items-center justify-center`}>
                <h2 className="text-3xl">
                    {planName && (
                        <>
                            Welcome to <span className="uppercase">{planName ? planName : 'membership'} </span>plan!
                        </>
                    )}
                </h2>
                {/* <p>${userInfo}님 지금 바로 이용 가능합니다.</p> */}
                <ul className="font-light flex flex-col gap-1">
                    {selectedPlan?.features?.map((feature, index) => (
                        <li key={(currentPopupArgument?.plan_name || 'unknown') + index} className="flex flex-row gap-1 items-center">

                            <div className={`size-5 flex items-center justify-center rounded-full
                                ${planName === 'basic' ? `bg-yellow-500 ` : 
                                    planName === 'pro' ? `bg-purple-400` :
                                    planName === 'master' ? `bg-red-500` :
                                    `bg-neutral-400`
                                }`}>
                                <IconCheck size="16" className="inline" />
                            </div>
                            {feature}
                        </li>
                    ))}
                </ul>
            </div>
            <Button name="explorer" bg="bg-foreground/10" onClick={popupCloseHandler} />
        </PopupBase>
    );
};

export default MembershipPopup;