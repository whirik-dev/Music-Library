"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl'; 

import useMusicListStore from "@/stores/useMusicListStore"; // Adjust path as needed

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
        query, 
        setQuery, 
        queryMusicList, 
        fetchMusicList, 
        listMode 
    } = useMusicListStore();

    const searchParams = useSearchParams();
    const searchTerm = searchParams.getAll('q'); 

    useEffect(() => {
        const combinedSearchTerm = searchTerm.join(' '); 
        setQuery(combinedSearchTerm);
        if(searchTerm.length > 0 )
        {
            setQueryExists(true);
            console.log(combinedSearchTerm);
            queryMusicList(query);
        }
        else
        {
            setQueryExists(false);
            // fetchMusicList();
        }
        return () => {
            setQuery('');
        };
    }, [searchParams, setQuery, queryMusicList, fetchMusicList]);

    return (
        <div className="min-h-screen relative">
        {queryExists && (
            <FilterOptions />
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
                </>
            )}
        </MusicItemList>
        <Footer />
        </div>
    );
}