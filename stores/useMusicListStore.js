"use client";

import { create } from 'zustand';

const useMusicListStore = create((set, get) => ({
    musicList: [],

    // Optional: Track loading state
    isLoading: false, 

    // Optional: check list array is empty
    isEmpty: false,

    // Optional: Track errors
    error: null, 

    listMode: null,
    page: 0,
    query: '',
    setQuery: (q) =>
        set(() => ({
            query : q
        })),

    fetchMusicList: async () => {
        set({ isLoading: true, error: null });

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/music/list`);
            const data = await response.json();
            const items = data.data.items;

            get().renderMusicList(items);
            set({listMode:'fetch'})

        } catch (error) {
            set({ error: error.message, isLoading: false });
            console.error(error);
        }
    },

    queryMusicList: async () => {
        const query = get().query;
    
        if (!query || query.trim() === "") {
            return;
        }
    
        set({ isLoading: true, error: null });
    
        // 쿼리 스트링 만들기
        const keywords = query.trim().split(/\s+/); // 공백 여러 개도 걍 다 잘라버림
        const params = new URLSearchParams();
    
        keywords.forEach(word => {
            if (word) {
                params.append('q', word);
            }
        });
    
        try {
            const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/search?${params.toString()}`;
            const response = await fetch(url);
            const data = await response.json();

            if(data.data.count === 0)
            {
                set({ error: "No data available", isLoading: false, listMode:'empty' });
                return;
            }
            const items = data.data.items;
    
            get().renderMusicList(items);
            set({listMode:'query'})
    
        } catch (error) {
            set({ error: error.message, isLoading: false });
            console.error(error);
        }
    },
    

    renderMusicList: async (items) => {
        // console.log('render start');
        const preloadWithImage = await Promise.all(
            items.map(async (item) => {
                const hasThumbnail = item.files.includes('thumbnail');
                const imageUrl = hasThumbnail
                    ? `https://asset.probgm.com/${item.id}?r=thumbnail`
                    : null;

                if (imageUrl) {
                    await new Promise((res) => {
                        const img = new Image();
                        img.src = imageUrl;
                        img.onload = res;
                        img.onerror = () => {
                            console.warn(`Thumbnail not found for ID: ${item.id}`);
                            res(); // 에러가 발생해도 resolve로 처리
                        };
                    });
                }

                const hasWaveimage = item.files.includes('waveimg');
                const waveUrl = hasWaveimage
                    ? `https://asset.probgm.com/${item.id}?r=waveimage`
                    : null;

                if (waveUrl) {
                    await new Promise((res) => {
                        const img = new Image();
                        img.src = waveUrl;
                        img.onload = res;
                        img.onerror = () => {
                            console.warn(`Wave image not found for ID: ${item.id}`);
                            res(); // 에러가 발생해도 resolve로 처리
                        };
                    });
                }

                return {
                    ...item,
                    thumbnailUrl: imageUrl,
                    waveimgUrl: waveUrl
                };
            })
        );

        set({ musicList: preloadWithImage, isLoading: false });
    },

    /**
     * 검색 탭 상태 (true = 열림, false = 닫힘)
     * @type {boolean}
     */
    searchTab: false,
    searchQuery: "",

    /**
     * 검색 탭 상태를 토글하거나 강제로 설정
     * @param {boolean} [forceState] - true 또는 false로 강제 설정. 전달하지 않으면 현재 상태 반전
     */
    toggleSearchTab: (forceState) =>
        set(() => ({
            searchTab:
                typeof forceState === 'boolean'
                    ? forceState
                    : !get().searchTab
        })),

    relatedKeywords : [],
    setRelatedKeywords: (k) =>
        set(() => ({ 
            relatedKeywords: k
        })),
    
    relSelected : null,
    setRelSelected: (r) => 
        set(()=>({
            relSelected: r
        }))
    

}));

export default useMusicListStore;