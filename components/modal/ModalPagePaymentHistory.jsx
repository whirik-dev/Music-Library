import { useTranslations } from 'next-intl';
import useToggle from "@/utils/useToggle";
import modalStore from "@/stores/modalStore";

import ModalCard from "@/components/modal/ModalCard";

const ModalPageDownloadHistoryItem = ({ type, data }) => {
    const t = useTranslations('modal');
    
    return (
        <div className="border-b-1 border-zinc-500/50">
            <div className={`flex flex-row w-full py-2 ${type === "head" ? "text-foreground" : "text-foreground/50"}`}>
                <div className="w-1/5 flex flex-row gap-2 items-center justify-start capitalize">
                    {type === "head" ? t('date') : data.date}
                </div>
                <div className="w-1/5 flex justify-start">
                    {type === "head" ? t('plan') : data.plan}
                </div>
                <div className="w-1/5 flex justify-start">
                    {type === "head" ? t('amount') : data.amount}
                </div>
                <div className="w-1/5 flex flex-row gap-2 items-center justify-start capitalize">
                    {type === "head" ? t('status') : data.status}
                </div>
                <div className="ml-auto">
                    {t('btn_area')}
                </div>
            </div>
        </div>
    )
}

const ModalPageDownloadHistory = ({}) => {
    const t = useTranslations('modal');

    useToggle(
        () => {
            toggleExpand();
            setDepth(2);
        },
        () => {
            toggleExpand();
        }
    );

    const { toggleExpand, setDepth } = modalStore();

    return (
        <>
            <ModalCard title={t('payment_history')} desc={t('desc')}/>
            <div className="mx-3">
                <ModalPageDownloadHistoryItem type="head" data={{ name:`asd`, timestamp:`2025-01-04` }}/>
                <ModalPageDownloadHistoryItem data={{ date:`2025-01-04`,plan:`basic`, amount:`7.99 USD`, status:`success` }}/>
            </div>
        </>
    )
}
export default ModalPageDownloadHistory;