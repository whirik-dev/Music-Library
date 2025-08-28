import useMusicListStore from "@/stores/useMusicListStore"; // Adjust path as needed
import useModalStore from "@/stores/modalStore";
import useAuthStore from "@/stores/authStore";
import useUiStore from "@/stores/uiStore";
import useMusicItemStore from "@/stores/useMusicItemStore";
import { getSession } from "next-auth/react";

const Dev = ({ activate=false }) => {

    /** 
     * 이걸 true로 바꾸면 Dev 콘솔이 side바에 생긴다 그 안에 각종 변수들을 입력해가면서 디버깅 가능 */
    const devMode = activate | false;


    const { musicList, isLoading, fetchMusicList,error,listMode } = useMusicListStore();
    const { previousPath, setPreviousPath } = useModalStore();
    const { userInfo, favoriteId, favoriteList } = useAuthStore();
    const { colorMode, setColorMode } = useUiStore();
    const { status, playingAlbumart, playingMetadata, playingTrackId, duration, currentTime } = useMusicItemStore();

    return (
        <>
            {devMode ? (
                <>
                    <div className="max-h-[640px] w-full bg-black text-green p-1 overflow-scroll ring-1 ring-success text-xs text-green-400">
                        {/* Item : {musicList.length}
                        <hr/>*/}
                        {/* {JSON.stringify(musicList)}  */}
                        {/* {previousPath || 'null'} */}
                        {/* {JSON.stringify(userInfo)} */}
                        {/* items : {musicList.length}<br/>
                        load status : {isLoading ? 'loading...' : 'loaded'}<br/> */}
                        {/* listmode : {listMode} */}
                        {/* favoriteId : {favoriteId}<br/>
                        f list : {JSON.stringify(favoriteList)} */}
                    </div>
                </>
            ) : ""}
        </>
    )
}
export default Dev;