import { useEffect, useState } from "react";
import { useJWTAuth } from "@/hooks/useJWTAuth";
import { IconLoader2 } from "@tabler/icons-react";
import useToggle from "@/utils/useToggle";
import modalStore from "@/stores/modalStore";
import useAuthStore from "@/stores/authStore";

import ModalCard from "@/components/modal/ModalCard";
import DownloadBtn from "@/components/player/DownloadBtn";

const ModalPageDownloadHistoryItem = ({ type, musicData }) => {
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
                            <span className="text-xs text-foreground/30">No tags</span>
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
    const { data: session } = useJWTAuth();
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

    // downloadHistory가 변경될 때마다 음악 정보를 가져옴
    useEffect(() => {
        const loadMusicData = async () => {
            console.log('DownloadHistory - Session status:', session);
            console.log('DownloadHistory - downloadHistory:', downloadHistory);

            if (!session?.user?.hasAuth) {
                console.log('DownloadHistory - Not authenticated');
                setLoading(false);
                return;
            }

            if (downloadHistory.length === 0) {
                console.log('DownloadHistory - No download history found');
                setLoading(false);
                return;
            }

            setLoading(true);

            try {
                // 서버 API를 통해 다운로드 히스토리 음악 정보를 가져옴
                const encodedUrls = downloadHistory.map(url => encodeURIComponent(url)).join(',');
                const response = await fetch(`/api/user/download-history?urls=${encodedUrls}`, {
                    credentials: 'include'
                });
                
                const result = await response.json();
                
                if (result.success) {
                    const musicData = {};
                    result.data.forEach(item => {
                        musicData[item.id] = item.data;
                    });
                    console.log('DownloadHistory - Final music data:', musicData);
                    setMusicDataList(musicData);
                } else {
                    console.error('DownloadHistory - API error:', result.message);
                }
            } catch (error) {
                console.error('DownloadHistory - Fetch error:', error);
            }

            setLoading(false);
        };

        loadMusicData();
    }, [downloadHistory, session]);

    // URL에서 음악 ID 추출하는 함수 (클라이언트에서 표시용)
    const extractMusicIdFromUrl = (url) => {
        const patterns = [
            /\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i,
            /\/([a-f0-9]{32})/i,
            /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i,
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return match[1];
            }
        }
        return null;
    };

    // 유니크한 음악 ID 목록 생성 (표시용)
    const uniqueMusicIds = [...new Set(
        downloadHistory
            .map(url => extractMusicIdFromUrl(url))
            .filter(id => id !== null)
    )];

    return (
        <>
            <ModalCard
                title="Download History"
                desc={`You have downloaded ${uniqueMusicIds.length} songs`}
            />
            <div className="mx-3">
                <ModalPageDownloadHistoryItem type="head" />
                {loading ? (
                    <div className="py-8 text-center text-foreground/50 flex items-center justify-center">
                        {/* Loading your download history... */}
                        <IconLoader2 className="animate-spin" />
                    </div>
                ) : uniqueMusicIds.length === 0 ? (
                    <div className="py-8 text-center text-foreground/50">
                        No downloads yet
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