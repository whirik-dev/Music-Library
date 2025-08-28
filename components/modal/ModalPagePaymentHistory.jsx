import useToggle from "@/utils/useToggle";
import modalStore from "@/stores/modalStore";

import ModalCard from "@/components/modal/ModalCard";

const ModalPageDownloadHistoryItem = ({ type, data }) => {
    return (
        <div className="border-b-1 border-zinc-500/50">
            <div className={`flex flex-row w-full py-2 ${type === "head" ? "text-foreground" : "text-foreground/50"}`}>
                <div className="w-1/5 flex flex-row gap-2 items-center justify-start capitalize">
                    {type === "head" ? "Date" : data.date}
                </div>
                <div className="w-1/5 flex justify-start">
                    {type === "head" ? "Plan" : data.plan}
                </div>
                <div className="w-1/5 flex justify-start">
                    {type === "head" ? "Amount" : data.amount}
                </div>
                <div className="w-1/5 flex flex-row gap-2 items-center justify-start capitalize">
                    {type === "head" ? "Status" : data.status}
                </div>
                <div className="ml-auto">
                    [btn area]
                </div>
            </div>
        </div>
    )
}

const ModalPageDownloadHistory = ({}) => {

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
            <ModalCard title="Payment History" desc="desc"/>
            <div className="mx-3">
                <ModalPageDownloadHistoryItem type="head" data={{ name:`asd`, timestamp:`2025-01-04` }}/>
                <ModalPageDownloadHistoryItem data={{ date:`2025-01-04`,plan:`basic`, amount:`7.99 USD`, status:`success` }}/>
            </div>
        </>
    )
}
export default ModalPageDownloadHistory;