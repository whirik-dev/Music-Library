"use client"
import useMusicListStore from "@/stores/useMusicListStore";

const RelatedSuggestItem = ({ name, onClick, className, order }) => {
    const { searchTab, relSelected } = useMusicListStore();
    
    return (
        <div
            className={`cursor-pointer px-3 py-2 bg-zinc-900 hover:bg-zinc-700 rounded-full text-sm transition-opacity
                      ${searchTab ? "opacity-100" : "opcity-0"} ${className} ${relSelected === order && '!bg-accent'}`}
            onClick={() => onClick?.(name)}
        >
            {name}
        </div>
    );
}
export default RelatedSuggestItem;