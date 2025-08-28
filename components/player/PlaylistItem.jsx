import DynamicAlbumart from "@/components/player/DynamicAlbumart";

const PlaylistItem = ({ children, option }) => {
    return (
        <div className="">
            <DynamicAlbumart 
                id={option?.pid || ''} 
                color={option.albumartMeta?.color || ''} 
                type={option.albumartMeta?.type || ''} 
            />
            <div className="font-bold text-lg mt-2 capitalize">
                {option.name}
            </div>
            <div className="text-white/40">
                {option.count} Songs
            </div>
        </div>
    );
}

export default PlaylistItem;