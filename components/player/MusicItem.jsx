"use client";

import { IconPlayerPlayFilled, IconPlayerStopFilled, IconLoader2 } from "@tabler/icons-react"
import { useTranslations } from 'next-intl';

import useMusicItemStore from "@/stores/useMusicItemStore";

import Term from "@/components/player/MusicItemTerm"
import DurationMeter from "@/components/player/DurationMeter";
import WaveProgress from "@/components/player/WaveProgress";
import FavoriteHeart from "@/components/player/FavoriteHeart";
import DownloadBtn from "@/components/player/DownloadBtn";
import TailoredBtn from "@/components/player/TailoredBtn";
import PlayerThumbnail from "@/components/player/PlayerThumbnail";

// a.k.a. MI 
const MusicItem = ({ data }) => { // fid, metadata, keywords, files,
    const t = useTranslations('player');
    const { status, playingTrackId, play, stop } = useMusicItemStore();

    // 이 아이템이 재생중인지 아닌지 따져봄
    const isActive = playingTrackId === data.id && status != null;

    const title = data.metadata.find(item => item.type === "title")?.content;
    const subtitle = data.metadata.find(item => item.type === "subtitle")?.content;

    // const waveform = file.find(item => item.type === "waveform")?.path;

    return (
        <div className="relative px-0 text-sm md:text-md"
        >
            <div className={`px-4 lg:px-8 py-5 flex flex-col rounded-sm
                           ${isActive ? 'bg-zinc-800/60' : 'bg-zinc-900 hover:bg-zinc-800/40'} 
                          `}
            >
                <div className="flex flex-row items-center gap-3">
                    {/* 재생상태 */}
                    <div className="cursor-pointer">
                        {status === 'loading' && isActive ? (
                            <>
                                <IconLoader2 size="18" className="animate-spin" />
                            </>
                        ) : (
                            <>
                                {status === "playing" && isActive ? (
                                    // 재생상태
                                    <IconPlayerStopFilled size="18" onClick={() => { stop() }} />
                                ) : status === "pause" ? (
                                    // 일시정지상태
                                    <IconPlayerPlayFilled size="18" onClick={() => { play(fid) }} />
                                ) : (
                                    // 정지상태
                                    <IconPlayerPlayFilled size="18"
                                        onClick={() => { play(data.id) }}
                                    />
                                )}
                            </>
                        )}
                    </div>
                    {/* translate를 위한 flex wrapper */}
                    <div className={`flex-1 flex flex-row items-center gap-3 transition-all duration-300 ${isActive && 'ml-0'}`}>
                        {/* 디버깅용 코드 */}
                        {/* <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-teal-400 text-black text-xs">
                            {file.find(item => item.type === "origin")?.path}
                        </div> */}

                        {/* 커버사진 */}
                        <div className="">
                            <PlayerThumbnail
                                playingTrackId={data.id}
                                playingFiles={data.files}
                            />
                        </div>

                        {/* 제목과 부제목 */}
                        <div className={`flex flex-col w-auto md:w-48 xl:w-48 2xl:w-72 select-none`}>
                            <div className="font-bold text-foreground">{title}</div>
                            <div className="hidden md:block text-foreground/40">
                                {subtitle}
                            </div>
                        </div>

                        {/* 태그 */}
                        <div className="hidden md:flex flex-row gap-1 flex-wrap w-auto xl:w-48 2xl:w-72">
                            {data.keywords.map((item, index) => {
                                if (item.type != 'tag') return;
                                return <Term key={index} name={item.content} />
                            })}
                        </div>

                        {/* 시간 */}
                        <div className="min-w-18 text-center ml-auto text-white/40">
                            <DurationMeter id={data.id} metadata={data.metadata} />
                        </div>

                        {/* 웨이브파형 */}
                        <div className="hidden xl:block flex-1 h-12">
                            <WaveProgress id={data.id} metadata={data.metadata} />
                        </div>
                    </div>
                    {/* 기능아이콘 */}
                    <div className="ml-3 flex flex-row gap-3 items-center">
                        {/* <DownloadBtn href={file.find(item => item.type === "origin")?.path}/> */}
                        <DownloadBtn asset_id={data.id} />
                        <FavoriteHeart asset_id={data.id} />
                        <TailoredBtn id={data.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MusicItem;