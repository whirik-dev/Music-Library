import { IconVolume, IconVolumeOff } from "@tabler/icons-react"
import useMusicItemStore from "@/stores/useMusicItemStore";
import { useRef, useCallback } from "react";

// Volume constants to match store configuration
const VOLUME_DIVISOR = 4;
const DEFAULT_VOLUME = 0.8; // Match store's DEFAULT_VOLUME
const MAX_UI_VOLUME = 1.0;
const MAX_STORE_VOLUME = MAX_UI_VOLUME / VOLUME_DIVISOR; // 0.25

const VolumeBar = () => {
    const { volume, setVolume } = useMusicItemStore();
    const barRef = useRef(null);
    const isDraggingRef = useRef(false);

    // Convert store volume (0-0.25) to UI percentage (0-100%)
    const volPercent = Math.min(100, Math.max(0, (volume / MAX_STORE_VOLUME) * 100));
    const barHeight = `${volPercent}%`;

    const updateVolume = useCallback((e) => {
        if (!barRef.current) return;

        const rect = barRef.current.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const ratio = Math.max(0, Math.min(1, 1 - y / rect.height));

        // Convert UI ratio (0-1) to store volume using consistent calculation
        const newVol = ratio * MAX_UI_VOLUME;
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
            <div onClick={() => setVolume(volume === 0 ? DEFAULT_VOLUME : 0)}>
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