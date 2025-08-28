const TailoredPlayerSkeleton = () => {

    const common = "bg-zinc-700 animate-pulse rounded-sm";

    return (
        <div className="tailored-player px-3 pt-3 pb-0 m-2 bg-zinc-800/50 rounded-lg">
            <div className="flex flex-row gap-3 items-center">
                <div className="size-12">
                    <div className={`w-full h-full ${common}`} />
                </div>
                <div className="">
                    <div className="font-bold">
                        <div className={`w-24 h-4 ${common}`} />
                    </div>
                    <div className="hidden md:block text-white/40">
                        <div className={`w-36 h-4 mt-2 ${common}`} />
                    </div>
                </div>
            </div>
            <div className="w-full h-[47.5px] flex items-center">
                <div className={`w-full h-[1px] ${common}`} />
            </div>
        </div>
    )
}
export default TailoredPlayerSkeleton;