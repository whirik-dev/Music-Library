"use client";

import Link from "next/link";
import { useRouter, usePathname } from 'next/navigation';
import { motion } from "motion/react"

import modalStore from "@/stores/modalStore";

const ModalNav = [
    {
        name : "preference",
        href : "/(.)preference",
        href_absolute : "/(.)preference"
    },
    {
        name : "subscription",
        href : "/(.)subscription",
        href_absolute : "/(.)subscription"
    },
    {
        name : "works",
        href : "/(.)works",
        href_absolute : "/(.)works"
    },
]

/**
 * 모달 컴포넌트
 *
 * @component
 * @param {Object} props - 컴포넌트 props
 * @param {React.ReactNode} props.children - 모달 안에 렌더링할 콘텐츠
 * @param {boolean} [props.hideNav=false] - true일 경우 내비게이션을 숨김 (설정모달 말고 다른 모달일떄 활성화하면 좋음)
 * @returns {JSX.Element} 렌더링된 모달 컴포넌트
 */
const ModalUi = ({ children }) => {
    const { modal, toggleModal, expand, toggleExpand, init } = modalStore();
    const router = useRouter();
    const pathname = usePathname();

    const closeModalHander = () => {
        toggleModal();
        init()
    }

    return (
        <div className={`z-50 ${modal ? "flex" : "hidden"} fixed top-0 left-0 w-full h-full items-center justify-center`}>
            {/* 전역 백그라운드 */}
            <div className="absolute top-0 left-0 w-full h-full" 
                 onClick={()=>closeModalHander()}>   
            </div>
            {/* 모달창 */}
            <motion.div 
            className={`z-51 h-full lg:min-h-[720px] lg:max-h-[720px] 
                        absolute top-0 left-0 lg:relative
                        ring-1 ring-zinc-800 shadow-xl bg-zinc-900/80 rounded-md backdrop-blur-md
                        overflow-y-scroll scroll-smooth`}
            initial={false}
            animate={{
                width: expand ? 
                (window.innerWidth >= 1024 ? "980px" : "100vw") : 
                (window.innerWidth >= 1024 ? "420px" : "100vw")
            }}
            transition={{
                type: "spring",
                bounce: 0.45,
            }}
            >
                {children}
            </motion.div>
        </div>
    );
}
export default ModalUi;