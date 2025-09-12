import { IconVolume, IconVolumeOff } from "@tabler/icons-react"
import useMusicItemStore from "@/stores/useMusicItemStore";
import { useRef, useCallback } from "react";

const VolumeBar = () => {
    const { volume, setVolume } = useMusicItemStore();
    const barRef = useRef(null);
    const isDraggingRef = useRef(false);

    // 스토어에서 volume은 실제로는 /4 된 값이므로, 0.2가 최대값
    const volPercent = Math.min(100, Math.max(0, (volume / 0.2) * 100));
    const barHeight = `${volPercent}%`;

    const updateVolume = useCallback((e) => {
        if (!barRef.current) return;

        const rect = barRef.current.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const ratio = Math.max(0, Math.min(1, 1 - y / rect.height));

        // 드래그 비율(0~1)을 볼륨값으로 변환 (스토어에서 /4 하므로 0.8 전달)
        const newVol = ratio * 0.8;
        setVolume(newVol);
    }, [setVolume]);

    const handleMouseMove = useCallback((e) => {
        if (!isDraggingRef.current) return;
        updateVolume(e);
    }, [updateVolume]);

    const handleMouseUp = useCallback(() => {
        isDraggingRef.current = false;
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
    }, [handleMouseMove]);

    const startDragging = useCallback((e) => {
        e.stopPropagation();
        updateVolume(e);
        isDraggingRef.current = true;
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    }, [updateVolume, handleMouseMove, handleMouseUp]);

    return (
        <div className="relative group cursor-pointer">
            {/* 볼륨 아이콘 클릭 시 음소거 토글 */}
            <div onClick={() => setVolume(volume === 0 ? 0.8 : 0)}>
                {volume === 0 ? <IconVolumeOff /> : <IconVolume />}
            </div>

            {/* 볼륨바 - hover 시에만 보여짐 */}
            <div className="absolute -top-2 left-1/2 py-3 px-2 rounded-full -translate-y-full -translate-x-1/2 
                            bg-zinc-800 flex items-center justify-center border-1 border-zinc-700 shadow-md
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div
                    className="relative w-2 h-20 bg-zinc-900 rounded-md cursor-pointer"
                    ref={barRef}
                    onMouseDown={startDragging}
                >
                    {/* 채워지는 바 */}
                    <div
                        className="absolute bottom-0 left-0 w-2 bg-white rounded-full pointer-events-none"
                        style={{ height: barHeight }}
                    >
                        {/* 노브 */}
                        <div
                            className="absolute left-1/2 top-0 size-4 rounded-full bg-zinc-700 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
                        />
                    </div>
                </div>
            </div>

            {/* 디버깅용 */}
            {/* <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-auto font-monospace text-xs px-0.5 rounded-xs bg-teal-400 text-black border-l-6 border-teal-600"> 
                Vol.{Math.round(volume*100)}
            </div> */}
        </div>
    );
};

export default VolumeBar;