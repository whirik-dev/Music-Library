import React, { useRef, useState } from 'react';
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

const WaveProgressLayer = ({ id, metadata }) => {
    const {
        status,
        play,
        resume,
        playingTrackId,
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
                await play(id, metadata, `https://asset.probgm.com/${id}?r=preview`);
                seek(metadata.find(item => item.type === "duration").content * ratio);
            } catch (error) {
                console.error("트랙 재생 실패:", error);
            }
        } else {
            if(status === "paused")
            {   
                try {
                    await resume();
                    seek(targetTimeSelf);
                } catch (e) {
                    console.error("트랙 재생 실패:", error);
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
                    <div className="absolute font-mono top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-background/50 border-1 border-background/50 text-xs font-normal px-0.5 py-0 select-none rounded-xs">
                        {getTimeBySecond(metadata.find(item => item.type === "duration").content * (axis/sizeOfBox))}
                    </div>
                </div>
            )}
        </div>
    )
}
export default WaveProgressLayer;