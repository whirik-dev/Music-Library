const Hero = ({ children, className }) => {
    return (
        <div className={`px-3 mx-3 box-border bg-zinc-800 rounded-lg ${className}`}>
            <div className="w-full h-full flex items-center justify-center">
                
                {children}
            </div>
        </div>
    )
}
export default Hero;