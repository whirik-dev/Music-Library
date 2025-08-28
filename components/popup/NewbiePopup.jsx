"use client"
import { useEffect } from "react";
import { useJWTAuth } from "@/hooks/useJWTAuth";
import useAuthStore from "@/stores/authStore";
import useConfetti from "@/hooks/useConfetti";
import PopupBase from "./PopupBase";
import Button from "@/components/ui/Button2";

const NewbiePopup = () => {
    const { data: session } = useJWTAuth();
    const {
        isNewbie,
        setIsNewbie
    } = useAuthStore();
    const { fireConfetti } = useConfetti();


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

            const response = await fetch('/api/auth/newbie-confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Newbie confirm success:', data);
                setIsNewbie(false);
            } else {
                console.error('Newbie confirm failed:', response.status);
            }
        } catch (error) {
            console.error('Error confirming newbie:', error);
        }
    }

    return (
        <>
            {isNewbie && (
                <PopupBase onClose={confirmDiscover}>
                    <div className="w-full h-full flex flex-col items-center justify-center">
                        <h2 className="text-3xl">Welcome to WhiRik Reference</h2>
                        <p className="mt-5 text-xl font-extralight">
                            모달임
                        </p>
                    </div>
                    <Button name="discover" bg="bg-neutral-500" onClick={confirmDiscover} />
                </PopupBase>
            )}
        </>
    );
};

export default NewbiePopup;