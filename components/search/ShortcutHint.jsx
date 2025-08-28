import { useEffect, useState } from "react";
import { IconCommand } from "@tabler/icons-react";

const ShortcutHint = () => {
    const [isMac, setIsMac] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const platform = navigator.platform.toUpperCase();
            setIsMac(platform.includes("MAC"));
        }
    }, []);

    const keyStyle = "border-1 border-zinc-500 rounded-sm p-1 size-6 text-sm flex items-center items justify-center text-[#777]";
    
    return (
        <div className="flex flex-row items-center gap-1 text-[#777]">
            {isMac ? (
                <>
                    <div className="border-1 border-zinc-500 rounded-sm p-0.5 size-6 flex items-center items justify-center">
                        <IconCommand size={16} />
                    </div>
                    <span>+</span>
                    <div className={keyStyle}>K</div>
                </>
            ) : (
                <>
                    <div className={keyStyle}>ctl</div>
                    <span>+</span>
                    <div className={keyStyle}>K</div>
                </>
            )}
        </div>
    );
};

export default ShortcutHint;
