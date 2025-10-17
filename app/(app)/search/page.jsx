"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import useMusicListStore from "@/stores/useMusicListStore"; // Adjust path as needed
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import { useGoogleAnalytics } from "@/hooks/useGoogleAnalytics";
import { trackSearch, trackPageView } from "@/lib/analytics";

import FilterOptions from "@/components/search/FilterOptions";
import Footer from "@/components/ui/Footer";
import MusicItemList from "@/components/player/MusicItemList";
import MusicItem from "@/components/player/MusicItem";
import MusicItemSkeleton from "@/components/skeleton/MusicItemSkeleton";
import EmptyContent from "@/components/page/EmptyContent";

export default function Search() {
    const t = useTranslations('pages.search');
    const [queryExists, setQueryExists] = useState(false);
    const {
        musicList,
        isLoading,
        isLoadingMore,
        hasMore,
        query,
        setQuery,
        queryMusicList,
        fetchMusicList,
        loadMore,
        resetList,
        listMode
    } = useMusicListStore();

    // Google Analytics 추적
    useGoogleAnalytics();

    // 무한스크롤 훅 사용
    const triggerRef = useInfiniteScroll(loadMore, hasMore && queryExists, isLoadingMore);

    const searchParams = useSearchParams();
    const searchTerm = searchParams.getAll('q');

    useEffect(() => {
        const combinedSearchTerm = searchTerm.join(' ');
        setQuery(combinedSearchTerm);

        // 새로운 검색 시 리스트 초기화
        resetList();

        if (searchTerm.length > 0) {
            setQueryExists(true);
            console.log(combinedSearchTerm);
            queryMusicList(0, false); // 첫 페이지부터 시작

            // 검색 이벤트 추적
            trackSearch(combinedSearchTerm);
            trackPageView('Search');
        }
        else {
            setQueryExists(false);
        }

        return () => {
            setQuery('');
        };
    }, [searchParams, setQuery, queryMusicList, resetList]);

    return (
        <div className="min-h-screen relative">
            {queryExists && (
                <>
                    {/* <FilterOptions /> */}
                </>
            )}

            <MusicItemList>
                {!queryExists ? (
                    <EmptyContent content={t('no_term_message')}>

                    </EmptyContent>
                ) : (
                    <>
                        {listMode === 'empty' ? (
                            <EmptyContent>
                                {t('empty_suggestions')}
                            </EmptyContent>
                        ) : (
                            <>
                                {isLoading && musicList.length === 0 ? (
                                    // 첫 로딩
                                    <>
                                        {[...Array(20)].map((_, i) => (
                                            <MusicItemSkeleton key={i} />
                                        ))}
                                    </>
                                ) : musicList.length > 0 ? (
                                    <>
                                        {musicList.map((item) => (
                                            <MusicItem
                                                key={item.id}
                                                data={item}
                                            />
                                        ))}
                                        {/* 무한스크롤 트리거 요소 */}
                                        {hasMore && queryExists && (
                                            <div ref={triggerRef} className="h-1" />
                                        )}
                                        {/* 더 로딩 중일 때 스켈레톤 추가 */}
                                        {isLoadingMore && (
                                            <>
                                                {[...Array(8)].map((_, i) => (
                                                    <MusicItemSkeleton key={`loading-${i}`} />
                                                ))}
                                            </>
                                        )}
                                    </>
                                ) : (
                                    // No music items available
                                    <>
                                        {[...Array(20)].map((_, i) => (
                                            <MusicItemSkeleton key={i} />
                                        ))}
                                    </>
                                )}
                            </>
                        )}
                    </>
                )}
            </MusicItemList>
            <Footer />
        </div>
    );
}