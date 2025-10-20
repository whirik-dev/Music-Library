"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import useAuthStore from "@/stores/authStore";

export default function AuthProvider() {
    const { data: session, status } = useSession();
    const {
        isLoading,
        toggleIsLoading,
        setIsNewbie,
        setUserInfo,
        clearUserInfo,
        toggleIsLogged,
        setMembership,
        setCredits,
        setDownloadPoints,
        addDownloadHistory,
        favoriteId,
        setFavoriteId,
        favoriteList,
        addFavoriteList
    } = useAuthStore();

    useEffect(() => {
        if (status === "loading") return;

        const verifySession = async (session) => {
            if (session?.user) {
                // console.log(session);
                try {
                    toggleIsLoading(true);
                    // console.log(`세션검증단계 ${session.user.ssid}`);
                    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/isLogged`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.user.ssid}`
                        }
                    });

                    const result = await response.json();
                    // console.log(result);

                    // 세션 검증 성공
                    // init....
                    if (result.success) {
                        // 유저 정보 생성 (클라이언트)
                        setUserInfo(session.user);

                        // 처음유저인지 아닌지
                        result.data.isNewbie && setIsNewbie(true);

                        // 멤버십정보 받아오기 (접속당 초기1회)
                        const userMembership = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/membership`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${session.user.ssid}`
                            }
                        });
                        const userMembershipData = await userMembership.json();
                        setMembership(userMembershipData.data.tier);

                        // 크레딧정보 받아오기 (접속당 초기1회)
                        const userCredits = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/credits`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${session.user.ssid}`
                            }
                        });
                        const userCreditsData = await userCredits.json();
                        setCredits(userCreditsData.data.balance);

                        // 다운로드 포인트 받아오기 
                        // const downloadPoints = await fetch();
                        const downloadPoint = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/downloadPoint`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${session.user.ssid}`
                            }
                        })
                        const userDownloadPoint = await downloadPoint.json();
                        // console.log(userDownloadPoint);
                        setDownloadPoints(userDownloadPoint.data);

                        // 다운로드한거 목록 받아오기
                        const downloaded = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/download/list`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${session.user.ssid}`
                            },
                        })
                        const userDownloaded = await downloaded.json();
                        if (userDownloaded.data && userDownloaded.data.length > 0) {
                            userDownloaded.data.forEach(data => {
                                addDownloadHistory(data.id);
                            });
                        }

                        // favorite 아이디 가져오기 
                        try {
                            const userFavoriteId = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/favoriteId`, {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${session.user.ssid}`
                                },
                            });

                            if (!userFavoriteId.ok) {
                                console.error('Failed to fetch favorite ID:', userFavoriteId.status);
                                return;
                            }

                            const userFavoriteIdData = await userFavoriteId.json();
                            
                            if (userFavoriteIdData.data && userFavoriteIdData.data.id) {
                                const favoriteId = userFavoriteIdData.data.id;
                                setFavoriteId(favoriteId);

                                // favorite 플레이리스트의 음악 목록 가져오기
                                const userFavoriteList = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/playlist/${favoriteId}/musics?page=1&limit=1000`, {
                                    method: 'GET',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${session.user.ssid}`
                                    },
                                });

                                if (!userFavoriteList.ok) {
                                    console.error('Failed to fetch favorite list:', userFavoriteList.status);
                                    return;
                                }

                                const userFavoriteListData = await userFavoriteList.json();
                                
                                // API 응답 구조: { success: true, data: { items: [...], count, total_count, ... } }
                                if (userFavoriteListData.success && userFavoriteListData.data && Array.isArray(userFavoriteListData.data.items)) {
                                    userFavoriteListData.data.items.forEach(m => {
                                        if (m && m.id) {
                                            addFavoriteList(m.id);
                                        }
                                    });
                                    console.log(`Loaded ${userFavoriteListData.data.items.length} favorite items`);
                                } else {
                                    console.log('No favorite items found or invalid response structure');
                                }
                            }
                        } catch (error) {
                            console.error('Error loading favorite list:', error);
                        }


                        // 로그인처리 (스토어)
                        toggleIsLogged(true);
                    }
                    else {
                        clearUserInfo();
                        toggleIsLogged(false);
                    }
                }
                catch (err) {
                    console.log(err);
                    clearUserInfo();
                    toggleIsLogged(false);
                }
            }
            else {
                clearUserInfo();
                toggleIsLogged(false);
            }
        };

        verifySession(session);
    }, [session, status, setUserInfo, clearUserInfo, toggleIsLogged]);

    return null;
}
