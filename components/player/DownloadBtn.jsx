"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { IconDownload, IconLoader2 } from "@tabler/icons-react";
import { ToastContainer, toast } from 'react-toastify';
import useAuthStore from "@/stores/authStore";

const DownloadBtn = ({ asset_id }) => {
    const [downloaded, setDownloaded] = useState(false);
    const [isPrepare, setIsPrepare] = useState(false); 
    const [count, setCount] = useState(1);
    const { data: session, status } = useSession();
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
            toast.error('now dowinloading...')
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
            const downloadPermission = await fetch(`https://w46-g5e.whirik.com/download/${asset_id}`, {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${session.user.ssid}`
                },
            });
    
            const result = await downloadPermission.json();
    
            if (result.error) {
                if (downloadPoints === 0) {
                    toast.warn("No download points available.");
                    return;
                }
            }
    
            if (result.data.pointDownShift) {
                setDownloadPoints(downloadPoints - 1);
                addDownloadHistory(asset_id);
                toast.success('Your download is on the way! Points have been used.');
            } else {
                toast.success('Your download is on the way!');
            }
    
            setDownloaded(true);
    
            const fileUrl = `https://mimiu-test.changhyun-me.workers.dev/${result.data.id}`;
    
            const response = await fetch(fileUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${session.user.ssid}`
                }
            });
    
            if (!response.ok) {
                toast.error("Download failed.");
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
            toast.error("Unexpected error during download.");
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
