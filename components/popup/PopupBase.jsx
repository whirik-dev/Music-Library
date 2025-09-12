"use client"
import { useState } from "react"; 
import useUiStore from "@/stores/uiStore";
import { IconX } from "@tabler/icons-react"

const PopupBase = ({ children, bg, onClose, className }) => {
    const { colorMode } =useUiStore(); 
    const [ isHide, setIsHide ] = useState(false);

    const popupCloseHandler = () => {
        setIsHide(true);
        onClose && onClose();
    }

    return (
        <>
            {!isHide && (
                <div className={`z-50 fixed top-0 left-0 w-full h-full bg-background/50
                                flex justify-center items-center
                                `}
                >
                    {/* Close Area */}
                    <div className="absolute top-0 left-0 w-full h-full" onClick={popupCloseHandler}/>

                    {/* Popup Content Area */}
                    <div className={`relative w-full md:w-2xl h-full md:h-[380px] rounded-lg 
                                     flex flex-col justify-between
                                    ${colorMode === "dark" ? "bg-neutral-800"  : "bg-background border-1 border-neutral-200"}
                                    ${className}
                                    `}
                    >
                        {/* Close Button */}
                        <div className="absolute top-1 right-1 p-2">
                            <IconX className={`cursor-pointer hover:opacity-80 text-neutral-500`} onClick={popupCloseHandler}/>
                        </div>

                        {/* Content Body */}
                        <div className="p-4 flex flex-col h-full justify-between">
                            {children}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PopupBase;