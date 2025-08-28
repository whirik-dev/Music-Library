const Heading = ({ children, align="lg:text-left" }) => {
    return (
        <h2 className={`px-3 lg:px-10 text-3xl text-center ${align} lg:text-5xl font-bold capitalize`}>
            {children}
        </h2>
    )
}

export default Heading;