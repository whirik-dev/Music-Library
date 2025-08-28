import { useEffect, useState } from "react";
import { useJWTAuth } from "@/hooks/useJWTAuth";
import { IconLoader2 } from "@tabler/icons-react";
import useToggle from "@/utils/useToggle";
import modalStore from "@/stores/modalStore";
import useAuthStore from "@/stores/authStore";

import ModalCard from "@/components/modal/ModalCard";
import FavoriteHeart from "@/components/player/FavoriteHeart";

const ModalPageFavoriteListItem = ({ type, musicData }) => {
    if (type === "head") {
        return (
            <div className="border-b-1 border-zinc-500/50">
                <div className="flex flex-row w-full py-2 text-foreground">
                    <div className="w-2/5 flex justify-start">Title</div>
                    <div className="w-1/5 flex justify-start">Tags</div>
                    <div className="w-1/5 flex justify-start">Duration</div>
                    <div className="ml-auto">Action</div>
                </div>
            </div>
        );
    }

    if (!musicData) {
        return (
            <div className="border-b-1 border-zinc-500/50">
                <div className="flex flex-row w-full py-2 text-foreground/50">
                    <div className="w-2/5 flex justify-start">Loading...</div>
                    <div className="w-1/5 flex justify-start">-</div>
                    <div className="w-1/5 flex justify-start">-</div>
                    <div className="ml-auto">-</div>
                </div>
            </div>
        );
    }

    // metadata에서 필요한 정보 추출
    const getMetadataValue = (type) => {
        const item = musicData.metadata?.find(meta => meta.type === type);
        return item ? item.content : '';
    };

    const title = getMetadataValue('title');
    const duration = parseFloat(getMetadataValue('duration'));

    // keywords에서 태그 추출
    const tags = musicData.keywords?.filter(keyword => keyword.type === 'tag')
        .map(keyword => keyword.content) || [];

    const formatDuration = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="border-b-1 border-zinc-500/50">
            <div className="flex flex-row w-full py-2 text-foreground/50">
                <div className="w-2/5 flex justify-start">
                    <div className="flex flex-col">
                        <span className="text-foreground">{title || 'Untitled'}</span>
                    </div>
                </div>
                <div className="w-1/5 flex justify-start">
                    <div className="flex flex-wrap gap-1">
                        {tags.length > 0 ? (
                            tags.slice(0, 2).map((tag, index) => (
                                <span key={index} className="">
                                    {tag}
                                </span>
                            ))
                        ) : (
                            <span className="text-xs text-foreground/30">No tags</span>
                        )}
                    </div>
                </div>
                <div className="w-1/5 flex justify-start">{formatDuration(duration)}</div>
                <div className="ml-auto">
                    <FavoriteHeart asset_id={musicData.id} />
                </div>
            </div>
        </div>
    );
};

const ModalPageFavoriteList = ({ }) => {
    const { data: session } = useJWTAuth();
    const { favoriteList } = useAuthStore();
    const { toggleExpand, setDepth } = modalStore();
    const [musicDataList, setMusicDataList] = useState({});
    const [loading, setLoading] = useState(true);

    useToggle(
        () => {
            toggleExpand();
            setDepth(2);
        },
        () => {
            toggleExpand();
        }
    );

    // favoriteList가 변경될 때마다 음악 정보를 가져옴
    useEffect(() => {
        const loadMusicData = async () => {
            console.log('FavoriteList - Session status:', session);
            console.log('FavoriteList - favoriteList:', favoriteList);

            if (!session?.user?.hasAuth) {
                console.log('FavoriteList - Not authenticated');
                setLoading(false);
                return;
            }

            if (favoriteList.length === 0) {
                console.log('FavoriteList - No favorites found');
                setLoading(false);
                return;
            }

            setLoading(true);

            try {
                // 서버 API를 통해 즐겨찾기 음악 정보를 가져옴
                const response = await fetch(`/api/user/favorites?ids=${favoriteList.join(',')}`, {
                    credentials: 'include'
                });

                const result = await response.json();

                if (result.success) {
                    const musicData = {};
                    result.data.forEach(item => {
                        musicData[item.id] = item.data;
                    });
                    console.log('FavoriteList - Final music data:', musicData);
                    setMusicDataList(musicData);
                } else {
                    console.error('FavoriteList - API error:', result.message);
                }
            } catch (error) {
                console.error('FavoriteList - Fetch error:', error);
            }

            setLoading(false);
        };

        loadMusicData();
    }, [favoriteList, session]);

    return (
        <>
            <ModalCard
                title="Favorite List"
                desc={`You have ${favoriteList.length} favorite songs`}
            />
            <div className="mx-3">
                <ModalPageFavoriteListItem type="head" />
                {loading ? (
                    <div className="py-8 text-center text-foreground/50 flex items-center justify-center">
                        {/* Loading your favorites... */}
                        <IconLoader2 className="animate-spin" />
                    </div>
                ) : favoriteList.length === 0 ? (
                    <div className="py-8 text-center text-foreground/50">
                        No favorite songs yet
                    </div>
                ) : (
                    favoriteList.map((musicId, index) => (
                        <ModalPageFavoriteListItem
                            key={index}
                            musicData={musicDataList[musicId]}
                        />
                    ))
                )}
            </div>
        </>
    )
}
export default ModalPageFavoriteList;