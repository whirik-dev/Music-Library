const TailoredDetailFail = ({ id }) => {
    return (
        <div className="bg-foreground/3 p-3 rounded-lg">
            <div className="capitalize font-bold mb-3 text-red-500">
                tailored work publication failed
            </div>

            <div className="bg-foreground/3 p-3 rounded-lg mb-3">
                <div className="text-xs text-foreground/50 uppercase mb-2">
                    Status
                </div>
                <div className="text-sm mb-2">
                    Publication failed due to unknown reasons.
                </div>
                <div className="text-sm text-foreground/70 mb-2">
                    If you have published work before, please try again.
                </div>
                <div className="text-sm text-foreground/70">
                    If the problem persists, please contact us.
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
export default TailoredDetailFail;