"use client";

import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';

import TailoredMusicItem from "@/components/tailored2/TailoredMusicItem";
import MusicItemSkeleton from "@/components/skeleton/MusicItemSkeleton";
import EmptyContent from "@/components/page/EmptyContent";
import Button from "@/components/ui/Button2";

const TailoredMusicSelector = ({ onSelect }) => {
    const t = useTranslations('tailored');
    const [musicList, setMusicList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    
    const ITEMS_PER_PAGE = 5;

    useEffect(() => {
        loadMusicPage(0);
    }, []);

    const getRandomBasePage = () => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        
        // 사용자별 고유 오프셋
        let offset = localStorage.getItem('userOffset');
        if (!offset) {
            const fingerprint = navigator.userAgent.length + 
                              screen.width + screen.height + 
                              new Date().getTimezoneOffset();
            offset = Math.abs(fingerprint % 500) + 1;
            localStorage.setItem('userOffset', offset.toString());
        }
        
        const timeBasedSeed = (dayOfYear * 1440) + (hours * 60) + minutes;
        const userOffset = parseInt(offset);
        return (timeBasedSeed + userOffset) % 2400 + 1;
    };

    const loadMusicPage = async (pageOffset) => {
        setIsLoading(true);
        try {
            const basePage = getRandomBasePage();
            const actualPage = Math.min(basePage + pageOffset, 2500);
            
            const params = new URLSearchParams();
            params.append('q', '*');
            params.append('p', actualPage.toString());
            
            const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/search?${params.toString()}`;
            const response = await fetch(url);
            
            if (response.ok) {
                const data = await response.json();
                const items = data.data?.items || [];
                
                // 5개만 가져오기
                const limitedItems = items.slice(0, ITEMS_PER_PAGE);
                
                setMusicList(limitedItems);
                setCurrentPage(pageOffset);
                setHasMore(items.length >= ITEMS_PER_PAGE);
            } else {
                setMusicList([]);
                setHasMore(false);
            }
        } catch (error) {
            console.error('Failed to fetch music list:', error);
            setMusicList([]);
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMusicSelect = (music) => {
        setSelectedId(music.id);
        // onSelect는 호출하지 않음 - 버튼을 눌러야만 다음 단계로
    };

    const handleConfirmSelection = () => {
        const selectedMusic = musicList.find(m => m.id === selectedId);
        if (selectedMusic) {
            onSelect(selectedMusic);
        }
    };

    const handleShuffle = () => {
        loadMusicPage(currentPage + 1);
        setSelectedId(null); // 셔플 시 선택 초기화
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
                    <div className="space-y-3">
                        {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
                            <MusicItemSkeleton key={i} />
                        ))}
                    </div>
                ) : musicList.length === 0 ? (
                    <EmptyContent content={t('no_music_available') || '사용 가능한 음악이 없습니다'} />
                ) : (
                    <>
                        <div className="space-y-3">
                            {musicList.map((music) => (
                                <TailoredMusicItem
                                    key={music.id}
                                    data={music}
                                    isSelected={selectedId === music.id}
                                    onSelect={handleMusicSelect}
                                />
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-6 pt-4 border-t border-zinc-800">
                            <Button
                                name={t('shuffle') || 'Shuffle'}
                                onClick={handleShuffle}
                                bg="bg-zinc-700"
                                color="text-white"
                                className="flex-1 px-6 py-2 font-semibold"
                            />
                            <Button
                                name={t('select_and_continue') || 'Select & Continue'}
                                onClick={handleConfirmSelection}
                                disabled={!selectedId}
                                bg={selectedId ? 'bg-gradient-to-r from-purple-500 to-blue-400' : 'bg-zinc-800'}
                                color={selectedId ? 'text-white' : 'text-zinc-600'}
                                className="flex-1 px-6 py-2 font-semibold"
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TailoredMusicSelector;
