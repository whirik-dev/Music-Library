"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { IconArrowLeft, IconLock, IconWorld } from '@tabler/icons-react';

import useMusicListStore from "@/stores/useMusicListStore";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";

import Hero from "@/components/ui/Hero";
import Footer from "@/components/ui/Footer";
import MusicItemList from "@/components/player/MusicItemList";
import MusicItem from "@/components/player/MusicItem";
import MusicItemSkeleton from "@/components/skeleton/MusicItemSkeleton";
import EmptyContent from "@/components/page/EmptyContent";

export default function PlaylistDetail() {
    const t = useTranslations('pages.playlist');
    const router = useRouter();
    const params = useParams();
    const { data: session } = useSession();
    const playlistId = params.id;

    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);

    // useMusicListStore 사용 (메인/search와 동일)
    const {
        musicList,
        isLoading,
        isLoadingMore,
        hasMore,
        renderMusicList,
        appendMusicList,
        resetList
    } = useMusicListStore();

    const [page, setPage] = useState(1);
    const [isFetching, setIsFetching] = useState(false);

    const triggerRef = useInfiniteScroll(loadMore, hasMore && !isFetching, isLoadingMore);

    useEffect(() => {
        // 플레이리스트 변경 시 리스트 초기화
        resetList();
        setPage(1);
        fetchPlaylistDetail();
        fetchPlaylistMusics(1);
    }, [playlistId, session]);

    const fetchPlaylistDetail = async () => {
        if (!session?.user?.ssid) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/playlist/${playlistId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${session.user.ssid}`
                    }
                }
            );

            const result = await response.json();
            if (result.success) {
                setPlaylist(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch playlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPlaylistMusics = async (pageNum) => {
        if (!session?.user?.ssid || isFetching) return;

        try {
            setIsFetching(true);
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/playlist/${playlistId}/musics?page=${pageNum}&limit=50`,
                {
                    headers: {
                        'Authorization': `Bearer ${session.user.ssid}`
                    }
                }
            );

            const result = await response.json();
            if (result.success && result.data) {
                const newItems = result.data.items || [];
                
                // 페이지 1이면 renderMusicList, 아니면 appendMusicList 사용
                if (pageNum === 1) {
                    await renderMusicList(newItems);
                } else {
                    await appendMusicList(newItems);
                }
                
                // hasMore는 store 내부에서 관리되지 않으므로 수동 설정 필요
                const hasMorePages = (result.data.current_page || 1) < (result.data.total_pages || 1);
                useMusicListStore.setState({ hasMore: hasMorePages });
                
                setPage(pageNum);
            } else {
                console.error('Failed to fetch playlist musics:', result.message || 'Unknown error');
                useMusicListStore.setState({ hasMore: false });
            }
        } catch (error) {
            console.error('Failed to fetch playlist musics:', error);
            useMusicListStore.setState({ hasMore: false });
        } finally {
            setIsFetching(false);
        }
    };

    function loadMore() {
        if (!isFetching && hasMore) {
            fetchPlaylistMusics(page + 1);
        }
    }

    if (!session) {
        return (
            <div className="min-h-screen relative flex items-center justify-center">
                <p className="text-foreground/70">{t('login_required')}</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen relative flex items-center justify-center">
                <p className="text-foreground/70">{t('loading')}</p>
            </div>
        );
    }

    if (!playlist) {
        return (
            <div className="min-h-screen relative flex items-center justify-center">
                <p className="text-foreground/70">{t('playlist_not_found')}</p>
            </div>
        );
    }

    const metadata = playlist.metadata || {};
    const bgClass = metadata.bgTailwind || 'bg-gradient-to-r from-purple-500 to-pink-500';

    return (
        <div className="min-h-screen relative">
            <Hero className={`${bgClass} bg-no-repeat`}>
                <div className="flex items-center gap-4 mb-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <IconArrowLeft size={24} className="text-white" />
                    </button>
                    <div className="flex items-center gap-2">
                        {playlist.is_public ? (
                            <IconWorld size={24} className="text-white/80" />
                        ) : (
                            <IconLock size={24} className="text-white/80" />
                        )}
                    </div>
                </div>
                <h1 className="text-3xl font-bold py-2 text-white">{playlist.title}</h1>
                {playlist.description && (
                    <p className="text-white/80 mb-2">{playlist.description}</p>
                )}
                {metadata.subtitle && (
                    <p className="text-white/70 text-sm">{metadata.subtitle}</p>
                )}
                <p className="text-white/60 text-sm mt-2">
                    {musicList.length} {t('tracks')}
                </p>
            </Hero>

            <MusicItemList>
                {musicList.length === 0 && !isFetching ? (
                    <EmptyContent>
                        {t('no_music_in_playlist')}
                    </EmptyContent>
                ) : (
                    <>
                        {musicList.map((item) => (
                            <MusicItem
                                key={item.id}
                                data={item}
                            />
                        ))}
                        {hasMore && (
                            <div ref={triggerRef} className="h-1" />
                        )}
                        {isFetching && (
                            <>
                                {[...Array(8)].map((_, i) => (
                                    <MusicItemSkeleton key={`loading-${i}`} />
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
