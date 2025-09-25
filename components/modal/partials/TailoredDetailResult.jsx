import Button from "@/components/ui/Button2"

const TailoredDetailResult = ({ id }) => {
    const retryHandler = () => {
        console.log("retry");
    }
    const confirmHandler = () => {
        console.log("confirm");
    }

    return (
        <>
            <div className="bg-foreground/3 p-3 rounded-lg">
                <div className="capitalize font-bold mb-3">
                    tailored service completed
                </div>

                <div className="bg-foreground/3 p-3 rounded-lg mb-3">
                    <div className="text-xs text-foreground/50 uppercase mb-2">
                        Status
                    </div>
                    <div className="text-sm mb-2">
                        Your result music has arrived.
                    </div>
                    <div className="text-sm text-foreground/70">
                        Please listen and click confirm. If not confirmed within 72 hours, it will be automatically confirmed.
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
                    result
                </div>

                <div className="bg-foreground/3 p-3 rounded-lg mb-3">
                    <div className="text-xs text-foreground/50 uppercase mb-2">
                        Generated Music
                    </div>
                    <audio src={id} controls className="w-full">
                        Your browser does not support the audio element.
                    </audio>
                </div>

                <div className="flex flex-row gap-2 justify-end">
                    <Button
                        name="retry"
                        onClick={retryHandler}
                        bg="bg-foreground/10 font-bold"
                        className="opacity-40"
                    />
                    <Button
                        name="confirm"
                        onClick={confirmHandler}
                        bg="bg-purple-500 font-bold"
                    />
                </div>
            </div>
        </>
    )
}
export default TailoredDetailResult;