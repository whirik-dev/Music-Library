import Button from "@/components/ui/Button2"

const TailoredDetailEstimate = ({ id }) => {
    const paymentHandler = (action) => {
        console.log(`${action} payment for job ${id}`)
    }

    return (
        <>
            <div className="bg-foreground/3 p-3 rounded-lg">
                <div className="capitalize font-bold mb-3">
                    estimate completed
                </div>

                <div className="bg-foreground/3 p-3 rounded-lg mb-3">
                    <div className="text-xs text-foreground/50 uppercase mb-2">
                        Status
                    </div>
                    <div className="text-sm mb-2">
                        The estimate for your work has been completed.
                    </div>
                    <div className="text-sm text-foreground/70">
                        Click approve to proceed with the work.
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
            <div className="bg-foreground/3 p-3 rounded-lg">
                <div className="capitalize font-bold mb-3">
                    estimate
                </div>

                <div className="flex flex-row gap-3 mb-3">
                    <div className="bg-foreground/3 p-3 rounded-lg flex-1">
                        <div className="text-xs text-foreground/50 uppercase mb-1">
                            Job Price (Estimate)
                        </div>
                        <div className="text-2xl font-bold">20</div>
                        <div className="text-xs text-foreground/50">credits</div>
                    </div>

                    <div className="bg-foreground/3 p-3 rounded-lg flex-1">
                        <div className="text-xs text-foreground/50 uppercase mb-1">
                            Your Balance
                        </div>
                        <div className="text-2xl font-bold">70</div>
                        <div className="text-xs text-foreground/50">credits</div>
                    </div>

                    <div className="bg-foreground/3 p-3 rounded-lg flex-1">
                        <div className="text-xs text-foreground/50 uppercase mb-1">
                            Balance After Payment
                        </div>
                        <div className="text-2xl font-bold">50</div>
                        <div className="text-xs text-foreground/50">credits</div>
                    </div>
                </div>

                <div className="flex flex-row gap-2 justify-end">
                    <Button
                        name="cancel"
                        onClick={() => paymentHandler('cancel')}
                        bg="bg-red-400 font-bold"
                    />
                    <Button
                        name="approve"
                        onClick={() => paymentHandler('approve')}
                        bg="bg-green-400 font-bold"
                    />
                </div>
            </div>
        </>
    )
}
export default TailoredDetailEstimate;