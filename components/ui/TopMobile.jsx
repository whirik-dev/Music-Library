"use client"
import { IconMenu2, IconX } from "@tabler/icons-react"
import useUiStore from "@/stores/uiStore";
import Logo from "@/components/Logo";

const TopMobile = ({ children, className }) => {

    const { 
        setColorMode, 
        sidebarVisible,
        setSidebarVisible,
    } = useUiStore();

    return (
        <div className={`z-30 lg:hidden w-full sticky top-0 left-0 flex justify-between pt-7.5 pb-3 px-6 bg-zinc-900 cursor-pointer hover:opacity-80 ${className}`}>
            <Logo logoType="image" className="lg:hidden" />
            <IconMenu2
                size="28"
                onClick={() => setSidebarVisible(!sidebarVisible)}
                className="lg:hidden"
            />
        </div>
    )
}
export default TopMobile;