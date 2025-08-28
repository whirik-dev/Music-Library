"use client"
import ModalUi from "@/components/modal/ModalUi";
import usePaymentStore from "@/stores/paymentStore";
import Button from "@/components/ui/Button2";

export function CheckoutDetails({ title, content }) {

    return (
        <li className="flex flex-row gap-10">
            <div className="">
                {title}
            </div>
            <div className="flex-1">
                {content}
            </div>
        </li>
    )
}

const CheckoutModal = ({ }) => {
    const {
        paymentStep,
        setPaymentStep
    } = usePaymentStore();

    function nextStepHandler() {
        setPaymentStep('payment');
    }

    return (
        <>
            {paymentStep === 'checkout' ? (
                <div className={`fixed inset-0 z-[100] bg-black/30 flex items-center justify-center`}>
                    <div className={`w-xl min-h-[320px] p-3 bg-background border-foreground/10 border-1 rounded-xl`}>
                        <div className="flex flex-row gap-10 mb-20">
                            <div className="">
                                <div className="inline-block mb-3 border-1 bg-foreground text-background font-bold uppercase p-1 text-xs rounded-sm">
                                    subscription
                                </div>
                                <div className="text-3xl">
                                    Basic Plan
                                </div>
                            </div>
                            <div className="flex-1">
                                <ul className="mt-22 flex flex-col gap-3">
                                    <CheckoutDetails title="결제금액" content="30,000" />
                                    <CheckoutDetails title="결제주기" content="1개월 (매월 10일)" />
                                    <CheckoutDetails title="결제주기" content="1개월 (매월 10일)" />
                                </ul>
                            </div>
                        </div>

                        <Button name="결제하기" onClick={nextStepHandler} />
                    </div>
                </div>
            ) : (<></>)}
        </>
    )
}
export default CheckoutModal;