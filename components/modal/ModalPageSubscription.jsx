import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from 'next-intl';

import useToggle from "@/utils/useToggle";
import useAuthStore from "@/stores/authStore";

import Button from "@/components/ui/Button";
import ModalCard from "@/components/modal/ModalCard";
import ModalTable from "@/components/modal/ModalTable";

import modalStore from "@/stores/modalStore";

const ModalPageSubscription = ({}) => {
    const t = useTranslations('modal');
    const { data: session, status } = useSession();
    const [userMembershipData, setUserMembershipData] = useState(null);
    const { setPath, setDepth } = modalStore();
    const {
        credits
    } = useAuthStore();

    useToggle(() => {
        setDepth(1);
    });

    useEffect(() => {
        const fetchMembership = async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/membership`, {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${session.user.ssid}`
                }
            });
            const data = await res.json();
            setUserMembershipData(data.data);
        };

        if (session.user.ssid) {
            fetchMembership();
        }

    }, [session?.user?.ssid]);

    function formatDateToDottedText(dateString) 
    {
        const date = new Date(dateString);
    
        const day = String(date.getDate()).padStart(2, '0'); // '12'
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = monthNames[date.getMonth()]; // 'Jun'
        const year = date.getFullYear(); // 2025
    
        return `${day}. ${month}. ${year}`;
    }

    function getBillingDate(dateString) {
        const date = new Date(dateString); // ISO 8601 파싱 가능
        const day = date.getDate(); // 숫자: 12
        const suffix = getOrdinalSuffix(day);
        return `${day}${suffix}`; // e.g. "12th"
    }
    
    function getOrdinalSuffix(n) {
        if (n >= 11 && n <= 13) return 'th'; // 예외 케이스
        switch (n % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    }
    const tierText = ['FREE', 'BASIC', 'PRO', 'MASTER'];

    return (
        <>
            <ModalTable head={t('credits')} 
                        data={[
                            [t('your_balance'), `${credits} credits`],
                        ]}
            />
            <ModalTable head={t('subscription_information')} 
                        data={[
                            [t('your_plan'), userMembershipData ? tierText[userMembershipData["tier"]] : '-'],
                            [t('member_since'), userMembershipData ? formatDateToDottedText(userMembershipData["started_at"]) : '-'],
                            [t('billing_date'), userMembershipData ? `${getBillingDate(userMembershipData["started_at"])}/mo.` : '-']
                        ]}
            />
            <ModalCard title={t('upgrade_plan')} desc={t('you_can_change_membership')} 
                       type="action" action="Upgrade" onClick={()=>{setPath('subscription/upgradePlan')}}/>
            <ModalCard title={t('payment_history')} desc={t('you_are_registered', { count: 3 })} 
                       type="action" action="view" onClick={()=>{setPath('subscription/paymentHistory')}}/>
            <ModalCard title={`Reedem`} desc={`Enter your code to redeem`} 
                       type="action" action="register" onClick={()=>{setPath('subscription/reedem')}}/>
        </>
    )
}
export default ModalPageSubscription