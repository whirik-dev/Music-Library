import { IconX, IconChevronLeft} from "@tabler/icons-react";
import { useTranslations } from 'next-intl';

import ModalNavElem from "@/components/modal/ModalNavElem";
import modalStore from "@/stores/modalStore";

const ModalNavList = [
    {
        name : "preference",
        href : "preference",
    },
    {
        name : "subscription",
        href : "subscription",
    },
    {
        name : "tailored",
        href : "tailored",
    },
]

const ModalNav = ({}) => {
    const t = useTranslations('modal');
    const hideNav = false;
    const { depth, toggleModal, init, path, setPath } = modalStore();

    function closeModalHandler()
    {
        toggleModal();
        init();
    }

    function backwardHandler()
    {
        setPath(path.split('/')[0]);
    }

    return (
        <div className="px-3 py-0 flex flex-row justify-between items-center text-sm">

            {/** NOTE: 뒤로가기 버튼은 하위메뉴에서만 보여야함 */}
            <div className="w-5" onClick={()=>backwardHandler()}>
                <div className={`text-foreground/50 hover:text-foreground transition-colors duration-300 cursor-pointer`} >
                    {depth > 1 && (
                        <IconChevronLeft />
                    )}
                </div>
            </div>

            {/* 모달 메뉴 네비게이션 */}
            {!hideNav && (
            <div className="mx-3 mt-3 mb-3 px-5 py-2 bg-zinc-800 rounded-full flex flex-row gap-3 selec-none">
                {ModalNavList.map(({ name, href }) => (
                    <ModalNavElem key={name} name={t(name)} href={href}/>
                ))}
            </div>
            )}

            {/* NOTE: 모달창 닫기버튼 (시안에는 없었음) */}
            <div className="w-5 text-foreground/50 hover:text-foreground transition-colors duration-300 cursor-pointer"
                    onClick={()=>closeModalHandler()}
            >
                <IconX />
            </div>
        </div>
    )
}
export default ModalNav;