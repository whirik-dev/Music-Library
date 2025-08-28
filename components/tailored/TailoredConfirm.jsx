"use client";
import useTailoredStore from "@/stores/useTailoredStore";

import Button from "@/components/ui/Button2";
import InputField from "@/components/ui/InputField";
import InputTextarea from "@/components/ui/InputTextarea";

const TailoredConfirm = () => {
    const { currentTailoredInfo, setTailoredInfoByPath } = useTailoredStore();

    const items = currentTailoredInfo?.data?.sow?.items || [];

    return (
        <>
            <div className="text-xl">
                Request Details
            </div>

            <div className="flex flex-col gap-5">
                <div className="flex flex-row">
                    <div className="w-[120px]">세부 요청 사항</div>
                    <div>
                        {items.map((item, index) => (
                            <div key={index}>
                                <span className="font-bold text-xs bg-neutral-600 px-[2px] py-[1px] rounded-sm">{item.pos1} - {item.pos2}</span> 
                                <br />
                                <span>{item.comment}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex flex-row">
                    <div className="w-[120px]">추가 요청 사항</div>
                    <div className="bg-zinc-800/50 flex-1 p-3 text-sm border-1 border-zinc-800/50 rounded-lg min-h-48">
                        {currentTailoredInfo.data.sow.comment1}
                    </div>
                </div>
            </div>
        </>
    )
}
export default TailoredConfirm;