"use client"

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react"
import useAuthStore from "@/stores/authStore";
import { trackMusicFavorite, trackButtonClick } from "@/lib/analytics";

const FavoriteHeart = ({ asset_id }) => {
    const { data: session, status } = useSession();
    const {
        isLogged,
        toggleAuthModal,
        favoriteId,
        favoriteList,
        addFavoriteList,
        removeFavoriteList,
    } = useAuthStore();

    const [heart, setHeart] = useState(false);

    useEffect(() => {
        setHeart(favoriteList.includes(asset_id));
    }, [favoriteList, asset_id]); // 의존성 중요!

    const HandleFavoriteHeart = async () => {
        if (!isLogged) 
        {
            toggleAuthModal();
            return;
        }

        const newHeart = !heart;
        // 스토어 업데이트도 같이
        if (newHeart) {

            const addRequest = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/playlist/add`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${session.user.ssid}`
                },
                body: JSON.stringify({
                    playlist_id: favoriteId,
                    music_id: asset_id
                })
            })
            const addResponse = await addRequest.json();
            if(addResponse.success)
            {
                addFavoriteList(asset_id);
                setHeart(newHeart);
                
                // 즐겨찾기 추가 이벤트 추적
                trackMusicFavorite(asset_id, 'Unknown Title', 'Unknown Artist', 'add');
                trackButtonClick('Add Favorite', 'Music Item');
            }
        } else {

            const removeRequest = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/playlist/remove`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${session.user.ssid}`
                },
                body: JSON.stringify({
                    playlist_id: favoriteId,
                    music_id: asset_id
                })
            })
            const removeResponse = await removeRequest.json();
            if(removeResponse.success)
            {
                removeFavoriteList(asset_id);
                setHeart(newHeart);
                
                // 즐겨찾기 제거 이벤트 추적
                trackMusicFavorite(asset_id, 'Unknown Title', 'Unknown Artist', 'remove');
                trackButtonClick('Remove Favorite', 'Music Item');
            }
            // removeFavoriteList(asset_id); // 함수가 있으면 호출
        }
    }

    return (
        <div className="cursor-pointer hover:opacity-50" onClick={HandleFavoriteHeart}>
            {heart ? (
                <IconHeartFilled size="18" color="#fb3310" />
            ) : (
                <IconHeart size="18" />
            )}
        </div>
    );
};

export default FavoriteHeart
