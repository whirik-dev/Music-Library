"use client";

import { useEffect } from "react";
import { useTranslations } from 'next-intl';

import useMusicListStore from "@/stores/useMusicListStore"; // Adjust path as needed
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import { useGoogleAnalytics } from "@/hooks/useGoogleAnalytics";
import { trackPageView } from "@/lib/analytics";

import Hero from "@/components/ui/Hero";
import Playlists from "@/components/playlist/Playlists";
import FilterOptions from "@/components/search/FilterOptions";
import Footer from "@/components/ui/Footer";
import MusicItemList from "@/components/player/MusicItemList";
import MusicItem from "@/components/player/MusicItem";
import MusicItemSkeleton from "@/components/skeleton/MusicItemSkeleton";
import EmptyContent from "@/components/page/EmptyContent";

export default function Home() {
  const t = useTranslations('pages.home');
  const {
    musicList,
    isLoading,
    isLoadingMore,
    hasMore,
    fetchMusicList,
    loadMore,
    listMode
  } = useMusicListStore();

  // Google Analytics 추적
  useGoogleAnalytics();

  // 무한스크롤 훅 사용
  const triggerRef = useInfiniteScroll(loadMore, hasMore, isLoadingMore);

  useEffect(() => {
    fetchMusicList();
    // 홈페이지 방문 추적
    trackPageView('Home');
  }, [fetchMusicList]);

  return (
    <div className="min-h-screen relative">
      <Hero className="bg-gradient-to-r from-0% via-50% from-orange-400 via-red-400 to-purple-400 bg-no-repeat">
        <h1 className="text-3xl font-bold py-5 text-white">{t('hero_title')}</h1>
      </Hero>


      <Playlists />
      {/* <FilterOptions /> */}

      

      <MusicItemList>
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
                {hasMore && (
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
      </MusicItemList>
      <Footer />
    </div>
  );
}