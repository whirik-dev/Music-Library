import { useTranslations } from 'next-intl';
import useToggle from "@/utils/useToggle";

import Indicator from "@/components/ui/Indicator";
import ModalCard from "@/components/modal/ModalCard";

import modalStore from "@/stores/modalStore";

const ModaTailoredListItem = ({ type, data }) => {
    const t = useTranslations('modal');
    
    return (
        <div className="border-b-1 border-zinc-500/50">
            <div className={`flex flex-row w-full py-2 ${type === "head" ? "text-foreground" : "text-foreground/50"}`}>
                <div className="w-1/5 flex justify-start">
                    {type === "head" ? t('work_name') : data.name}
                </div>
                <div className="w-1/5 flex flex-row gap-2 items-center justify-start capitalize">
                {type != "head" && <Indicator status={data.status === "done" ? "success" : data.status === "in progress" ? "warning" : "off"}/>}
                    {type === "head" ? t('status') : data.status}
                </div>
                <div className="w-1/5 flex flex-row gap-2 items-center justify-start capitalize">
                    {type === "head" ? t('last_updated') : data.last_updated}
                </div>
                <div className="ml-auto">
                    {t('btn_area')}
                </div>
            </div>
        </div>
    )
}

const ModalPageTailored = ({}) => {
    const t = useTranslations('modal');
    
    useToggle(
        () => {
            toggleExpand();
            setDepth(1);
        },
        () => {
            toggleExpand();
        }
    );
    const { toggleExpand, setPath, setDepth } = modalStore();
    return (
        <>
            <ModalCard title={t('tailored_service')} desc={t('desc')}/>
            <div className="flex flex-col px-3">
                <ModaTailoredListItem type="head" />
                <ModaTailoredListItem data={{name:"work name1", last_updated:"2024-02-13 11:32:51", status:"closed", feedback:"?url"}}/>
                <ModaTailoredListItem data={{name:"work name2", last_updated:"2024-02-13 11:32:51", status:"done", feedback:"?url"}}/>
                <ModaTailoredListItem data={{name:"work name3", last_updated:"2024-02-13 11:32:51", status:"in progress", feedback:"?url"}}/>
                <ModaTailoredListItem data={{name:"work name4", last_updated:"2024-02-13 11:32:51", status:"closed", feedback:"?url"}}/>
            </div>
        </>
    )
}
export default ModalPageTailored