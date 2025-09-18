"use client";

import ModalUi from "@/components/modal/ModalUi";
import ModalNav from "@/components/modal/ModalNav";
import ModalPagePreference from "@/components/modal/ModalPagePreference";
import ModalPageFavoriteList from "@/components/modal/ModalPageFavoriteList";
import ModalPageDownloadHistory from "@/components/modal/ModalPageDownloadHistory";
import ModalPageChannelManage from "@/components/modal/ModalPageChannelManage";
import ModalPageUpgradePlan from "@/components/modal/ModalPageUpgradePlan";
import ModalPagePaymentHistory from "@/components/modal/ModalPagePaymentHistory";
import ModalPageSubscription from "@/components/modal/ModalPageSubscription";
import ModalPageRedeem from "@/components/modal/ModalPageRedeem";
import ModalPageTailored from "@/components/modal/ModalPageTailored";
import ModalPageTailoredDetail from "@/components/modal/ModalPageTailoredDetail";
import modalStore from "@/stores/modalStore";

// Map paths to components
const modalComponents = {
    "preference": ModalPagePreference,
    "preference/favoriteList": ModalPageFavoriteList,
    "preference/downloadHistory": ModalPageDownloadHistory,
    "preference/channelManage": ModalPageChannelManage,
    "subscription": ModalPageSubscription,
    "subscription/upgradePlan": ModalPageUpgradePlan,
    "subscription/paymentHistory": ModalPagePaymentHistory,
    "subscription/reedem": ModalPageRedeem,
    "tailored": ModalPageTailored,
    "tailored/detail": ModalPageTailoredDetail,
};

const Modal = () => {
    const { path } = modalStore();

    // Get the component for the current path
    const ModalContent = modalComponents[path];

    return (
        <ModalUi>
            <ModalNav />
            {ModalContent ? <ModalContent /> : null}
        </ModalUi>
    );
};

export default Modal;