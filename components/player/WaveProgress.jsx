"use client";

import React, { useRef, useState, useEffect } from 'react';
import Image from "next/image"
import useMusicItemStore from "@/stores/useMusicItemStore";
import useUiStore from "@/stores/uiStore";

import WPL from "@/components/player/WaveProgressLayer";

const WaveProgress = ({ id, metadata }) => {
    const {
        status,
        playingTrackId,
        playingWaveImage,
        currentTime,
        duration,
    } = useMusicItemStore();
    const { colorMode } = useUiStore();

    const [sizeOfBox, setSizeOfBox] = useState(null);
    const [waveImageError, setWaveImageError] = useState(false);
    const boxRef = useRef(null);

    function boxObserver() {
        if (!boxRef.current) return;
        const rect = boxRef.current.getBoundingClientRect();
        setSizeOfBox(rect.width);
    }

    useEffect(() => {
        boxObserver();

        // 디바운스 함수 정의
        let timeoutId;
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                boxObserver();
            }, 200); // 200ms 디바운스
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timeoutId);
        };
    }, []);

    // 트랙이 바뀔 때마다 웨이브 이미지 에러 상태 리셋
    useEffect(() => {
        setWaveImageError(false);
    }, [id]);


    return (
        <div className="relative w-full h-full cursor-none backdrop-blur-md">
            {/* 웨이브 이미지 */}
            <div className="relative flex items-center w-full h-full overflow-hidden">
                <div className={`absolute w-full h-full ${colorMode === "light" ? "brightness-10 opacity-20" : "opacity-10 brightness-75`"}`}>
                    {/* 이거 중요함 웨이브가 볼륨이 0인 부분에서 선 표시하는거임 */}
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white" />
                    {/* TODO: 나중에 Next image로 바꾸는 거 고려 */}
                    {id != null && !waveImageError && (
                        <img className="w-full h-full object-fill" 
                            src={`https://asset.probgm.com/${id}?r=waveimage`}
                            width="800"
                            height="50"
                            alt="wave graph"
                            ref={boxRef}
                            onError={() => {
                                console.warn(`Wave image not found for ID: ${id}`);
                                setWaveImageError(true);
                            }}
                        />
                    )}
                </div>
                {status !== null && playingTrackId === id && (
                    // <div className="absolute top-0 -left-full w-full h-full overflow-hidden backdrop-brightness-300"
                    //      style={{ left: `${(100 - (currentTime / duration) * 100)*-1}%`}}
                    // />
                    <div className="absolute top-0 left-0 h-full overflow-x-hidden"
                         style={{ width:`${(currentTime / duration) * 100}%` }}
                    >
                        <div className="absolute top-0 left-0 w-full h-full"
                             style={{ width:`${sizeOfBox}px` }}
                        >
                            {!waveImageError && (
                                <img className={`w-full h-full absolute top-0 opacity-50 ${colorMode === "light" ? "brightness-50" : "brightness-75"}`}
                                    src={`https://asset.probgm.com/${id}?r=waveimage`}
                                    style={{left:"0%"}}
                                    width="800"
                                    height="50"
                                    alt="wave graph"
                                    onError={() => {
                                        console.warn(`Wave progress image not found for ID: ${id}`);
                                        setWaveImageError(true);
                                    }}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* 마우스 추적 및 클릭 영역 */}
            <WPL id={id} metadata={metadata} />

            {/* 퍼센트 표시
              * TODO: Debug only
              */}
            {/* {axis >= 0 && (
                <div className="z-20 absolute -top-7 left-0 font-monospace text-xs px-0.5 rounded-xs bg-fuchsia-400 text-black border-l-6 border-fuchsia-600"> 
                    mouseEvent debug: {axis}
                </div>
            )} */}

            {/* {status !== null && playingTrackId === id && (
                <div className="z-20 absolute -top-7 right-0 font-monospace text-xs px-0.5 rounded-xs bg-teal-400 text-black border-l-6 border-teal-600"> 
                    currentTime debug: {(currentTime / duration * 100).toFixed(2)}%
                </div>
            )} */}
        </div>
    );
};

export default WaveProgress;