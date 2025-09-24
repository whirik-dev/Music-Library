import { useTranslations } from 'next-intl';
import useToggle from "@/utils/useToggle";
import modalStore from "@/stores/modalStore";

import ModalCard from "@/components/modal/ModalCard";
import Planlist from "@/components/ui/Planlist";

const ModalPageUpgradePlan = ({}) => {
    const t = useTranslations('modal');

    useToggle(() => {
        setDepth(2);
    });

    const { toggleExpand, path, depth, setDepth } = modalStore();

    return (
        <>
            <ModalCard title={t('upgrade_plans')}/>
            <Planlist />
        </>
    )
}
export default ModalPageUpgradePlan;