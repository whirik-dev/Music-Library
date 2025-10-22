"use client";

import { useRouter } from "next/navigation";
import { IconScissors } from "@tabler/icons-react";
import useAuthStore from "@/stores/authStore";

const TailoredBtn = ({ id }) => {
    const router = useRouter();
    const { toggleAuthModal, isLogged } = useAuthStore();

    const handleTailoredClick = (e) => {
        e.stopPropagation(); // 부모 요소의 클릭 이벤트 방지

        // 로그인 확인
        if (!isLogged) {
            toggleAuthModal();
            return;
        }

        // Tailored 신규 요청 페이지로 이동 (음악 ID 포함)
        router.push(`/tailored/new?musicId=${id}`);
    };

    return (
        <div 
            className="cursor-pointer hover:opacity-50 transition-opacity" 
            onClick={handleTailoredClick}
            title="Request tailored music"
        >
            <IconScissors size="18" />
        </div>
    );
};

export default TailoredBtn;