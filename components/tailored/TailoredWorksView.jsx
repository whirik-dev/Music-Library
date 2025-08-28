import worksList from "./worksList"

import useTailoredStore from "@/stores/useTailoredStore";

const TailoredWorksView = () => {
    const { works } = useTailoredStore();
    return (
        <div className="">
            Action You Requested
            <div className="flex flex-row gap-2 mt-1 text-sm">
                {works.map((works)=>(
                    <div  key={works} className={`bg-zinc-800 px-2 py-0.5 italic rounded-sm`}>
                        {worksList.find(item => item.works_id === works)?.name}
                    </div>
                ))}
            </div>
        </div>
    )  
}
export default TailoredWorksView;