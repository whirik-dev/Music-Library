"use client"

import { useEffect, useState } from "react";
import { useJWTAuth } from "@/hooks/useJWTAuth";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react"
import useAuthStore from "@/stores/authStore";

const FavoriteHeart = ({ asset_id }) => {
    const { data: session, status } = useJWTAuth();
    const {
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
        const newHeart = !heart;
        // 스토어 업데이트도 같이
        if (newHeart) {

            const addRequest = await fetch('/api/playlist/add', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
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
            }
        } else {

            const removeRequest = await fetch('/api/playlist/remove', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
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
