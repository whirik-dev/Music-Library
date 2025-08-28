const HeroSection = ({ children }) => {
    return (
        <div className="px-3 lg:px-10 py-1">
            <div className="bg-blue-400/5 rounded-sm h-90">
                <div className="flex h-full items-center justify-center text-3xl capitalize">
                    {children ? children : 'Herosection'}
                </div>
            </div>
        </div>
    )
}

export default HeroSection;