"use client";

import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import MusicItem from "@/components/player/MusicItem";
import MusicItemSkeleton from "@/components/skeleton/MusicItemSkeleton";
import EmptyContent from "@/components/page/EmptyContent";

const TailoredMusicSelector = ({ onSelect }) => {
    const t = useTranslations('tailored');
    const [musicList, setMusicList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => {
        fetchMusicList();
    }, []);

    const fetchMusicList = async () => {
        setIsLoading(true);
        try {
            // TODO: 실제 API 호출
            // const response = await fetch('/api/music/list');
            // const data = await response.json();
            // setMusicList(data);
            
            // 임시 데이터
            setTimeout(() => {
                setMusicList([]);
                setIsLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Failed to fetch music list:', error);
            setIsLoading(false);
        }
    };

    const handleMusicSelect = (music) => {
        setSelectedId(music.id);
        onSelect(music);
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                    {t('select_music') || '음악 선택'}
                </h2>
                <p className="text-zinc-400">
                    {t('select_music_description') || '맞춤 제작할 음악을 선택하세요'}
                </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                {isLoading ? (
                    <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                            <MusicItemSkeleton key={i} />
                        ))}
                    </div>
                ) : musicList.length === 0 ? (
                    <EmptyContent content={t('no_music_available') || '사용 가능한 음악이 없습니다'} />
                ) : (
                    <div className="space-y-2">
                        {musicList.map((music) => (
                            <div
                                key={music.id}
                                onClick={() => handleMusicSelect(music)}
                                className={`cursor-pointer rounded-lg transition-all ${
                                    selectedId === music.id 
                                        ? 'ring-2 ring-purple-500' 
                                        : 'hover:bg-zinc-800/50'
                                }`}
                            >
                                <MusicItem data={music} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TailoredMusicSelector;
