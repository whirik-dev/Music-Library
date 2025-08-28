"use client"
import { useRouter } from "next/navigation"
import { useState } from "react";

import useUiStore from "@/stores/uiStore";

import PopupBase from "./PopupBase";
import Button from "@/components/ui/Button2";

const UsagePopup = () => {
    const router = useRouter();
    const { setCurrentPopup } = useUiStore();

    const [ isOpen, setIsOpen ] = useState(true);
    const [ planName, setPlanName ] = useState(null);

    const popupCloseHandler = () => {
        setCurrentPopup(null);
    };

    const movePricePageHandler = () => {
        router.push('/price');
        setCurrentPopup(null);
    }

    return (
        <>
            <PopupBase onClose={popupCloseHandler}>
                <div className="w-full h-full flex flex-col gap-5 items-center justify-center">
                    <h2 className="text-3xl">다운로드 크레딧을 모두 소모하였습니다.</h2>
                    <p>멤버십에 가입하면 고음질 무제한 다운로드를 이용할 수 있습니다.</p>
                </div>
                <Button name="Subscribe to membership" bg="bg-neutral-500" onClick={movePricePageHandler} />
            </PopupBase>
        </>
    );
};

export default UsagePopup;