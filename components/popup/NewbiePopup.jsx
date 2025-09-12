"use client"
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from 'next-intl';
import useAuthStore from "@/stores/authStore";
import useConfetti from "@/hooks/useConfetti";
import PopupBase from "./PopupBase";
import Button from "@/components/ui/Button2";

const NewbiePopup = () => {
    const { data: session } = useSession();
    const {
        isNewbie,
        setIsNewbie
    } = useAuthStore();
    const { fireConfetti } = useConfetti();
    const t = useTranslations('errors');


    useEffect(() => {
        if (isNewbie) {
            fireConfetti();
        }
    }, [isNewbie]);

    const confirmDiscover = async () => {
        try {
            const headers = {
                'Content-Type': 'application/json',
            };

            // 세션이 있고 토큰이 있으면 Authorization 헤더 추가
            if (session?.user?.ssid) {
                headers['Authorization'] = `Bearer ${session.user.ssid}`;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/newbie/confirm`, {
                method: 'POST',
                headers
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Newbie confirm success:', data);
                setIsNewbie(false);
            } else {
                console.error(t('newbie_confirm_failed'), response.status);
            }
        } catch (error) {
            console.error(t('error_confirming_newbie'), error);
        }
    }

    return (
        <>
            {isNewbie && (
                <PopupBase onClose={confirmDiscover} className="bg-gradient-to-br from-purple-500 to-blue-900">
                    <div className="w-full h-full flex flex-col items-center justify-center ">
                        <h2 className="text-3xl lg:text-4xl font-bold">{t('welcome_title')}</h2>
                        <p className="mt-5 text-xl font-extralight text-center w-3/4">
                            {t('welcome_message')}
                        </p>
                    </div>
                    <Button name={t('discover_button')} bg="bg-foreground/10" onClick={confirmDiscover} />
                </PopupBase>
            )}
        </>
    );
};

export default NewbiePopup;