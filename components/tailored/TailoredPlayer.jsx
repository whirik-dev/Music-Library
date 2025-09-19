import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import WaveProgress from "@/components/player/WaveProgress";
import TailoredPlayerSkeleton from "@/components/skeleton/TailoredPlayerSkeleton";

// TODO: 차후에 테일러드 창에서 무언가 재생될경우, 다른 플레이어에서는 보이지 않게 하는 조치 필요 -> 집중력이 흐트러짐.
// 이 부분은 사실 플레이어 상태를 공유함으로써 생기는 현상
// 그렇다고 플레이어 상태를 또 만드는거보다 그냥 시각적으로만 안보이게 하면 좋을듯.
const TailoredPlayer = ({ id }) => {
  const t = useTranslations('errors');
  const [state, setState] = useState({
    musicList: null,
    isLoading: false,
    error: null,
  });

  const loadItem = async (id) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/music/${id}`);
      if (!response.ok) {
        throw new Error(t('http_error', { status: response.status }));
      }
      const data = await response.json();
      setState((prev) => ({ ...prev, musicList: data, isLoading: false }));
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

  const { musicList, isLoading, error } = state;

  if (isLoading) return <TailoredPlayerSkeleton />;
  if (error) return <div>{t('error_no_data')}: {error}</div>;
  if (!musicList) return <div>{t('error_no_data')}</div>;
  // console.log(musicList.data)

  return (
    <div className="tailored-player px-3 pt-3 pb-0 m-2 bg-zinc-800/50 rounded-lg">
        <div className="flex flex-row gap-3">
            <div className="size-12">
                {
                    // 썸네일이 있을 경우
                    musicList.data.files?.includes('thumbnail') ? (
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
            <div className="">
                <div className="font-bold">{musicList.data.metadata.find(item => item.type === "title")?.content}</div>
                <div className="hidden md:block text-white/40">
                    {musicList.data.metadata.find(item => item.type === "subtitle")?.content}
                </div>
            </div>
        </div>
        <div className="h-[47.5px]">
          <WaveProgress
              id={id}
              metadata={musicList.data.metadata}
          />
        </div>
    </div>
  );
};

export default TailoredPlayer;