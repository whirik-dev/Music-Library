const PlaylistGrid = ({children, col, title}) => {

    const commonStyle = "px-5 gap-5"
    return (
        <>
        {title && (
            <div className={`${commonStyle} text-3xl font-bold my-3`}>
                {title}
            </div>
        )}
        <div className={`grid grid-cols-${col} ${commonStyle}`}>
            {children}
        </div>
        </>
    )
}
export default PlaylistGrid;