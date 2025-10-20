"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { IconArrowLeft, IconLock, IconWorld, IconMusic } from '@tabler/icons-react';
import Image from 'next/image';

import useMusicListStore from "@/stores/useMusicListStore";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";

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
    const thumbnailUrl = metadata.thumbnail || playlist.thumbnail;
    const tags = metadata.tags || [];

    return (
        <div className="min-h-screen relative">
            {/* Playlist Metadata Header */}
            <div className={`relative h-[50vh] min-h-[400px] ${bgClass} overflow-hidden`}>
                {/* Background Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80" />

                {/* Back Button */}
                <div className="absolute top-4 left-4 z-10">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-colors"
                    >
                        <IconArrowLeft size={24} className="text-white" />
                    </button>
                </div>

                {/* Content Container */}
                <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-end pb-6 sm:pb-8">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-end w-full">
                        {/* Thumbnail */}
                        <div className="flex-shrink-0">
                            <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-lg shadow-2xl overflow-hidden bg-background/10 backdrop-blur-sm">
                                {thumbnailUrl ? (
                                    <Image
                                        src={thumbnailUrl}
                                        alt={playlist.title}
                                        width={224}
                                        height={224}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-foreground/5 to-foreground/10">
                                        <IconMusic size={60} className="text-foreground/30 sm:w-20 sm:h-20" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className="flex-1 pb-2 text-center sm:text-left w-full">
                            {/* Privacy Badge */}
                            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2 sm:mb-3">
                                {playlist.is_public ? (
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                                        <IconWorld size={14} className="text-white sm:w-4 sm:h-4" />
                                        <span className="text-xs font-medium text-white">{t('public')}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                                        <IconLock size={14} className="text-white sm:w-4 sm:h-4" />
                                        <span className="text-xs font-medium text-white">{t('private')}</span>
                                    </div>
                                )}
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 line-clamp-2">
                                {playlist.title}
                            </h1>

                            {/* Subtitle */}
                            {metadata.subtitle && (
                                <p className="text-base sm:text-lg md:text-xl text-white/90 mb-2 sm:mb-3 line-clamp-1">
                                    {metadata.subtitle}
                                </p>
                            )}

                            {/* Description */}
                            {playlist.description && (
                                <p className="text-xs sm:text-sm text-white/70 mb-2 sm:mb-3 line-clamp-2 max-w-2xl mx-auto sm:mx-0">
                                    {playlist.description}
                                </p>
                            )}

                            {/* Tags */}
                            {tags.length > 0 && (
                                <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                                    {tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs text-white/80"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Track Count */}
                            <p className="text-xs sm:text-sm text-white/60 font-medium">
                                {musicList.length} {t('tracks')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

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
