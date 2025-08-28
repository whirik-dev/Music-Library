const PrototypeFrame = ({name, className="h-8", marginX="10"}) => {
    return (
        <div className={`relative px-${marginX} my-8 text-white box-border`}>
            <div className={`flex items-center justify-center text-teal-200 text-xl lg:text-2xl
                             relative w-full border-1 border-teal-200 ${className}`}
            >
                {name}
            </div>
        </div>
    )
}

export default PrototypeFrame