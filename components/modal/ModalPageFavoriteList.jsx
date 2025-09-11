import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from 'next-intl';
import useToggle from "@/utils/useToggle";
import modalStore from "@/stores/modalStore";
import useAuthStore from "@/stores/authStore";

import ModalCard from "@/components/modal/ModalCard";
import FavoriteHeart from "@/components/player/FavoriteHeart";

const ModalPageFavoriteListItem = ({ type, musicData }) => {
    const t = useTranslations('modal');
    
    if (type === "head") {
        return (
            <div className="border-b-1 border-zinc-500/50">
                <div className="flex flex-row w-full py-2 text-foreground">
                    <div className="w-2/5 flex justify-start">{t('title')}</div>
                    <div className="w-1/5 flex justify-start">{t('tags')}</div>
                    <div className="w-1/5 flex justify-start">{t('duration')}</div>
                    <div className="ml-auto">{t('action')}</div>
                </div>
            </div>
        );
    }

    if (!musicData) {
        return (
            <div className="border-b-1 border-zinc-500/50">
                <div className="flex flex-row w-full py-2 text-foreground/50">
                    <div className="w-2/5 flex justify-start">{t('loading')}</div>
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
    const subtitle = getMetadataValue('subtitle');
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
                        <span className="text-foreground">{title || t('untitled')}</span>
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
                            <span className="text-xs text-foreground/30">{t('no_tags')}</span>
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
    const t = useTranslations('modal');
    const tError = useTranslations('errors');
    const { data: session } = useSession();
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

    // 음악 정보를 가져오는 함수
    const fetchMusicData = async (musicId) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/music/${musicId}`, {
                headers: {
                    'Authorization': `Bearer ${session?.user?.ssid}`
                }
            });
            const result = await response.json();

            if (result.success) {
                return result.data;
            }
            return null;
        } catch (error) {
            console.error(tError('fetch_music_data_error', { musicId }), error);
            return null;
        }
    };

    // favoriteList가 변경될 때마다 음악 정보를 가져옴
    useEffect(() => {
        const loadMusicData = async () => {
            if (!session?.user?.ssid || favoriteList.length === 0) {
                setLoading(false);
                return;
            }

            setLoading(true);
            const musicData = {};

            // 모든 즐겨찾기 음악의 정보를 병렬로 가져옴
            const promises = favoriteList.map(async (musicId) => {
                const data = await fetchMusicData(musicId);
                if (data) {
                    musicData[musicId] = data;
                }
            });

            await Promise.all(promises);
            setMusicDataList(musicData);
            setLoading(false);
        };

        loadMusicData();
    }, [favoriteList, session]);

    return (
        <>
            <ModalCard
                title={t('favorite_list')}
                desc={t('you_have_favorites', { count: favoriteList.length })}
            />
            <div className="mx-3">
                <ModalPageFavoriteListItem type="head" />
                {loading ? (
                    <div className="py-8 text-center text-foreground/50">
                        {t('loading_favorites')}
                    </div>
                ) : favoriteList.length === 0 ? (
                    <div className="py-8 text-center text-foreground/50">
                        {t('no_favorite_songs')}
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