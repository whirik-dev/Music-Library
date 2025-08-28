"use client"
import { useState, useEffect } from "react";
import useUiStore from "@/stores/uiStore";
import useConfetti from "@/hooks/useConfetti";
import PopupBase from "./PopupBase";
import Button from "@/components/ui/Button2";
import pricePlans from "@/data/pricePlans";

const MembershipPopup = () => {
    const { setCurrentPopup, currentPopupArgument } = useUiStore();

    const [ planName, setPlanName ] = useState(
        currentPopupArgument?.planName ? `${currentPopupArgument?.planName} plan` : 'Membership'
    );

    const { fireConfetti } = useConfetti();

    useEffect(()=>{
        fireConfetti();
    })

    const popupCloseHandler = () => {
        setCurrentPopup(null);
    }

    const selectedPlan = currentPopupArgument?.planName ?
        pricePlans.find((item) => item.id === currentPopupArgument?.planName) : null;

    return (
        <PopupBase onClose={popupCloseHandler}>
            <div className="w-full h-full flex flex-col gap-5 items-center justify-center">
                <h2 className="text-3xl">
                    Welcome to <span className="uppercase">{planName ? planName : "{Plan name}"}</span>
                </h2>
                <p>지금 바로 이용 가능합니다.</p>
                <ul className="font-light">
                    {selectedPlan?.features?.map((feature, index) => (
                        <li key={(currentPopupArgument?.plan_name || 'unknown') + index}>{feature}</li>
                    ))}
                </ul>
            </div>
            <Button name="close" bg="bg-neutral-500" onClick={popupCloseHandler} />
        </PopupBase>
    );
};

export default MembershipPopup;