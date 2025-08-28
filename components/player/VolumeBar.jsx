import { IconVolume, IconVolumeOff } from "@tabler/icons-react"
import useMusicItemStore from "@/stores/useMusicItemStore";
import { useRef, useState } from "react";

const VolumeBar = () => {
    const { volume, setVolume } = useMusicItemStore();
    const [isDragging, setIsDragging] = useState(false);
    const barRef = useRef(null);

    const volPercent = volume * 100;
    const barHeight = `${volPercent*4}%`;

    const updateVolume = (e) => {
        if (!barRef.current) return;

        const rect = barRef.current.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const ratio = 1 - y / rect.height;

        const newVol = Math.max(0, Math.min(1, ratio));
        setVolume(newVol);
    };

    const handleVolumeClick = (e) => {
        e.stopPropagation(); // 아이콘 클릭 방지
        updateVolume(e); // 클릭 시 볼륨 즉시 업데이트
        setIsDragging(true); // 드래그 시작
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !barRef.current) return;
        updateVolume(e); // 드래그 중 볼륨 실시간 업데이트
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
    };

    return (
        <div className="relative group cursor-pointer">
            {/* 볼륨 아이콘 클릭 시 음소거 토글 */}
            <div onClick={() => setVolume(volume === 0 ? 1 : 0)}>
                {volume === 0 ? <IconVolumeOff /> : <IconVolume />}
            </div>

            {/* 볼륨바 - hover 시에만 보여짐 */}
            <div className="absolute -top-2 left-1/2 py-3 px-2 rounded-full -translate-y-full -translate-x-1/2 
                            bg-zinc-800 flex items-center justify-center border-1 border-zinc-700 shadow-md
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div
                    className="relative w-2 h-20 bg-zinc-900 rounded-md"
                    ref={barRef}
                    onClick={handleVolumeClick}
                >
                    {/* 채워지는 바 */}
                    <div
                        className="absolute bottom-0 left-0 w-2 bg-white rounded-full"
                        style={{ height: barHeight }}
                    >
                        {/* 노브 */}
                        <div
                            className="absolute left-1/2 top-0 size-4 rounded-full bg-zinc-700 -translate-x-1/2 -translate-y-1/2"
                            onMouseDown={(e) => {
                                e.stopPropagation(); // 클릭 전파 방지
                                updateVolume(e); // 노브 클릭 시 즉시 볼륨 업데이트
                                setIsDragging(true); // 드래그 시작
                                window.addEventListener("mousemove", handleMouseMove);
                                window.addEventListener("mouseup", handleMouseUp);
                            }}
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