'use client'; 

import { useState, useEffect } from 'react';
import { usePathname} from "next/navigation";
import { IconMenu2, IconX } from "@tabler/icons-react"
import useAuthStore from '@/stores/authStore';
import useUiStore from '@/stores/uiStore';

import Top from "@/components/ui/Top"
import TopMobile from "@/components/ui/TopMobile"
import Sidebar from "@/components/ui/Sidebar"
import Logo from "@/components/Logo"
import Navigation from "@/components/ui/Navigation"
import SideUtil from "@/components/ui/SideUtil"
import SideUtilNav from "@/components/ui/SideUtilNav";
import SideUserBox from "@/components/ui/SideUserBox";
import SideUserBoxSkeleton from "@/components/skeleton/SideUserBoxSkeleton";
import SideJoinBox from "@/components/ui/SideJoinBox";
import PageWrapper from "@/components/ui/PageWrapper";
import Search from "@/components/search/Search";
import Player from "@/components/player/Player";
import PlayerKeyPressEvent from "@/components/command/playerKeyPressEvent";

import Dev from "@/components/Dev";

const MainLayout = ({ children }) => {
    const { userInfo, isLoading } = useAuthStore();
    const { 
        setColorMode, 
        sidebarVisible,
        setSidebarVisible
    } = useUiStore();
    
    const pathname = usePathname();
    const isDocPage = ['/terms','/privacy'].includes(pathname);
    
    useEffect(() => {
        const storedMode = localStorage.getItem('colorMode');
        if (storedMode) {
            setColorMode(storedMode);
        }
    }, []);
    // 모바일화면(lg미만)에서 Sidebar가 보이냐 안보이냐 설정함.
    // App Router사용시 페이지 전환간 State가 유지되기에 
    // 페이지 전환시 Visible을 false해제해주는 기능을 
    // 각 item에 달아놓음.
    // TODO: 하이드레이션 오류가 나서 이거 그냥 zustand로 바꿔야

    return (
        <div className="relative w-screen min-h-screen 
                        mx-auto bg-zinc-900 flex flex-col lg:flex-row flex-wrap box-border
        ">

            <Sidebar visibility={sidebarVisible}>
                <Logo logoType="image" onClick={()=>setSidebarVisible(false)}/>
                <IconX size="28" onClick={()=>setSidebarVisible(!sidebarVisible)} className="absolute top-7 right-6 lg:hidden"/>
                <Navigation onItemClick={()=>setSidebarVisible(false)}/>
                
                <Dev/>
                
                <SideUtil>
                    <SideUtilNav />
                    {userInfo != null ? (
                        <>
                            <SideUserBox />
                        </>
                    ) : (
                        <SideJoinBox />
                    )}
                </SideUtil>
            </Sidebar>
            <div className="flex-1">
                {/* Top */}
                <Top className={`${isDocPage ? "justify-between lg:p-0 lg:m-0" : "justify-between"}`}>
                    {!isDocPage && <Search />}
                </Top>
                {/* Top only Mobile */}
                <TopMobile className="lg:hidden">
                    asd
                </TopMobile>

                <PageWrapper className={isDocPage ? "lg:mt-0" : undefined}>
                    {children}
                </PageWrapper>
            </div>
            <Player />
            <PlayerKeyPressEvent />
        </div>
    );

}
export default MainLayout;