"use client"
import { useTranslations } from 'next-intl';
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
    const t = useTranslations('payment');
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
                                    {t('subscription')}
                                </div>
                                <div className="text-3xl">
                                    {t('basic_plan')}
                                </div>
                            </div>
                            <div className="flex-1">
                                <ul className="mt-22 flex flex-col gap-3">
                                    <CheckoutDetails title={t('final_payment_amount')} content="30,000" />
                                    <CheckoutDetails title={t('monthly_payment')} content="1개월 (매월 10일)" />
                                    <CheckoutDetails title={t('monthly_payment')} content="1개월 (매월 10일)" />
                                </ul>
                            </div>
                        </div>

                        <Button name={t('pay_now')} onClick={nextStepHandler} />
                    </div>
                </div>
            ) : (<></>)}
        </>
    )
}
export default CheckoutModal;