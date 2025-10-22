import { useState, useEffect } from "react";
import { IconLoader2 } from "@tabler/icons-react";

const PlayerThumbnail = ({ playingTrackId, playingFiles }) => {
    const [thumbnailError, setThumbnailError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    // 트랙이 바뀔 때마다 썸네일 검사
    useEffect(() => {
        setThumbnailError(false);
        setIsLoading(false);
        setImageLoaded(false);

        if (playingFiles?.includes('thumbnail') && playingTrackId) {
            setIsLoading(true);

            // 이미지 존재 여부 미리 검사
            const img = new Image();
            const imageUrl = `https://${process.env.NEXT_PUBLIC_ASSET_SERVER}/${playingTrackId}?r=thumbnail`;

            img.onload = () => {
                setIsLoading(false);
                setImageLoaded(true);
            };

            img.onerror = () => {
                console.warn(`Thumbnail not found for ID: ${playingTrackId}`);
                setThumbnailError(true);
                setIsLoading(false);
            };

            img.src = imageUrl;
        }
    }, [playingTrackId, playingFiles]);

    return (
        <div className="size-12 relative">
            {
                // 썸네일 로딩 중
                playingFiles?.includes('thumbnail') && isLoading ? (
                    <div className="w-full h-full bg-foreground/5 rounded-sm flex items-center justify-center">
                        <IconLoader2 size={20} className="animate-spin text-zinc-500" />
                    </div>
                ) : playingFiles?.includes('thumbnail') && thumbnailError ? (
                    // 썸네일이 있지만 404 에러가 발생한 경우
                    <div className="w-full h-full bg-foreground/10 rounded-sm" />
                ) : playingFiles?.includes('thumbnail') && !thumbnailError ? (
                    // 썸네일이 있고 로딩 완료된 경우
                    <div className={`rounded-sm overflow-hidden transition-transform duration-300 ${
                        imageLoaded ? 'scale-100' : 'scale-0'
                    }`}>
                        <img
                            src={`https://${process.env.NEXT_PUBLIC_ASSET_SERVER}/${playingTrackId}?r=thumbnail`}
                            alt="albumart image"
                        />
                    </div>
                ) : (
                    // 썸네일이 아예 없는 경우
                    <div className="w-full h-full bg-foreground/10 rounded-sm" />
                )
            }
        </div>
    );
};

export default PlayerThumbnail;