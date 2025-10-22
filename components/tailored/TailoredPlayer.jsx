"use client";

import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { IconPlayerPlayFilled, IconPlayerPauseFilled } from "@tabler/icons-react";
import WaveProgress from "@/components/player/WaveProgress";
import TailoredPlayerSkeleton from "@/components/skeleton/TailoredPlayerSkeleton";
import useMusicItemStore from "@/stores/useMusicItemStore";
import useMusicListStore from "@/stores/useMusicListStore";

// TODO: 차후에 테일러드 창에서 무언가 재생될경우, 다른 플레이어에서는 보이지 않게 하는 조치 필요 -> 집중력이 흐트러짐.
// 이 부분은 사실 플레이어 상태를 공유함으로써 생기는 현상
// 그렇다고 플레이어 상태를 또 만드는거보다 그냥 시각적으로만 안보이게 하면 좋을듯.
const TailoredPlayer = ({ id }) => {
  const t = useTranslations('errors');
  const { status, playingTrackId, play, pause, resume } = useMusicItemStore();
  const { musicList: storeMusicList } = useMusicListStore();
  const [state, setState] = useState({
    trackData: null,
    isLoading: false,
    error: null,
  });

  // 이 플레이어가 재생 중인지 확인
  const isPlaying = playingTrackId === id && status === 'playing';
  const isPaused = playingTrackId === id && status === 'paused';

  const loadItem = async (id) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/music/${id}`);
      if (!response.ok) {
        throw new Error(t('http_error', { status: response.status }));
      }
      const data = await response.json();
      setState((prev) => ({ ...prev, trackData: data, isLoading: false }));
    } catch (error) {
      setState((prev) => ({ ...prev, error: error.message, isLoading: false }));
      console.error(t('failed_to_load_item'), error);
    }
  };

  useEffect(() => {
    if (id) {
      loadItem(id);
    }
  }, [id]);

  const { trackData, isLoading, error } = state;

  if (isLoading) return <TailoredPlayerSkeleton />;
  if (error) return <div>{t('error_no_data')}: {error}</div>;
  if (!trackData) return <div>{t('error_no_data')}</div>;

  const handlePlayPause = async (e) => {
    e?.stopPropagation();
    
    if (isPlaying) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      // 정지 상태에서 재생 시작
      if (!trackData?.data) {
        console.error('Music data not loaded');
        return;
      }

      try {
        // musicList store에 트랙이 있는지 확인
        const trackInStore = storeMusicList.find(track => track.id === id);
        
        if (trackInStore) {
          // store에 있으면 바로 재생
          await play(id);
        } else {
          // store에 없으면 임시로 추가하고 재생
          const newTrackData = {
            id: id,
            metadata: trackData.data.metadata,
            files: trackData.data.files || []
          };
          
          // musicList store에 임시 추가
          useMusicListStore.setState((prev) => ({
            musicList: [...prev.musicList, newTrackData]
          }));
          
          // 재생
          await play(id);
        }
      } catch (error) {
        console.error('Failed to play track:', error);
      }
    }
  };

  return (
    <div className="tailored-player px-3 pt-3 pb-0 m-2 bg-zinc-800/50 rounded-lg">
        <div className="flex flex-row gap-3 items-center">
            {/* Play/Pause Button */}
            <button
                onClick={handlePlayPause}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full 
                         bg-zinc-700 hover:bg-zinc-600 transition-colors cursor-pointer"
            >
                {isPlaying ? (
                    <IconPlayerPauseFilled size={14} className="text-white" />
                ) : (
                    <IconPlayerPlayFilled size={14} className="text-white" />
                )}
            </button>

            {/* Thumbnail */}
            <div className="size-12 flex-shrink-0">
                {
                    // 썸네일이 있을 경우
                    trackData.data.files?.includes('thumbnail') ? (
                        <div className="rounded-sm overflow-hidden">
                            <img
                                src={`https://${process.env.NEXT_PUBLIC_ASSET_SERVER}/${id}?r=thumbnail`}
                                alt="albumart image"
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full bg-foreground/10 rounded-sm" />
                    )
                }
            </div>

            {/* Title and Subtitle */}
            <div className="flex-1 min-w-0">
                <div className="font-bold truncate">{trackData.data.metadata.find(item => item.type === "title")?.content}</div>
                <div className="hidden md:block text-white/40 truncate">
                    {trackData.data.metadata.find(item => item.type === "subtitle")?.content}
                </div>
            </div>
        </div>
        <div className="h-[47.5px]">
          <WaveProgress
              id={id}
              metadata={trackData.data.metadata}
          />
        </div>
    </div>
  );
};

export default TailoredPlayer;