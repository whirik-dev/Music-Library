const Box = ({children, title}) => {
    return (
        <div className="p-3">
            <div className="p-5 border border-foreground/20 rounded-md">
                <div className="text-4xl font-bold mb-3">
                    {title}
                </div>
                {children}
            </div>
        </div>
    )
}
export default Box;