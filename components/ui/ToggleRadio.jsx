const ToggleRadio = ({ state=true, onClick }) => {
    return (
        <div className={`w-12 h-7 rounded-full flex items-center ${state ? "justify-end bg-green-500" : "justify-start bg-zinc-700"} px-1 transition-all duration-300 cursor-pointer`}
             onClick={onClick}
        >
            <div className={`size-5 ${state ? "bg-zinc-200" : "bg-zinc-300"} rounded-full transition-all duration-300 hover:scale-90`} />
        </div>
    )
}
export default ToggleRadio;