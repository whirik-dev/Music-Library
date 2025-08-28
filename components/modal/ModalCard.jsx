const ModalCard = ({  type="default", title, desc, action, onClick}) => {
    return (
        <div className="mx-3 my-3 px-4 py-4 bg-zinc-800 rounded-lg ">
            <div className="flex flex-row items-end">
                <div className="flex flex-col gap-1 flex-1">
                    <div className="text-md capitalize font-bold">{title}</div>
                    <div className="text-sm text-foreground/50">{desc}</div>
                </div>
                <div className="flex-0">
                    {type === 'link' && (
                        <div>
                            <div className={`ring-3 ring-zinc-700 px-3 py-1 rounded-full select-none ${!onClick ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:opacity-50"}`}
                            >
                                <span className={`capitalize font-medium text-md`}>
                                    {action}
                                </span>
                            </div>
                        </div>
                    )}

                    {type === "action" && action && (
                        <div className={`ring-3 ring-zinc-700 px-3 py-1 rounded-full select-none ${!onClick ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:opacity-50"}`}
                                onClick={onClick}
                        >
                            <span className={`capitalize font-medium text-md`}>
                                {action}
                            </span>
                        </div>
                    )}

                    {type === "toggle" && action && (
                        <>                        
                            {/* <div className={`ring-3 ring-zinc-700 px-3 py-1 rounded-full select-none ${!onClick ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:opacity-50"}`}
                                    onClick={onClick}
                            >
                                <span className={`capitalize font-medium text-md`}>
                                    {action}
                                </span>
                            </div> */}

                            <div className={`w-12 h-7 rounded-full flex items-center ${action === 'light' ? "justify-end bg-yellow-400" : "justify-start bg-indigo-700"} px-1 transition-all duration-300 cursor-pointer`}
                                onClick={onClick}
                            >
                                <div className={`size-5 ${action === 'light'  ? "bg-background" : "bg-foreground"} rounded-full transition-all duration-300 hover:scale-90`} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
export default ModalCard;