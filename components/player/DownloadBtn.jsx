"use client";

import { useState, useEffect } from "react";
import { useJWTAuth } from "@/hooks/useJWTAuth";
import { IconDownload, IconLoader2 } from "@tabler/icons-react";
import { ToastContainer, toast } from 'react-toastify';
import useAuthStore from "@/stores/authStore";

const DownloadBtn = ({ asset_id }) => {
    const [downloaded, setDownloaded] = useState(false);
    const [isPrepare, setIsPrepare] = useState(false); 
    const [count, setCount] = useState(1);
    const { data: session, status } = useJWTAuth();
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
        // 3초 준비 시간
        const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        for(let i=0; i<3; i++)
        {
            await wait(1000);
        }
        setIsPrepare(false);
        toggleIsDownloading(false);
    
        try {
            // 서버 API를 통해 다운로드 권한 확인
            const downloadPermission = await fetch('/api/user/download', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ asset_id })
            });
    
            const result = await downloadPermission.json();
    
            if (!result.success) {
                if (result.error && downloadPoints === 0) {
                    toast.warn("No download points available.");
                    return;
                }
                toast.error(result.message || "Download permission denied.");
                return;
            }
    
            if (result.data.pointDownShift) {
                setDownloadPoints(downloadPoints - 1);
                addDownloadHistory(asset_id);
                toast.success('Your download is on the way! Points have been used.');
            } else {
                toast.success('Your download is on the way!');
            }
    
            setDownloaded(true);
    
            // 서버 API를 통해 파일 다운로드
            const response = await fetch(`/api/user/download?fileId=${result.data.id}`, {
                method: 'GET',
                credentials: 'include'
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
