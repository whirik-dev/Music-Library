"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { IconPlus, IconLock, IconWorld } from '@tabler/icons-react';
import Hero from "@/components/ui/Hero";
import Footer from "@/components/ui/Footer";

const PlaylistCard = ({ playlist, onClick }) => {
    const metadata = playlist.metadata || {};
    const bgClass = metadata.bgTailwind || 'bg-gradient-to-br from-purple-500 to-pink-500';

    return (
        <div
            onClick={onClick}
            className={`aspect-square p-6 rounded-lg cursor-pointer hover:scale-105 transition-transform flex flex-col justify-between ${bgClass}`}
        >
            <div className="flex justify-between items-start">
                <div className="text-white/80 text-sm">
                    {playlist.music_count || 0} tracks
                </div>
                {playlist.is_public ? (
                    <IconWorld size={20} className="text-white/80" />
                ) : (
                    <IconLock size={20} className="text-white/80" />
                )}
            </div>
            <div>
                <h3 className="text-white text-xl font-bold mb-1">{playlist.title}</h3>
                {metadata.subtitle && (
                    <p className="text-white/70 text-sm">{metadata.subtitle}</p>
                )}
            </div>
        </div>
    );
};

const CreatePlaylistCard = ({ onClick }) => {
    const t = useTranslations('pages.playlist');

    return (
        <div
            onClick={onClick}
            className="aspect-square p-6 rounded-lg cursor-pointer hover:scale-105 transition-transform flex flex-col items-center justify-center bg-foreground/10 border-2 border-dashed border-foreground/30 hover:border-foreground/50"
        >
            <IconPlus size={48} className="text-foreground/50 mb-3" />
            <p className="text-foreground/70 font-semibold">{t('create_playlist')}</p>
        </div>
    );
};

export default function Playlist() {
    const t = useTranslations('pages.playlist');
    const router = useRouter();
    const { data: session } = useSession();
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPlaylist, setNewPlaylist] = useState({ title: '', description: '', is_public: false });

    useEffect(() => {
        fetchPlaylists();
    }, [session]);

    const fetchPlaylists = async () => {
        if (!session?.user?.ssid) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/playlists`, {
                headers: {
                    'Authorization': `Bearer ${session.user.ssid}`
                }
            });

            const result = await response.json();
            if (result.success && result.data) {
                setPlaylists(result.data.items || []);
            } else {
                console.error('Failed to fetch playlists:', result.message || 'Unknown error');
            }
        } catch (error) {
            console.error('Failed to fetch playlists:', error);
        } finally {
            setLoading(false);
        }
    };

    const createPlaylist = async () => {
        if (!newPlaylist.title.trim()) {
            alert(t('enter_title'));
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/playlist`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.user.ssid}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newPlaylist)
            });

            const result = await response.json();
            if (result.success) {
                setShowCreateModal(false);
                setNewPlaylist({ title: '', description: '', is_public: false });
                fetchPlaylists();
            } else {
                alert(result.message || t('create_failed'));
            }
        } catch (error) {
            console.error('Failed to create playlist:', error);
            alert(t('create_failed'));
        }
    };

    const handlePlaylistClick = (playlistId) => {
        router.push(`/playlist/${playlistId}`);
    };

    if (!session) {
        return (
            <div className="min-h-screen relative flex items-center justify-center">
                <p className="text-foreground/70">{t('login_required')}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative">
            {/* <Hero className="bg-gradient-to-r from-0% via-50% from-blue-400 via-purple-400 to-pink-400 bg-no-repeat">
                <h1 className="text-3xl font-bold py-5 text-white">{t('my_playlists')}</h1>
            </Hero> */}

            <div className="container mx-auto px-5 py-10">
                {loading ? (
                    <div className="text-center py-10 text-foreground/50">{t('loading')}</div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {/* <CreatePlaylistCard onClick={() => setShowCreateModal(true)} /> */}
                        {playlists.map((playlist) => (
                            <PlaylistCard
                                key={playlist.id}
                                playlist={playlist}
                                onClick={() => handlePlaylistClick(playlist.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Create Playlist Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
                    <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-xl font-bold mb-4 text-foreground">{t('create_new_playlist')}</h2>
                        <input
                            type="text"
                            placeholder={t('playlist_title')}
                            value={newPlaylist.title}
                            onChange={(e) => setNewPlaylist({ ...newPlaylist, title: e.target.value })}
                            className="w-full p-3 mb-3 rounded bg-foreground/10 text-foreground border border-foreground/20"
                        />
                        <textarea
                            placeholder={t('playlist_description')}
                            value={newPlaylist.description}
                            onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                            className="w-full p-3 mb-3 rounded bg-foreground/10 text-foreground border border-foreground/20 h-24"
                        />
                        <label className="flex items-center gap-2 mb-4 text-foreground">
                            <input
                                type="checkbox"
                                checked={newPlaylist.is_public}
                                onChange={(e) => setNewPlaylist({ ...newPlaylist, is_public: e.target.checked })}
                            />
                            {t('make_public')}
                        </label>
                        <div className="flex gap-3">
                            <button
                                onClick={createPlaylist}
                                className="flex-1 px-4 py-2 bg-foreground text-background rounded hover:opacity-80"
                            >
                                {t('create')}
                            </button>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 px-4 py-2 bg-foreground/20 text-foreground rounded hover:bg-foreground/30"
                            >
                                {t('cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
