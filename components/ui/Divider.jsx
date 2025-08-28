const Divider = ({ name }) => {
    return (
        <div className="flex flex-row w-full gap-3">
            <div className="relative w-full">
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-zinc-800"></div>
            </div>
            <div className="text-zinc-700 uppercase">
                {name}
            </div>
            <div className="relative w-full">
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-zinc-800"></div>
            </div>
        </div>
    )
}
export default Divider;