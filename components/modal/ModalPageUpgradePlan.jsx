import useToggle from "@/utils/useToggle";
import modalStore from "@/stores/modalStore";

import ModalCard from "@/components/modal/ModalCard";
import Planlist from "@/components/ui/Planlist";

const ModalPageUpgradePlan = ({}) => {

    useToggle(() => {
        setDepth(2);
    });

    const { toggleExpand, path, depth, setDepth } = modalStore();

    return (
        <>
            <ModalCard title="Upgrade Plans" desc="Channel..."/>
            <Planlist />
        </>
    )
}
export default ModalPageUpgradePlan;