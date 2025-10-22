"use client";

import { IconPlayerPlayFilled, IconPlayerPauseFilled, IconCheck } from "@tabler/icons-react";
import useMusicItemStore from "@/stores/useMusicItemStore";
import PlayerThumbnail from "@/components/player/PlayerThumbnail";
import Term from "@/components/player/MusicItemTerm";

const TailoredMusicItem = ({ data, isSelected, onSelect }) => {
    const { status, playingTrackId, play, pause, resume } = useMusicItemStore();
    
    // 이 아이템이 재생중인지 확인
    const isPlaying = playingTrackId === data.id && status === 'playing';
    const isPaused = playingTrackId === data.id && status === 'paused';
    
    const title = data.metadata.find(item => item.type === "title")?.content;
    const subtitle = data.metadata.find(item => item.type === "subtitle")?.content;
    const keywords = (data.keywords || []).filter(item => item.type === 'tag');

    const handlePlayPause = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (isPlaying) {
            // 재생 중이면 일시정지
            pause();
        } else if (isPaused) {
            // 일시정지 상태면 재개
            resume();
        } else {
            // 정지 상태면 새로 재생
            // musicList store에 트랙이 있는지 확인하고 없으면 추가
            const { musicList } = await import('@/stores/useMusicListStore').then(m => m.default.getState());
            const trackInStore = musicList.find(track => track.id === data.id);
            
            if (!trackInStore) {
                // store에 없으면 추가
                const { default: useMusicListStore } = await import('@/stores/useMusicListStore');
                useMusicListStore.setState((prev) => ({
                    musicList: [...prev.musicList, data]
                }));
            }
            
            // 재생
            await play(data.id);
        }
    };

    const handleSelect = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onSelect(data);
    };

    return (
        <div
            className={`
                relative px-4 py-4 flex items-center gap-4 rounded-lg
                transition-all duration-200
                ${isSelected 
                    ? 'bg-purple-500/20 ring-2 ring-purple-500' 
                    : 'bg-zinc-800/50'
                }
            `}
        >
            {/* Play/Pause Button */}
            <button
                type="button"
                onClick={handlePlayPause}
                className="relative z-10 flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full 
                         bg-zinc-700 hover:bg-zinc-600 transition-colors cursor-pointer"
            >
                {isPlaying ? (
                    <IconPlayerPauseFilled size={18} className="text-white" />
                ) : (
                    <IconPlayerPlayFilled size={18} className="text-white" />
                )}
            </button>

            {/* Thumbnail */}
            <div className="flex-shrink-0">
                <PlayerThumbnail 
                    playingTrackId={data.id} 
                    playingFiles={data.files}
                />
            </div>

            {/* Title and Tags */}
            <div className="flex-1 min-w-0">
                <div className="font-semibold text-white truncate">
                    {title}
                </div>
                {subtitle && (
                    <div className="text-sm text-zinc-400 truncate">
                        {subtitle}
                    </div>
                )}
                {keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 pointer-events-none">
                        {keywords.slice(0, 5).map((keyword, index) => (
                            <Term key={index} name={keyword.content} isMark={keyword.mark} />
                        ))}
                    </div>
                )}
            </div>

            {/* Select Button */}
            <button
                type="button"
                onClick={handleSelect}
                className="relative z-10 flex-shrink-0 hover:scale-110 transition-transform cursor-pointer"
            >
                {isSelected ? (
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-500">
                        <IconCheck size={20} className="text-white" />
                    </div>
                ) : (
                    <div className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-zinc-600 hover:border-purple-500">
                        <div className="w-4 h-4 rounded-full bg-transparent" />
                    </div>
                )}
            </button>
        </div>
    );
};

export default TailoredMusicItem;
