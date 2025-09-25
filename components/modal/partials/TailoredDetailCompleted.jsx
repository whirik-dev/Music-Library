import Button from "@/components/ui/Button2"

const TailoredDetailResult = ({ id }) => {
    const downloadHandler = () => {
        console.log("download");
    }

    return (
        <>
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
                        name="download"
                        onClick={downloadHandler}
                        bg="bg-purple-500 font-bold"
                    />
                </div>
            </div>
        </>
    )
}
export default TailoredDetailResult;