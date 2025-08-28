"use client";

import useUiStore from "@/stores/uiStore";

const WaveProgressSkeleton = () => {
    const { colorMode } = useUiStore();
    return (
        <div className="relative w-full h-full cursor-none backdrop-blur-md">
            {/* 웨이브 이미지 */}
            <div className="relative flex items-center w-full h-full overflow-hidden">
                <div className={`absolute w-full h-full ${colorMode === "light" ? "brightness-10 opacity-20" : "opacity-10 brightness-75`"}`}>
                    {/* 이거 중요함 웨이브가 볼륨이 0인 부분에서 선 표시하는거임 */}
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white" />
                </div>
            </div>
        </div>
    )
}
export default WaveProgressSkeleton;