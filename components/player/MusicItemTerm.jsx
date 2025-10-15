"use client"
import useMusicListStore from "@/stores/useMusicListStore";
import { toast } from 'react-toastify';

const MusicItemTerm = ({ name, isMark }) => {
    const { query, setQuery, queryMusicList, resetList } = useMusicListStore();

    const handleAddTagToQuery = (tag) => {
        const tags = query.trim().split(' ');

        if (tags.includes(tag)) {
            toast.warning(`'${name}' Tag already added`);
            return;
        }

        const newQuery = query === '' ? tag : `${query} ${tag}`;
        setQuery(newQuery);
        resetList(); // 새로운 검색 시 리스트 초기화
        queryMusicList(0, false); // 첫 페이지부터 시작
    }

    return (
        <div className={`rounded-sm px-1 py-0.5 text-xs select-none cursor-pointer hover:opacity-70
            ${isMark ? 'bg-yellow-300 text-black' : 'bg-zinc-800'}
            `}
            onClick={() => handleAddTagToQuery(name)}
        >
            {name}
        </div>
    );
}

export default MusicItemTerm;