"use client";

import { useEffect } from "react";

import useMusicListStore from "@/stores/useMusicListStore"; // Adjust path as needed

import Hero from "@/components/ui/Hero";
import FilterOptions from "@/components/search/FilterOptions";
import Footer from "@/components/ui/Footer";
import MusicItemList from "@/components/player/MusicItemList";
import MusicItem from "@/components/player/MusicItem";
import MusicItemSkeleton from "@/components/skeleton/MusicItemSkeleton";
import EmptyContent from "@/components/page/EmptyContent";

export default function Home() {
  const { musicList, isLoading, fetchMusicList, listMode } = useMusicListStore();

  useEffect(() => {
    fetchMusicList();
  }, [fetchMusicList]);

  return (
    <div className="min-h-screen relative">
      <Hero className="bg-gradient-to-r from-0% via-50% from-orange-400 via-red-400 to-purple-400 bg-no-repeat">
        <h1 className="text-3xl font-bold py-5 text-white">Explore Unlimited Background Music – Anytime, Anywhere!</h1>
      </Hero>
      


      <FilterOptions />

      <MusicItemList>
        {listMode === 'empty' ? (
          <EmptyContent>
            다른 검색어들이 나옴 (클릭가능)
          </EmptyContent>
        ) : (
          <>
            {isLoading ? (
              <>
                {[...Array(20)].map((_, i) => (
                  <MusicItemSkeleton key={i} />
                ))}
              </>
            ) : musicList.length > 0 ? (
              musicList.map((item) => (
                <MusicItem
                  key={item.id}
                  data={item}
                />
              ))
            ) : (
              // No music items available. // Optional: Handle empty state
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