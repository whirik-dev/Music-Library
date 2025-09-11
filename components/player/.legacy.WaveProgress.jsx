import React, { useRef, useState } from 'react';
import Image from "next/image"
import { useTranslations } from 'next-intl';
import useMusicItemStore from "@/stores/useMusicItemStore";


function getTimeBySecond(second) {
    // Extract minutes
    const durationMinutes = Math.floor(second / 60);
    
    // Extract seconds
    const remainingSeconds = second % 60;
    const durationSeconds = Math.floor(remainingSeconds);
    
    // Extract milliseconds (2 decimal places)
    const milliseconds = Math.round((remainingSeconds - durationSeconds) * 100);
    
    // Format the output as MM:SS:MS
    return `${durationMinutes.toString().padStart(2, '0')}:${durationSeconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
}


const WaveProgress = ({ id, metadata, albumart, file }) => {
    const t = useTranslations('errors');
    const {
        status,
        play,
        resume,
        playingTrackId,
        playingWaveImage,
        currentTime,
        duration,
        seek,
    } = useMusicItemStore();

    const [axis, setAxis] = useState(-1);
    const [sizeOfBox, setSizeOfBox ] = useState(null)
    const boxRef = useRef(null);

    const handleMouseMove = (e) => {
        const rect = boxRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        setAxis(x);
        // setSizeOfBox(rect);
        setSizeOfBox(rect.width)
    };

    const handleMouseLeave = () => {
        setAxis(-1);
    };

    const handleClick = async (e) => {
        if (!duration || !boxRef.current) return;

        const rect = boxRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const ratio = x / rect.width;
        const targetTimeSelf = ratio * duration;
        // const targetTimeRoaming = metadata.find(item => item.type === "duration").content / metadata.find(item => item.type === "sampleRate").content * ratio

        if (playingTrackId !== id || playingTrackId === null) {
            // 다른 트랙에서 이동
            try {
                await play(id, metadata, albumart, file.find(item => item.type === "preview")?.path);
                seek(metadata.find(item => item.type === "duration").content / metadata.find(item => item.type === "sampleRate").content * ratio);
            } catch (error) {
                console.error(t('track_play_failed'), error);
            }
        } else {
            if(status === "paused")
            {   
                try {
                    await resume();
                    seek(targetTimeSelf);
                } catch (e) {
                    console.error(t('track_play_failed'), error);
                }
            }
            else
            {
                // 현재 트랙 내에서 이동
                seek(targetTimeSelf);
            }
        }
    };

    return (
        <div className="relative w-full h-full cursor-none backdrop-blur-md">
            {/* 웨이브 이미지 */}
            <div className="relative flex items-center w-full h-full overflow-hidden">
                {/* 이거 중요함 웨이브가 볼륨이 0인 부분에서 선 표시하는거임 */}
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10" />
                {/* TODO: 나중에 Next image로 바꾸는 거 고려 */}
                <img className="w-full h-full opacity-100 brightness-20 object-fill" 
                     src={file ? file.find(item => item.type === "origin").path.replace(/\.(wav|mp3)$/, ".png") 
                               : playingWaveImage }
                     width="800"
                     height="50"
                     alt="wave graph"
                />
                {status !== null && playingTrackId === id && (
                    <div className="absolute top-0 -left-full w-full h-full overflow-hidden backdrop-brightness-300"
                         style={{ left: `${(100 - (currentTime / duration) * 100)*-1}%`}}
                    />
                )}
            </div>

            {/* 마우스 추적 및 클릭 영역 */}
            <div
                className="absolute top-0 left-0 w-full h-full"
                ref={boxRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
            >
                {axis >= 0 && (
                    <div
                        className="absolute top-0 w-[1px] h-full bg-red-400/70 pointer-events-none backdrop-invert-100"
                        style={{ left: `${axis}px` }}
                    >
                        <div className="absolute font-mono top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-black/50 border-1 border-black/50 text-xs font-normal px-0.5 py-0 select-none rounded-xs">
                            {file ? getTimeBySecond((metadata.find(item => item.type === "duration").content / metadata.find(item => item.type === "sampleRate").content) * (axis/sizeOfBox)) 
                                  : getTimeBySecond(duration * axis / sizeOfBox ) }
                        </div>
                    </div>
                )}
            </div>

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