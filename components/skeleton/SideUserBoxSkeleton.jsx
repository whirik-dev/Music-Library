
import useMusicItemStore from "@/stores/useMusicItemStore";

const SideUserBoxSkeleton = () => {
    const common = "bg-zinc-700 animate-pulse rounded-sm";
    const { playingTrackId } = useMusicItemStore();
    return (
        <div className={`bg-zinc-800 p-3 rounded-sm select-none transition-normal duration-300 ${playingTrackId && "last:mb-16"}`}>
            <div className={`h-4 inline-block w-4/5 font-bold text-sm text-nowrap overflow-x-hidden ${common}`}>
            </div>
            <div className="font-normal text-white text-sm">
                 <div className={`inline-block w-10 h-4 mt-1 mr-2 ${common}`} />
                 <div className={`inline-block w-18 h-4 mr-3 ${common}`} />
            </div>
            <div className="mt-9">
                <div className="flex flex-row mb-1 text-sm justify-between">
                    <div className="text-white/50">
                        <div className={`inline-block w-20 h-4 mr-3 ${common}`} />
                    </div>
                    <div className="capitalize font-bold">
                        <div className={`inline-block w-10 h-4 ${common}`} />
                    </div>
                </div>
                <div className={`block w-full h-2 ${common} rounded-full`} />
                
            </div>
            {/* <Link href="/(.)preference"> */}
            <div className="flex flex-row items-center justify-between mt-2">
                <div className="flex flex-row items-center gap-1 cursor-pointer hover:opacity-50" 
                >
                 <div className={`inline-block w-26 h-6 mr-3 ${common}`} />
                </div>
                <div className="cursor-pointer hover:opacity-50">
                    <div className={`block size-5 ${common}`} />
                </div>
            </div>
            {/* </Link> */}
        </div>
    )
}
export default SideUserBoxSkeleton;