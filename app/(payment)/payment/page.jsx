"use client"
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { IconCheck } from "@tabler/icons-react";

import usePaymentStore from "@/stores/paymentStore";
import useUiStore from "@/stores/uiStore";

import Button from "@/components/ui/Button2";


const PaymentPageWrapper = ({ children }) => {
    return (
        <div className="w-screen">
            <div className="flex flex-col lg:flex-row lg:h-screen items-center justify-center">
                {children}
            </div>
        </div>
    )
}

export default function Payment() {
    const router = useRouter();
    const {
        paymentStep,
        setPaymentStep,
        selectedMembershipPlan,
        setSelectedMembershipPlan
    } = usePaymentStore();
    const { 
        setCurrentPopup, 
        setCurrentPopupArgument 
    } = useUiStore();
    const [isSuccess, setIsSuccesss] = useState(false);

    const paymentSuccessHandler = () => {
        router.push('/');
        setCurrentPopup("membership");
        setCurrentPopupArgument({planName: selectedMembershipPlan.planName});
    }
    return (
        <PaymentPageWrapper>
            <div className="text-center flex flex-col justify-center items-center gap-3">
                <div className="size-48 flex items-center justify-center border-6 rounded-full p-3 opacity-10">
                    <IconCheck size={100} className="" />
                </div>
                <div className="my-10 capitalize">
                    {isSuccess ? "결제가 성공적으로 이루어졌습니다." : "결제가 실패했습니다."}
                </div>
                {isSuccess ? (
                    <>
                        <Button className="w-full" name="영수증 보기"/>
                        <Button className="w-full" name="확인" onClick={paymentSuccessHandler}/>
                    </>
                ) : (
                    <>
                        <Button className="w-full" name="이전 단계로" onClick={()=>router.push("/checkout")}/>
                        <Button className="w-full opacity-10" name="DEV: 성공으로 바꾸기" onClick={()=>setIsSuccesss(true)}/>
                    </>
                )}
            </div>
        </PaymentPageWrapper>
    )
}
