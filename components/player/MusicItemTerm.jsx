"use client"
import useMusicListStore from "@/stores/useMusicListStore";
import { toast } from 'react-toastify';

const MusicItemTerm = ({ name }) => {
    const { query, setQuery, queryMusicList } = useMusicListStore();

    const handleAddTagToQuery = (tag) => {
        const tags = query.trim().split(' ');

        if (tags.includes(tag)) {
            toast.warning(`'${name}' Tag already added`);
            return;
        }

        const newQuery = query === '' ? tag : `${query} ${tag}`;
        setQuery(newQuery);
        queryMusicList();
    }

    return (
        <div className="bg-zinc-800 rounded-sm px-1 py-0.5 text-xs select-none cursor-pointer hover:opacity-70"
             onClick={()=>handleAddTagToQuery(name)}
        >
            {name}
        </div>
    );
}

export default MusicItemTerm;