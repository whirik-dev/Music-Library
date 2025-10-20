"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { IconHeart, IconArrowRight, IconLock, IconWorld } from '@tabler/icons-react';
import useAuthStore from '@/stores/authStore';

const PlaylistItem = ({ playlist, onClick, isFavorite = false }) => {
    const metadata = playlist.metadata || {};
    const bgClass = metadata.bgTailwind || 'bg-gradient-to-br from-purple-500 to-pink-500';
    const musicCount = playlist.music_count || 0;

    return (
        <div
            onClick={onClick}
            className="flex-shrink-0 w-44 sm:w-52 cursor-pointer group"
        >
            <div className={`aspect-square p-4 sm:p-5 rounded-lg group-hover:scale-105 transition-transform flex flex-col justify-between ${bgClass}`}>
                {/* Top Section - Track Count & Icon */}
                <div className="flex justify-between items-start">
                    {!isFavorite && (
                        <div className="text-white/80 text-xs sm:text-sm">
                            {musicCount} tracks
                        </div>
                    )}
                    {isFavorite ? (
                        <IconHeart size={20} className="text-white ml-auto" fill="currentColor" />
                    ) : playlist.is_public ? (
                        <IconWorld size={20} className="text-white/80" />
                    ) : (
                        <IconLock size={20} className="text-white/80" />
                    )}
                </div>

                {/* Bottom Section - Title & Subtitle */}
                <div>
                    <h3 className="text-white text-base sm:text-lg font-bold mb-1 line-clamp-2">
                        {playlist.title}
                    </h3>
                    {metadata.subtitle && (
                        <p className="text-white/70 text-xs sm:text-sm line-clamp-1">
                            {metadata.subtitle}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

const MoreButton = ({ onClick }) => {
    const t = useTranslations('ui');

    return (
        <div
            onClick={onClick}
            className="flex-shrink-0 w-44 sm:w-52 cursor-pointer group"
        >
            <div className="aspect-square p-4 sm:p-5 rounded-lg group-hover:scale-105 transition-transform 
                            flex flex-col items-center justify-center 
                            bg-foreground/10 border-2 border-dashed border-foreground/30 
                            group-hover:border-foreground/50">
                <IconArrowRight size={40} className="text-foreground/40 group-hover:text-foreground/60 transition-colors mb-2" />
                <span className="text-sm font-semibold text-foreground/60 group-hover:text-foreground/80 transition-colors">
                    {t('more')}
                </span>
            </div>
        </div>
    );
};

const Playlists = () => {
    const router = useRouter();
    const { data: session } = useSession();
    const { favoriteId } = useAuthStore();
    const [publicPlaylists, setPublicPlaylists] = useState([]);
    const [favoritePlaylist, setFavoritePlaylist] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlaylists();
    }, [session, favoriteId]);

    const fetchPlaylists = async () => {
        try {
            // Fetch public playlists
            const publicResponse = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/playlists/public?page=1&limit=10`
            );
            const publicResult = await publicResponse.json();

            if (publicResult.success && publicResult.data) {
                setPublicPlaylists(publicResult.data.items || []);
            }

            // Fetch favorite playlist if user is logged in and favoriteId exists
            if (session?.user?.ssid && favoriteId) {
                try {
                    // favoriteId로 플레이리스트 정보 가져오기
                    const playlistResponse = await fetch(
                        `${process.env.NEXT_PUBLIC_BACKEND_URL}/playlist/${favoriteId}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${session.user.ssid}`
                            }
                        }
                    );

                    if (!playlistResponse.ok) {
                        console.error('Failed to fetch favorite playlist:', playlistResponse.status);
                        return;
                    }

                    const playlistResult = await playlistResponse.json();

                    if (playlistResult.success && playlistResult.data) {
                        setFavoritePlaylist(playlistResult.data);
                    }
                } catch (error) {
                    console.error('Failed to fetch favorite playlist:', error);
                }
            }
        } catch (error) {
            console.error('Failed to fetch playlists:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlaylistClick = (playlistId) => {
        router.push(`/playlist/${playlistId}`);
    };

    const handleMoreClick = () => {
        router.push('/playlist');
    };

    if (loading) {
        return null;
    }

    const hasPlaylists = favoritePlaylist || publicPlaylists.length > 0;

    if (!hasPlaylists) {
        return null;
    }

    return (
        <div className="py-6 px-4 sm:px-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Editor's Pick</h2>
            </div>

            <div className="relative">
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {/* Favorite Playlist First */}
                    {favoritePlaylist && (
                        <PlaylistItem
                            key={`favorite-${favoritePlaylist.id}`}
                            playlist={favoritePlaylist}
                            onClick={() => handlePlaylistClick(favoritePlaylist.id)}
                            isFavorite={true}
                        />
                    )}

                    {/* Public Playlists */}
                    {publicPlaylists.map((playlist) => (
                        <PlaylistItem
                            key={playlist.id}
                            playlist={playlist}
                            onClick={() => handlePlaylistClick(playlist.id)}
                        />
                    ))}

                    {/* More Button */}
                    <MoreButton onClick={handleMoreClick} />
                </div>
            </div>
        </div>
    );
};

export default Playlists;