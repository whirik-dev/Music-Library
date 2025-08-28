"use client"

import modalStore from "@/stores/modalStore";
import useTailoredStore from "@/stores/useTailoredStore";

const GlobalBackdrop = ({}) => {
    const { path } = modalStore();
    const { target } = useTailoredStore();

    const isActive = path != '' || target != null;
    return (
        <div className={`${isActive ? "z-31 backdrop-blur-xs" : "-z-1 backdrop-blur-0"} absolute top-0 left-0 w-full h-full bg-zinc/30 transition-filter duration-500`} />
    )
}
export default GlobalBackdrop;