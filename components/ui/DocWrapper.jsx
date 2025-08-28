const DocWrapper = ({ children }) => {
    return (
        <div className="p-3 flex flex-col">
            <div className="xl:w-[976px] p-5 bg-foreground/2 rounded-md">
                {children}
            </div>
        </div>
    )
} 
export default DocWrapper;