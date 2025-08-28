"use client";

import Link from "next/link";
import { useRouter, usePathname } from 'next/navigation';
import { IconX, IconChevronLeft} from "@tabler/icons-react"
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
 * 모달 내비게이션 요소 컴포넌트
 *
 * @component
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.name - 내비게이션 항목 이름 (표시될 텍스트)
 * @param {string} props.href - 이동할 링크 경로
 * @param {boolean} props.active - 현재 활성화된 항목 여부
 * @returns {JSX.Element} 렌더링된 내비게이션 요소
 */
const ModalNavElem = ({ name, href, active }) => {
    return (
        <Link href={href} replace className={`transition-all duration-300 ${active && "mr-0"}`}>
            <div className={`cursor-pointer font-bold capitalize transition-all duration-300 ${active ? "text-white" : "text-white/30"}`}>
                {name}
            </div>
        </Link>
    );
};

/**
 * 모달 컴포넌트
 *
 * @component
 * @param {Object} props - 컴포넌트 props
 * @param {React.ReactNode} props.children - 모달 안에 렌더링할 콘텐츠
 * @param {boolean} [props.hideNav=false] - true일 경우 내비게이션을 숨김 (설정모달 말고 다른 모달일떄 활성화하면 좋음)
 * @returns {JSX.Element} 렌더링된 모달 컴포넌트
 */
const ModalUi = ({ children, hideNav=false }) => {
    const { modal, toggleModal, expand, toggleExpand, previousPath } = modalStore();
    const router = useRouter();
    const pathname = usePathname();

    const closeModal = () => {
        toggleModal();
        router.back();
    }

    return (
        <div className={`z-50 ${modal ? "flex" : "hidden"} fixed top-0 left-0 w-full h-full items-center justify-center`}>
            {/* 전역 백그라운드 */}
            <div className="absolute top-0 left-0 w-full h-full bg-zinc/30 backdrop-blur-xs" 
                 onClick={()=>closeModal()}>   
            </div>
            {/* 모달창 */}
            <motion.div className={`z-51 w-full h-full lg:min-h-[720px] lg:max-h-[720px] 
                            ring-1 ring-zinc-800 shadow-xl bg-zinc-900/100 rounded-md backdrop-blur-md
                            overflow-y-scroll scroll-smooth
                            `}
                        initial={false}
                        animate={{
                            width: expand ? "980px" : "420px",
                        }}
                        transition={{
                            type: "spring",
                            bounce: 0.5,
                        }}
            >
                {/* 모달 네비게이션 */}
                <div className="px-3 py-0 flex flex-row justify-between items-center text-sm">

                    {/** NOTE: 뒤로가기 버튼은 하위메뉴에서만 보여야함 */}
                    <Link href={pathname.includes('preference') ? "/(.)preference" : 
                                pathname.includes('subsription') ? "/(.)subscription" : 
                                pathname.includes('works') ? "/(.)works" : ""}
                    >
                        <div className={`${pathname === "/(.)preference" |
                                           pathname === "/(.)subscription" |
                                           pathname === "/(.)works" && "opacity-0"
                        } text-white/50 hover:text-white transition-colors duration-300 cursor-pointer`} >
                            <IconChevronLeft />
                        </div>
                    </Link>

                    {/** NOTE: UI 테스트용임 배포단계에서 지우기 */}
                    {/* <div className="text-white/50 hover:text-white transition-colors duration-300 cursor-pointer "
                        onClick={()=>toggleExpand()}
                    >
                        [test btn]
                    </div> */}

                    {/* 모달 메뉴 네비게이션 */}
                    {!hideNav && (
                    <div className="mx-3 mt-3 mb-3 px-5 py-2 bg-zinc-800 rounded-full flex flex-row gap-3 selec-none">
                        {ModalNav.map(({ name, href, href_absolute }) => (
                            <ModalNavElem key={name} name={name} href={href} active={pathname.includes(href_absolute)} />
                        ))}
                    </div>
                    )}

                    {/* NOTE: 모달창 닫기버튼 (시안에는 없었음) */}
                    <div className="text-white/50 hover:text-white transition-colors duration-300 cursor-pointer"
                         onClick={()=>closeModal()}
                    >
                        <IconX />
                    </div>
                </div>
                {children}
            </motion.div>
        </div>
    );
}
export default ModalUi;