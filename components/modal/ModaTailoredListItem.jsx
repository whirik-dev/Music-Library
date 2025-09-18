import Indicator from "@/components/ui/Indicator";

/**
 * 
 * @param {string} type 
 * @param {Array} data
 * @returns {React.ReactNode}
 */
const ModalListItem = ({ type, data, action }) => {
    return (
        <div className="border-b-1 border-zinc-500/50">
            <div className={`flex flex-row w-full py-2 ${type === "head" ? "text-white" : "text-white/50"}`}>
                <div className="w-1/5 flex justify-start">
                    {type === "head" ? "Work Name" : data.name}
                </div>
                <div className="w-1/5 flex flex-row gap-2 items-center justify-start capitalize">
                {type != "head" && <Indicator status={data.status === "done" ? "success" : data.status === "in progress" || "pending" ? "warning" : "off"}/>}
                    {type === "head" ? "status" : data.status}
                </div>
                <div className="w-1/5 flex flex-row gap-2 items-center justify-start capitalize">
                    {type === "head" ? "last updated" : data.last_updated}
                </div>
                <div className="ml-auto">
                    {action ? (
                        <>
                            {action.name}
                        </>
                    ) : "-"}
                </div>
            </div>
        </div>
    )
}
export default ModalListItem;