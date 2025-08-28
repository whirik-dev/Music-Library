const GridRow = ({ children }) => {
    return (
        <div className="px-3 lg:px-10 my-3 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {children}
        </div>
    );
}

export default GridRow;