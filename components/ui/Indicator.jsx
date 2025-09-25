const Indicator = ({ status = "success" }) => {
    return (
        <div className={`inline-block size-1.5 rounded-full ${status === "success" ? "bg-green-400 shadow-sm shadow-green-400"
            : status === "warning" ? "bg-yellow-300 shadow-sm shadow-yellow-400"
                : status === "error" ? "bg-red-400 shadow-sm shadow-red-400"
                    : status === "info" ? "bg-blue-400 shadow-sm shadow-blue-400"
                        : "bg-white/30"
            }`}>

        </div>
    )
}
export default Indicator;