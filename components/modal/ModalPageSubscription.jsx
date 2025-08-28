import { useEffect, useState } from "react";
import { useJWTAuth } from "@/hooks/useJWTAuth";

import useToggle from "@/utils/useToggle";
import useAuthStore from "@/stores/authStore";

import Button from "@/components/ui/Button";
import ModalCard from "@/components/modal/ModalCard";
import ModalTable from "@/components/modal/ModalTable";

import modalStore from "@/stores/modalStore";

const ModalPageSubscription = ({}) => {
    const { data: session, status } = useJWTAuth();
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
            try {
                const res = await fetch('/api/user/membership', {
                    method: 'GET',
                    credentials: 'include'
                });
                const result = await res.json();
                
                if (result.success) {
                    setUserMembershipData(result.data);
                } else {
                    console.error('Failed to fetch membership:', result.message);
                }
            } catch (error) {
                console.error('Error fetching membership:', error);
            }
        };

        if (session?.user?.hasAuth) {
            fetchMembership();
        }

    }, [session?.user?.hasAuth]);

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
            <ModalTable head="Credits" 
                        data={[
                            ["your balance", `${credits} credits`],
                        ]}
            />
            <ModalTable head="Subsription Information" 
                        data={[
                            ["your plan", userMembershipData ? tierText[userMembershipData["tier"]] : '-'],
                            ["member since", userMembershipData ? formatDateToDottedText(userMembershipData["started_at"]) : '-'],
                            ["billing date", userMembershipData ? `${getBillingDate(userMembershipData["started_at"])}/mo.` : '-']
                        ]}
            />
            <ModalCard title="Upgrade Plan" desc="you can change membership plan" 
                       type="action" action="Upgrade" onClick={()=>{setPath('subscription/upgradePlan')}}/>
            <ModalCard title="Payment History" desc="You are currently registered for 3 platforms." 
                       type="action" action="view" onClick={()=>{setPath('subscription/paymentHistory')}}/>
        </>
    )
}
export default ModalPageSubscription