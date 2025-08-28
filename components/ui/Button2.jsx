const Button = ({ name, onClick, size="md", className, bg="bg-zinc-800", color="text-foreground" }) => {
    const textSizes = {
        xs: "text-xs",
        sm: "text-sm",
        md: "text-md",
        lg: "text-lg",
        xl: "text-xl",
        top: "text-sm",
    }

    const wrapperSizes = {
        xs: "py-1 px-2",
        sm: "py-2 px-3",
        md: "py-3 px-4",
        lg: "py-4 px-5",
        xl: "py-5 px-6",
        top: "py-2 px-3",
    }

    return (
        <div className={`${wrapperSizes[size]} ${bg} rounded-md text-center cursor-pointer
                        hover:opacity-70 active:opacity-50 select-none ${className}
                        `}
             onClick={onClick}
        >
            <span className={`${textSizes[size]} uppercase ${color}`}>
                {name}
            </span>
        </div>
    )
}
export default Button;