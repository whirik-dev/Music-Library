import { IconCircleCheck, IconCircle } from "@tabler/icons-react";

const TailoredTimeline = ({ timeline }) => {
    return (
        <div className="space-y-4">
            {timeline.map((item, index) => (
                <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                        <div className={`rounded-full p-1 ${
                            index === timeline.length - 1 
                                ? 'bg-purple-500 text-white' 
                                : 'bg-zinc-700 text-zinc-400'
                        }`}>
                            {index === timeline.length - 1 ? (
                                <IconCircleCheck size={20} />
                            ) : (
                                <IconCircle size={20} />
                            )}
                        </div>
                        {index < timeline.length - 1 && (
                            <div className="w-0.5 h-full bg-zinc-700 mt-2"></div>
                        )}
                    </div>
                    <div className="flex-1 pb-6">
                        <div className="text-sm font-semibold text-white mb-1">
                            {item.status}
                        </div>
                        <div className="text-xs text-zinc-500 mb-2">
                            {item.date}
                        </div>
                        <div className="text-sm text-zinc-400">
                            {item.description}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TailoredTimeline;
