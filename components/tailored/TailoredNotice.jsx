import Button from "@/components/ui/Button2";
import { IconNotification } from "@tabler/icons-react";
const TailoredNotice = () => {

    const strongStyle = `text-purple-400 block`;

    return (
        <div className="aspect-square flex flex-col items-center justify-center">
            {/* <IconNotification size="72" className="text-green-500" />
            <div className="text-2xl">
                Tailored Service
            </div> */}
            <div className="w-full flex flex-col gap-3 mb-3">
                <div className="bg-foreground/5 w-full p-10 text-sm rounded-md">
                    <div className="text-lg font-bold">
                        What is Tailored Service?
                    </div>
                    <div className="mb-3">
                        Tailored Service adapts the music to match your requirements. Here are some of the things we can offer.
                    </div>
                    <ul className="list-disc ml-5 flex flex-col gap-3">
                        <li>
                            <strong className={strongStyle}>Simple Adjustments</strong> 
                            Volume control, fade in/out, loop point settings
                        </li>
                        <li>
                            <strong className={strongStyle}>Basic Edits</strong> 
                            Add/remove intro/outro, move climax, repeat or shorten themes
                        </li>
                        <li>
                            <strong className={strongStyle}>Timing & Tempo</strong> 
                            Change tempo, gradual tempo shifts, beat sync with video or external audio
                        </li>
                        <li>
                            <strong className={strongStyle}>Mixing & Effects</strong> 
                            Balance instruments, EQ adjustments, add reverb/FX, insert break sections
                        </li>
                        <li>
                            <strong className={strongStyle}>Creative Arrangement</strong> 
                            Replace or add instruments, adjust mood, convert to a different genre
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
export default TailoredNotice;