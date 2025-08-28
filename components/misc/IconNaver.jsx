const IconNaver = ({ size="24", onClick }) => {
    return (
        <div className="inline-block text-green-500 scale-80" onClick={onClick}>
            <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727z"/>
            </svg>
        </div>
    )
}
export default IconNaver;