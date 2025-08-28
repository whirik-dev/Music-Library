const PageWrapper = ({ children, className }) => {
    return (
        <div className={`min-h-screen ${className}`}>
            {children}
        </div>
    );
}

export default PageWrapper;