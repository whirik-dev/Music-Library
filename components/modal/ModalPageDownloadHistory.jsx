import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from 'next-intl';
import useToggle from "@/utils/useToggle";
import modalStore from "@/stores/modalStore";
import useAuthStore from "@/stores/authStore";

import ModalCard from "@/components/modal/ModalCard";
import DownloadBtn from "@/components/player/DownloadBtn";

const ModalPageDownloadHistoryItem = ({ type, musicData }) => {
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
                        {/* {subtitle && (
                            <span className="text-xs text-foreground/30">{subtitle}</span>
                        )} */}
                    </div>
                </div>
                <div className="w-1/5 flex justify-start">
                    <div className="flex flex-wrap gap-1">
                        {tags.length > 0 ? (
                            tags.slice(0, 2).map((tag, index) => (
                                <span key={index} className="text-xs">
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
                    <DownloadBtn asset_id={musicData.id} />
                </div>
            </div>
        </div>
    );
};

const ModalPageDownloadHistory = ({ }) => {
    const t = useTranslations('modal');
    const tError = useTranslations('errors');
    const { data: session } = useSession();
    const { downloadHistory } = useAuthStore();
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

    // URL에서 음악 ID 추출하는 함수
    const extractMusicIdFromUrl = (url) => {
        console.log('Trying to extract ID from URL:', url);

        // 다양한 UUID 패턴을 시도
        const patterns = [
            /\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i, // 표준 UUID with dashes
            /\/([a-f0-9]{32})/i, // UUID without dashes
            /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i, // UUID anywhere in string
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                console.log('Found ID:', match[1]);
                return match[1];
            }
        }

        console.log('No ID found in URL');
        return null;
    };

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

    // downloadHistory가 변경될 때마다 음악 정보를 가져옴
    useEffect(() => {
        const loadMusicData = async () => {
            console.log('Download History:', downloadHistory);
            console.log('Session:', session?.user?.ssid);

            if (!session?.user?.ssid) {
                console.log('No session found');
                setLoading(false);
                return;
            }

            if (downloadHistory.length === 0) {
                console.log('No download history found');
                setLoading(false);
                return;
            }

            setLoading(true);
            const musicData = {};

            // URL에서 음악 ID를 추출하고 음악 정보를 가져옴
            const promises = downloadHistory.map(async (url) => {
                console.log('Processing URL:', url);
                const musicId = extractMusicIdFromUrl(url);
                console.log('Extracted Music ID:', musicId);

                if (musicId) {
                    const data = await fetchMusicData(musicId);
                    console.log('Fetched data for', musicId, ':', data);
                    if (data) {
                        musicData[musicId] = data;
                    }
                }
            });

            await Promise.all(promises);
            console.log('Final music data:', musicData);
            setMusicDataList(musicData);
            setLoading(false);
        };

        loadMusicData();
    }, [downloadHistory, session]);

    // 유니크한 음악 ID 목록 생성
    const uniqueMusicIds = [...new Set(
        downloadHistory
            .map(url => extractMusicIdFromUrl(url))
            .filter(id => id !== null)
    )];

    return (
        <>
            <ModalCard
                title={t('download_history')}
                desc={t('you_have_downloaded', { count: uniqueMusicIds.length })}
            />
            <div className="mx-3">
                <ModalPageDownloadHistoryItem type="head" />
                {loading ? (
                    <div className="py-8 text-center text-foreground/50">
                        {t('loading_download_history')}
                    </div>
                ) : uniqueMusicIds.length === 0 ? (
                    <div className="py-8 text-center text-foreground/50">
                        {t('no_downloads')}
                    </div>
                ) : (
                    uniqueMusicIds.map((musicId, index) => (
                        <ModalPageDownloadHistoryItem
                            key={index}
                            musicData={musicDataList[musicId]}
                        />
                    ))
                )}
            </div>
        </>
    )
}
export default ModalPageDownloadHistory;