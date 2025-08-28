"use client"

import { useRouter, usePathname } from 'next/navigation';
import { IconSettings } from "@tabler/icons-react"

import useModalStore from "@/stores/modalStore";
import useAuthStore from '@/stores/authStore';

import ProgressBar from "@/components/ui/ProgressBar"
import useMusicItemStore from "@/stores/useMusicItemStore";

import SignOutBtn from "@/components/auth/SignOutButton";


const SideUserBox = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { playingTrackId } = useMusicItemStore();
    const { toggleModal, setPath, setDepth } = useModalStore();
    const { userInfo, membership, credits, downloadPoints } = useAuthStore();

    // TODO: 유저정보를 prop으로 받아야함. 아래는 테스트용으로 해놓은거
    const testPlan = "basic";
    const downloadBalance = 0;

    const handlePreferenceClick = () => {
        setPath('preference');
        setDepth(1);
        toggleModal();
    };

    const handleCreditClick = () => {
        setPath('subscription');
        setDepth(1);
        toggleModal();
    };

    return (
        <div className={`bg-foreground/5 p-3 rounded-sm select-none transition-normal duration-300 ${playingTrackId && "last:mb-16"}`}>
            <div className="font-bold text-md text-nowrap overflow-x-hidden text-foreground">
                {userInfo.name}<br/>
                {/* <span className="text-sm font-medium opacity-50">{userInfo.email}</span> */}
            </div>
            <div className="font-normal text-foreground text-sm"
            >
                <span className="uppercase bg-foreground/10 py-0.5 px-1 rounded-md text-xs font-black cursor-pointer hover:opacity-80"
                      onClick={handleCreditClick}
                >
                    {membership}
                </span>
                 
                <span className="text-xs ml-2 cursor-pointer hover:opacity-80"
                      onClick={handleCreditClick}
                >
                    {credits} Credits
                </span>
            </div>
            <div className="mt-9">
                <div className="flex flex-row mb-1 text-sm justify-between">
                    <div className="text-foreground">Download</div>
                    <div className="capitalize font-bold">
                        {membership != 'free' ? "unlimited" : `${downloadPoints < 0 ? "0" : downloadPoints}/10`}
                    </div>
                </div>
                <ProgressBar now={downloadPoints} max={downloadPoints>10 ? downloadPoints : "10"} plan={membership}/>
            </div>
            {/* <Link href="/(.)preference"> */}
            <div className="flex flex-row items-center justify-between mt-2">
                <div className="flex flex-row items-center gap-1 cursor-pointer hover:opacity-50" 
                     onClick={handlePreferenceClick}
                >
                    <IconSettings size="18"/>
                    Preference
                </div>
                <SignOutBtn />
            </div>
            {/* </Link> */}
        </div>
    )
}
export default SideUserBox;