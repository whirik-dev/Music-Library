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
    currentPage: 0,
    totalCount: 0,
    hasMore: true,
    isLoadingMore: false,
    query: '',
    setQuery: (q) =>
        set(() => ({
            query: q
        })),

    fetchMusicList: async (pageNum = 0, append = false) => {
        const loadingKey = append ? 'isLoadingMore' : 'isLoading';
        set({ [loadingKey]: true, error: null });

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/music/list?p=${pageNum}`);
            const data = await response.json();
            const items = data.data.items;
            const count = data.data.count;
            const currentPage = data.data.current_page;

            if (append) {
                // 무한스크롤: 기존 리스트에 추가
                await get().appendMusicList(items);
            } else {
                // 첫 로드: 새로운 리스트로 교체
                await get().renderMusicList(items);
            }

            set({
                listMode: 'fetch',
                currentPage: currentPage,
                totalCount: count,
                hasMore: items.length > 0, // 아이템이 있으면 더 있을 수 있음
                [loadingKey]: false
            });

        } catch (error) {
            set({ error: error.message, [loadingKey]: false });
            console.error(error);
        }
    },

    queryMusicList: async (pageNum = 0, append = false) => {
        const query = get().query;

        if (!query || query.trim() === "") {
            return;
        }

        const loadingKey = append ? 'isLoadingMore' : 'isLoading';
        set({ [loadingKey]: true, error: null });

        // 쿼리 스트링 만들기
        const keywords = query.trim().split(/\s+/); // 공백 여러 개도 걍 다 잘라버림
        const params = new URLSearchParams();

        keywords.forEach(word => {
            if (word) {
                params.append('q', word);
            }
        });

        // 페이지 파라미터 추가
        params.append('p', pageNum.toString());

        try {
            const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/search?${params.toString()}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.data.count === 0 && !append) {
                set({ error: "No data available", isLoading: false, listMode: 'empty' });
                return;
            }

            const items = data.data.items;
            const count = data.data.count;
            const currentPage = data.data.current_page;

            if (append) {
                // 무한스크롤: 기존 리스트에 추가
                await get().appendMusicList(items);
            } else {
                // 첫 로드: 새로운 리스트로 교체
                await get().renderMusicList(items);
            }

            set({
                listMode: 'query',
                currentPage: currentPage,
                totalCount: count,
                hasMore: items.length > 0, // 아이템이 있으면 더 있을 수 있음
                [loadingKey]: false
            });

        } catch (error) {
            set({ error: error.message, [loadingKey]: false });
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

    appendMusicList: async (items) => {
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
                            res();
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
                            res();
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

        set((state) => ({
            musicList: [...state.musicList, ...preloadWithImage],
            isLoadingMore: false
        }));
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

    relatedKeywords: [],
    setRelatedKeywords: (k) =>
        set(() => ({
            relatedKeywords: k
        })),

    relSelected: null,
    setRelSelected: (r) =>
        set(() => ({
            relSelected: r
        })),

    // 무한스크롤 함수들
    loadMore: async () => {
        const { listMode, currentPage, hasMore, isLoadingMore } = get();

        if (!hasMore || isLoadingMore) {
            return;
        }

        const nextPage = currentPage + 1;

        if (listMode === 'fetch') {
            await get().fetchMusicList(nextPage, true);
        } else if (listMode === 'query') {
            await get().queryMusicList(nextPage, true);
        }
    },

    resetList: () => {
        set({
            musicList: [],
            currentPage: 0,
            hasMore: true,
            totalCount: 0,
            listMode: null,
            isLoading: false,
            isLoadingMore: false
        });
    }


}));

export default useMusicListStore;