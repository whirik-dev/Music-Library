"use client"
import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconCheck, IconX } from "@tabler/icons-react";

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
    const searchParams = useSearchParams();
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

    // URL 쿼리 파라미터에서 결제 결과 확인
    const paymentResult = searchParams.get('r');
    const orderId = searchParams.get('orderId');
    const paymentKey = searchParams.get('paymentKey');
    const amount = searchParams.get('amount');

    const [isSuccess, setIsSuccesss] = useState(paymentResult === 'success');

    const paymentSuccessHandler = () => {
        router.push('/');
        setCurrentPopup("membership");
        setCurrentPopupArgument({ planName: selectedMembershipPlan.planName });
    }

    // 결제 결과에 따라 초기 상태 설정
    useEffect(() => {
        if (paymentResult === 'success') {
            setIsSuccesss(true);
        } else if (paymentResult === 'fail') {
            setIsSuccesss(false);
        }
    }, [paymentResult]);
    return (
        <PaymentPageWrapper>
            <div className="text-center flex flex-col justify-center items-center gap-3">
                <div className={`size-48 flex items-center justify-center border-6 rounded-full p-3 opacity-10 ${isSuccess ? 'border-green-500' : 'border-red-500'}`}>
                    {isSuccess ? (
                        <IconCheck size={100} className="text-green-500" />
                    ) : (
                        <IconX size={100} className="text-red-500" />
                    )}
                </div>
                <div className="my-10 capitalize">
                    {isSuccess ? "결제가 성공적으로 이루어졌습니다." : "결제가 실패했습니다."}
                </div>
                {isSuccess ? (
                    <>
                        <Button className="w-full" name="영수증 보기" />
                        <Button className="w-full" name="확인" onClick={paymentSuccessHandler} />
                    </>
                ) : (
                    <>
                        <Button className="w-full" name="이전 단계로" onClick={() => router.push("/checkout")} />
                        <Button className="w-full opacity-10" name="DEV: 성공으로 바꾸기" onClick={() => setIsSuccesss(true)} />
                    </>
                )}

                {/* 결제 정보 표시 (성공 시에만) */}
                {isSuccess && (orderId || paymentKey || amount) && (
                    <div className="p-4 bg-background rounded-lg mb-5 text-sm bg text-foreground/20">
                        {/* <h3 className="font-semibold mb-2">결제 정보</h3> */}
                        {orderId && <div>{orderId}</div>}
                        {paymentKey && <div>{paymentKey}</div>}
                        {amount && <div>{Number(amount).toLocaleString()} KRW</div>}
                    </div>
                )}
            </div>
        </PaymentPageWrapper>
    )
}
