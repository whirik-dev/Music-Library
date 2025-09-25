const TailoredDetailProcessing = ({ id }) => {
    return (
        <div className="bg-foreground/3 p-3 rounded-lg">
            <div className="capitalize font-bold mb-3">
                work in progress
            </div>

            <div className="bg-foreground/3 p-3 rounded-lg mb-3">
                <div className="text-xs text-foreground/50 uppercase mb-2">
                    Status
                </div>
                <div className="text-sm mb-2">
                    Your tailored request is currently in progress.
                </div>
                <div className="text-sm text-foreground/70">
                    We will notify you when the work is completed. Please wait.
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
export default TailoredDetailProcessing;