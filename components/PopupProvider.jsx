"use client"

import useUiStore from "@/stores/uiStore";

import NewbiePopup from "@/components/popup/NewbiePopup";
import MembershipPopup from "@/components/popup/MembershipPopup";
import UsagePopup from "@/components/popup/UsagePopup";

const PopupProvider = () => {

    const {
        currentPopup
    } = useUiStore();

    return (
        <>
            {/* AuthStore에서 제어 */}
            <NewbiePopup />

            {currentPopup === "membership" && (
                <MembershipPopup />
            )}

            {currentPopup === "usageAlert" && (
                <UsagePopup />
            )}
        </>
    )
}
export default PopupProvider;