import { IconScissors, IconPlayerPlayFilled, IconPlayerPauseFilled, IconPlayerStopFilled, IconPlayerTrackNextFilled, IconLoader2 } from "@tabler/icons-react"

import useMusicItemStore from "@/stores/useMusicItemStore";
import useMusicListStore from "@/stores/useMusicListStore";

import DurationMeter from "@/components/player/DurationMeter";
import WaveProgress from "@/components/player/WaveProgress";
import WaveProgressSkeleton from "@/components/skeleton/WaveProgressSkeleton";
import FavoriteHeart from "@/components/player/FavoriteHeart";
import DownloadBtn from "@/components/player/DownloadBtn";
import TailoredBtn from "@/components/player/TailoredBtn";
import VolumeBar from "@/components/player/VolumeBar";

const Player = ({}) => {
    const { status, playingAlbumart, playingMetadata, playingTrackId, playingFiles, play, resume, pause, stop } = useMusicItemStore();
    const { musicList } = useMusicListStore();

    const nextMusic = () => {
        if (musicList.length > 0 && playingTrackId) {
            const currentIndex = musicList.findIndex(item => item.id === playingTrackId);
            play(musicList[currentIndex + 1].id);
        }
    }

    return (
        <div className={`fixed bottom-0 left-0 w-full h-20 backdrop-blur-2xl transition-transform duration-300 shadow-xl px-3 lg:px-10
                        ${playingTrackId != null ? "translate-y-0" : "translate-y-full"} `}
        >
            <div className="flex flex-row h-20 items-center gap-5 text-sm">
                {/* 앨범커버 */}
                <div className="size-12">
                    {
                        // 썸네일이 있을 경우
                        playingFiles?.includes('thumbnail') ? (
                            <div className="rounded-sm overflow-hidden">
                                <img
                                    src={`https://asset.probgm.com/${playingTrackId}?r=thumbnail`}
                                    alt="albumart image"
                                />
                            </div>
                        ) : (
                            <div className="w-full h-full bg-foreground/10 rounded-sm" />
                        )
                    }
                </div>

                {/* 제목 */}
                <div className="flex flex-col w-auto md:w-36 xl:w-48">
                    <div className="font-bold">{status != null ? playingMetadata.find(item => item.type === "title")?.content : (<span className="text-white/30">Now Stanby</span>)}</div>
                    <div className="hidden md:block text-foreground/40">
                        {status != null ? playingMetadata.find(item => item.type === "subtitle")?.content 
                                        : (<span className="text-foreground/30">Sub Title</span>)}
                    </div>
                </div>

                {/* 재생정지버튼 */}
                <div className="flex flex-row items-center gap-1">
                    {status != null ? (
                        <IconPlayerStopFilled size="18" className="cursor-pointer hover:opacity-70" onClick={() => {stop();}} />
                    ) : (
                        <div className="size-7"></div>
                    )} 

                    <div className="size-12 bg-zinc-800 rounded-full flex items-center justify-center">
                        {status === "loading" ? (
                            <>
                                <IconLoader2 size="24" className="animate-spin" />
                            </>
                        ) : (
                            <>
                                {status === "playing" ? (
                                    <IconPlayerPauseFilled size="24" className="cursor-pointer hover:opacity-70" onClick={() => {status == "playing" && pause()}} />
                                ) : (
                                    <IconPlayerPlayFilled size="28" className="cursor-pointer hover:opacity-70" onClick={() => {resume()}} />
                                )}

                            </>
                        )}
                    </div>

                    {status != null ? (
                        <IconPlayerTrackNextFilled size="18" className="cursor-pointer hover:opacity-70" onClick={() => nextMusic()} />
                    ) : (
                        <div className="size-7"></div>
                    )} 
                </div>

                <div className="min-w-[68px] text-center">
                    {status !== null && (
                    <DurationMeter id={playingTrackId} metadata={playingMetadata} />
                    )}
                </div>

                {/* 웨이브 파형 */}
                <div className="hidden xl:block flex-1 h-12">
                    {status != 'loading' ? (
                        <WaveProgress id={playingTrackId} metadata={playingMetadata}/>
                    ) : (
                        <WaveProgressSkeleton />
                    )}
                </div>
                
                {/* 볼륨바 */}
                <div className="">
                    <VolumeBar />
                </div>
                {/* 기능아이콘 */}
                <div className="flex flex-row gap-3 items-center">
                    <DownloadBtn asset_id={playingTrackId}/>
                    <FavoriteHeart asset_id={playingTrackId}/>
                    <TailoredBtn id={playingTrackId}/>
                </div>
            </div>
        </div>
    )
}
export default Player;