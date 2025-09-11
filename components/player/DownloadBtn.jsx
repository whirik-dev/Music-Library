"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { IconDownload, IconLoader2 } from "@tabler/icons-react";
import { ToastContainer, toast } from 'react-toastify';
import { useTranslations } from 'next-intl';
import useAuthStore from "@/stores/authStore";

const DownloadBtn = ({ asset_id }) => {
    const [downloaded, setDownloaded] = useState(false);
    const [isPrepare, setIsPrepare] = useState(false); 
    const [count, setCount] = useState(1);
    const { data: session, status } = useSession();
    const t = useTranslations('player');
    const {
        downloadPoints,
        setDownloadPoints,
        membership,
        toggleAuthModal,
        isLogged,
        downloadHistory,
        addDownloadHistory,
        isDownloading,
        toggleIsDownloading
    } = useAuthStore();
    
    useEffect(()=>{
        downloadHistory.includes(asset_id) && setDownloaded(true);
    })

    const handleDownload = async (asset_id) => {
        if (!isLogged) 
        {
            toggleAuthModal();
            return;
        }

        if (isDownloading)
        {
            toast.error(t('now_downloading'))
            return;
        }
    
        setIsPrepare(true);
        toggleIsDownloading(true);
        // 10초 기다리는 함수 따로 빼기
        const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        for(let i=0; i<3; i++)
        {
            await wait(1000);
        }
        setIsPrepare(false);
        toggleIsDownloading(false);
    
        try {
            const downloadPermission = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/download/${asset_id}`, {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${session.user.ssid}`
                },
            });
    
            const result = await downloadPermission.json();
    
            if (result.error) {
                if (downloadPoints === 0) {
                    toast.warn(t('no_download_points'));
                    return;
                }
            }
    
            if (result.data.pointDownShift) {
                setDownloadPoints(downloadPoints - 1);
                addDownloadHistory(asset_id);
                toast.success(t('download_started_points_used'));
            } else {
                toast.success(t('download_started'));
            }
    
            setDownloaded(true);
    
            const fileUrl = `https://asset.probgm.com/${result.data.id}`;
    
            const response = await fetch(fileUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${session.user.ssid}`
                }
            });
    
            if (!response.ok) {
                toast.error(t('download_failed'));
                return;
            }
    
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
    
            const anchor = document.createElement('a');
            anchor.href = blobUrl;
            anchor.download = `${asset_id}.mp3`;
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
    
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error(error);
            toast.error(t('download_error'));
        }
    };

    return (
        <div className={`relative cursor-pointer hover:opacity-50 ${downloaded && 'opacity-30'}`} onClick={() => handleDownload(asset_id)} >

            {isPrepare ? (
                <div className="relative">
                    {/* <div className="absolute w-full h-full flex items-center justify-center text-xs">
                        {count}
                    </div> */}
                    <IconLoader2 size="18" className="animate-spin" />
                </div>
            ) : (
                <IconDownload size="18" />
            )}

            {/* {downloaded && (
                <div className="absolute -bottom-1 -right-1 bg-green-400 rounded-full size-2 flex items-center justify-center shadow-sm shadow-green-400" />
            )} */}
        </div>
    )
};

export default DownloadBtn;
