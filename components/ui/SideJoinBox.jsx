"use client"

import useAuthStore from "@/stores/authStore";
import useMusicItemStore from "@/stores/useMusicItemStore";

import {IconUserSquareRounded} from "@tabler/icons-react"

const SideJoinBox = () => {
    const { toggleAuthModal } = useAuthStore();
    const { playingTrackId } = useMusicItemStore();
    return (
        <div className={`bg-zinc-700/50 p-3 rounded-sm mb-1 flex flex-row gap-3 select-none cursor-pointer hover:opacity-70 ${playingTrackId && "last:mb-16"}`}
             onClick={()=>toggleAuthModal()}
        >
            <IconUserSquareRounded />
            Sign In
        </div>
    );
}
export default SideJoinBox;