const Button = ({ name, onClick, className}) => {

    return (
        <div className={`mx-3 my-3 px-4 py-3 bg-zinc-800 rounded-lg text-left cursor-pointer 
                        hover:opacity-70 active:opacity-50 select-none ${className}
                        `}
             onClick={onClick}
        >
            <span className="text-lg capitalize text-foreground">
                {name}
            </span>
        </div>
    )
}
export default Button;