const TailoredDetailPending = ({ id }) => {
    return (
        <div className="bg-foreground/3 p-3 rounded-lg">
            <div className="capitalize font-bold mb-3">
                pending
            </div>

            <div className="bg-foreground/3 p-3 rounded-lg mb-3">
                <div className="text-xs text-foreground/50 uppercase mb-2">
                    Status
                </div>
                <div className="text-sm mb-2">
                    Your tailored service request has been completed.
                </div>
                <div className="text-sm text-foreground/70">
                    We are reviewing your request and setting the price. Please wait.
                </div>
            </div>

            <div className="bg-foreground/3 p-3 rounded-lg">
                <div className="text-xs text-foreground/50 uppercase mb-1">
                    Offer Number
                </div>
                <div className="text-lg font-bold">
                    #{id}
                </div>
            </div>
        </div>
    )
}
export default TailoredDetailPending;