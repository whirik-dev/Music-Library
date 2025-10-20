"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const PlaylistItem = ({ playlist, onClick }) => {
    const metadata = playlist.metadata || {};
    const bgClass = metadata.bgTailwind || 'bg-gradient-to-br from-purple-500 to-pink-500';
    
    return (
        <div
            onClick={onClick}
            className={`min-w-[230px] w-[230px] p-4 text-right aspect-square flex text-2xl font-bold items-end justify-end 
                        rounded-md cursor-pointer hover:opacity-90 hover:rounded-2xl transition-all duration-300
                        ${bgClass}`}
        >
            <div className="text-white">
                {playlist.title}
            </div>
        </div>
    );
};

const Playlists = () => {
    const router = useRouter();
    const [publicPlaylists, setPublicPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPublicPlaylists();
    }, []);

    const fetchPublicPlaylists = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/playlists/public?page=1&limit=10`
            );

            const result = await response.json();
            if (result.success && result.data) {
                setPublicPlaylists(result.data.items || []);
            } else {
                console.error('Failed to fetch public playlists:', result.message || 'Unknown error');
            }
        } catch (error) {
            console.error('Failed to fetch public playlists:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlaylistClick = (playlistId) => {
        router.push(`/playlist/${playlistId}`);
    };

    if (loading || publicPlaylists.length === 0) {
        return null;
    }

    return (
        <div className="p-3 flex flex-col gap-2">
            <div className="text-2xl">
                Editor's Pick
            </div>
            <div className="flex flex-row gap-3 overflow-x-scroll">
                {publicPlaylists.map((playlist) => (
                    <PlaylistItem
                        key={playlist.id}
                        playlist={playlist}
                        onClick={() => handlePlaylistClick(playlist.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Playlists;