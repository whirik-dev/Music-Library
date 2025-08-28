const HeadingSub = ({ children, align }) => {
    return (
        <div className={`px-3 lg:px-10 text-2xl text-center ${align} lg:text-2xl font-bold capitalize`}>
            {children}
        </div>
    )
}
export default HeadingSub;