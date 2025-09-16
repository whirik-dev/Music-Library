import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { IconX } from '@tabler/icons-react';
import useToggle from "@/utils/useToggle";
import modalStore from "@/stores/modalStore";
import useUiStore from "@/stores/uiStore";
import useAuthStore from "@/stores/authStore";

import ModalCard from "@/components/modal/ModalCard";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";

const ModalPageReedem = ({ }) => {
    const { data: session } = useSession();
    const router = useRouter();
    const t = useTranslations('modal');
    const [inputRedeem, setInputRedeem] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useToggle(() => {
        setDepth(2);
    });

    const { setDepth, toggleModal, init } = modalStore();
    const { setCurrentPopup } = useUiStore();
    const { setMembership } = useAuthStore();

    const registerHandler = async () => {
        if (!inputRedeem.trim()) {
            setError('리딤 코드를 입력해주세요.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const userSsid = session.user.ssid;
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/redeem`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userSsid}`
                },
                credentials: 'include',
                body: JSON.stringify({
                    code: inputRedeem.trim()
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // 성공시 멤버십 정보 업데이트
                if (data.data && data.data.membershipType) {
                    // membershipType을 숫자 인덱스로 변환
                    const membershipTypes = ['free', 'basic', 'pro', 'master'];
                    const membershipIndex = membershipTypes.indexOf(data.data.membershipType);
                    if (membershipIndex !== -1) {
                        setMembership(membershipIndex);
                    }
                }

                // 모달 닫고 멤버십 팝업 표시 후 홈으로 리디렉션
                toggleModal(false);
                init()

                setCurrentPopup('membership');
                router.push('/');
            } else {
                // 실패시 에러 메시지 표시
                setError(data.message || '리딤 코드 사용에 실패했습니다.');
            }
        } catch (err) {
            console.error('Redeem error:', err);
            setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <ModalCard title={`Redeem`} desc={`Enter your code to redeem`} />
            <InputField
                className="mx-3 rounded-lg my-3"
                placeholder={`Tap here to redeem your coupon`}
                value={inputRedeem}
                onChange={(e) => {
                    setInputRedeem(e.target.value);
                    if (error) setError(''); // 입력시 에러 메시지 제거
                }}
                disabled={isLoading}
            />
            {error && (
                <div className="mx-3 mb-3 p-2  border border-red-400 text-red-400 rounded flex flex-row gap-1 items-center">
                    <IconX />
                    {error}
                </div>
            )}
            <Button
                name={isLoading ? 'Processing...' : 'Register'}
                onClick={registerHandler}
                disabled={isLoading || !inputRedeem.trim()}
                className="text-center!"
            />
        </>
    )
}
export default ModalPageReedem;