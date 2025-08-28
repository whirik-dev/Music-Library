const MusicItemSkeleton = ({}) => {

    const common = "bg-zinc-800 animate-pulse";

    return (
        <div className="">
            <div className="relative px-2 text-sm md:text-md">
            <div className={`px-2 lg:px-6 py-5 flex flex-col rounded-sm`}>
                <div className="flex flex-row items-center gap-3">
                    {/* 재생상태 */}
                    <div className="">
                        <div className={`${common} size-4.5`}></div>
                    </div>

                    {/* 커버사진 */}
                    <div className="">
                        <div className={`${common} size-12 rounded-sm`}></div>
                    </div>
                    
                    {/* 제목과 부제목 */}
                    <div className="flex flex-col w-full md:w-48 xl:w-48 2xl:w-72 ">
                        <div className={`${common} w-3/7 h-4 mb-1 rounded-sm`}></div>
                        <div className={`${common} w-6/9 h-4 rounded-sm`}></div>
                    </div>
                    
                    {/* 태그 */}
                    <div className="hidden md:flex flex-row gap-1 flex-wrap w-auto xl:w-48 2xl:w-72">
                        <div className={`${common} w-12 h-7 rounded-sm`}></div>
                        <div className={`${common} w-22 h-7 rounded-sm`}></div>
                        <div className={`${common} w-8 h-7 rounded-sm`}></div>
                    </div>
                    
                    {/* 시간 */}
                    <div className="min-w-18 text-center ml-auto text-white/40 flex justify-center">
                        <div className={`${common} w-12 h-5 rounded-sm`}></div>
                    </div>

                    {/* 웨이브파형 */}
                    <div className="hidden xl:flex flex-1 h-12 items-center">
                        <div className={`${common} w-full h-[1px] rounded-sm`}></div>
                    </div>

                    {/* 기능아이콘 */}
                    <div className="ml-3 flex flex-row gap-3 items-center">
                        <div className={`${common} size-5 rounded-sm`}></div>
                        <div className={`${common} size-5 rounded-sm`}></div>
                        <div className={`${common} size-5 rounded-sm`}></div>

                    </div>
                </div>
            
            </div>
        </div>
        </div>
    )
}
export default MusicItemSkeleton;

