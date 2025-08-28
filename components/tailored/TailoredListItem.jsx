import { 
    IconQuestionMark, 
    IconCheck,
    IconEaseInControlPoint,
    IconSection,
    IconAdjustmentsHorizontal,
    IconPlayerPause,
    IconRepeatOnce,
    IconRepeat,
    IconMetronome,
    IconWaveSine,
    IconAdjustmentsAlt,
    IconStars,
    IconVolume2,
    IconScissors,
    IconMicrophone2,
    IconMusic,
    IconMoodSmile,
    IconArrowsShuffle,

} from "@tabler/icons-react"

import useTailoredStore from "@/stores/useTailoredStore";

const iconMap = {
    IconEaseInControlPoint,
    IconSection,
    IconAdjustmentsHorizontal,
    IconPlayerPause,
    IconRepeatOnce,
    IconRepeat,
    IconMetronome,
    IconWaveSine,
    IconAdjustmentsAlt,
    IconStars,
    IconVolume2,
    IconScissors,
    IconMicrophone2,
    IconMusic,
    IconMoodSmile,
    IconArrowsShuffle,
};

const TailoredListItem = ({ id, head, desc, icon, onClick}) => {
    const { works, addWorks, removeWorks } = useTailoredStore();
    //selected 여부는 스테이트로 판단
    const selected = works.length > 0  && works.includes(id) ? true : false;
    const IconComponent = iconMap[icon] || IconEaseInControlPoint;
    return (
        <div className={`relative bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800/40 shadow-md
            ${selected && "ring-1 ring-zinc-700 text-red-400"}`} 
        >
            <div className="flex flex-row items-center gap-4 px-3 py-2 select-none" 
                 onClick={()=> selected ? removeWorks(id) : addWorks(id)}
            >
                {/* <div className="">
                    <div className="size-4 ring-1 ring-zinc-700 rounded-sm flex items-center justify-center">
                        {selected && (
                            <IconCheck size="18" />
                        )}
                    </div>
                </div> */}
                <div className="">
                    <IconComponent size={36} />
                </div>
                <div className="min-h-13 flex flex-col justify-center">
                    <div className="text-md">
                        {head}
                    </div>
                    <div className="text-white/30 mr-10 text-xs">
                        {desc}
                    </div>
                </div>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-4">
                <div className="size-6 ring-1 ring-zinc-700 flex items-center justify-center rounded-full text-zinc-300 cursor-pointer hover:ring-zinc-300">
                    <IconQuestionMark size="18"/>
                </div>
            </div>
        </div>
    )
}
export default TailoredListItem