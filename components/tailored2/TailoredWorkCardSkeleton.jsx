const TailoredWorkCardSkeleton = () => {
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 animate-pulse">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="h-6 bg-zinc-800 rounded w-3/4 mb-2"></div>
                    <div className="h-5 bg-zinc-800 rounded w-20"></div>
                </div>
                <div className="w-6 h-6 bg-zinc-800 rounded"></div>
            </div>
            <div className="space-y-2">
                <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
                <div className="flex gap-1 mt-3">
                    <div className="h-6 bg-zinc-800 rounded w-16"></div>
                    <div className="h-6 bg-zinc-800 rounded w-16"></div>
                    <div className="h-6 bg-zinc-800 rounded w-16"></div>
                </div>
            </div>
        </div>
    );
};

export default TailoredWorkCardSkeleton;
