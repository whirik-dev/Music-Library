const PageWrapper = ({ children, open=false, className }) => {
    return (
        <div className={`w-full flex ${className}`}>
            {open ? (
                <>
                    {children}
                </>
            ) : (
                <div className="w-full lg:w-5xl xl:w-7xl mx-auto">
                    {children}
                </div>
            )}
        </div>
    )
}
export default PageWrapper;