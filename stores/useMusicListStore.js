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
            // 다양성을 위한 페이지 계산
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
            
            // 사용자별 고유 오프셋 (브라우저 지문 기반)
            const getUserOffset = () => {
                let offset = localStorage.getItem('userOffset');
                if (!offset) {
                    // 브라우저 특성 기반으로 고유 오프셋 생성
                    const fingerprint = navigator.userAgent.length + 
                                      screen.width + screen.height + 
                                      new Date().getTimezoneOffset();
                    offset = Math.abs(fingerprint % 500) + 1; // 1~500 범위
                    localStorage.setItem('userOffset', offset.toString());
                }
                return parseInt(offset);
            };
            
            // 복합 시드 계산: 날짜 + 시간 + 사용자 오프셋
            const timeBasedSeed = (dayOfYear * 1440) + (hours * 60) + minutes;
            const userOffset = getUserOffset();
            const basePage = (timeBasedSeed + userOffset) % 2400 + 1; // 1~2400 범위로 제한
            
            // 실제 페이지는 계산된 페이지 + 추가 페이지 번호 (최대 2500 제한)
            const actualPage = Math.min(basePage + pageNum, 2500);
            
            const params = new URLSearchParams();
            params.append('q', '*'); // 전체 목록
            params.append('p', actualPage.toString());
            
            const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/search?${params.toString()}`;
            const response = await fetch(url);
            const data = await response.json();
            const items = data.data.items;
            const count = data.data.count;
            const currentPage = data.data.current_page;

            // 디버깅: 마지막 페이지 체크 (항상 출력)
            const currentMusicList = get().musicList;
            const totalLoadedItems = append ? currentMusicList.length + items.length : items.length;
            // count는 현재 페이지 아이템 수이므로, items.length가 0일 때만 마지막 페이지로 판단
            const isLastPage = items.length === 0;



            if (append) {
                // 무한스크롤: 기존 리스트에 추가
                await get().appendMusicList(items);
            } else {
                // 첫 로드: 새로운 리스트로 교체
                await get().renderMusicList(items);
            }

            set({
                listMode: 'fetch',
                currentPage: pageNum, // 실제 요청한 페이지 번호 사용
                totalCount: count,
                hasMore: !isLastPage, // 이미 계산된 isLastPage 사용
                [loadingKey]: false
            });

        } catch (error) {
            console.log('❌ Fetch error, setting hasMore to false:', error.message);
            set({
                error: error.message,
                [loadingKey]: false,
                hasMore: false // 에러 발생 시 더 이상 로드하지 않음
            });
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
        const params = new URLSearchParams();
        
        // 띄어쓰기가 포함된 상태로 쿼리 전송
        params.append('q', query.trim());
        
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

            // 디버깅: 마지막 페이지 체크
            const currentMusicList = get().musicList;
            const totalLoadedItems = append ? currentMusicList.length + items.length : items.length;
            // count는 현재 페이지 아이템 수이므로, items.length가 0일 때만 마지막 페이지로 판단
            const isLastPage = items.length === 0;

            if (append) {


            }

            if (append) {
                // 무한스크롤: 기존 리스트에 추가
                await get().appendMusicList(items);
            } else {
                // 첫 로드: 새로운 리스트로 교체
                await get().renderMusicList(items);
            }

            set({
                listMode: 'query',
                currentPage: pageNum, // 실제 요청한 페이지 번호 사용
                totalCount: count,
                hasMore: !isLastPage, // 이미 계산된 isLastPage 사용
                [loadingKey]: false
            });

        } catch (error) {
            set({ 
                error: error.message, 
                [loadingKey]: false,
                hasMore: false // 에러 발생 시 더 이상 로드하지 않음
            });
            console.error(error);
        }
    },


    renderMusicList: async (items) => {
        // console.log('render start');
        const preloadWithImage = await Promise.all(
            items.map(async (item) => {
                const hasThumbnail = item.files.includes('thumbnail');
                const imageUrl = hasThumbnail
                    ? `https://${process.env.NEXT_PUBLIC_ASSET_SERVER}/${item.id}?r=thumbnail`
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
                    ? `https://${process.env.NEXT_PUBLIC_ASSET_SERVER}/${item.id}?r=waveimage`
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
                    ? `https://${process.env.NEXT_PUBLIC_ASSET_SERVER}/${item.id}?r=thumbnail`
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
                    ? `https://${process.env.NEXT_PUBLIC_ASSET_SERVER}/${item.id}?r=waveimage`
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

        set((state) => {
            // 중복 제거: 기존 리스트에 없는 아이템만 추가
            const existingIds = new Set(state.musicList.map(item => item.id));
            const newItems = preloadWithImage.filter(item => !existingIds.has(item.id));



            return {
                musicList: [...state.musicList, ...newItems],
                isLoadingMore: false
            };
        });
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
        
        // 페이지 제한 체크 (fetch 모드에서만 적용)
        if (listMode === 'fetch') {
            // 시간 기반 페이지 계산으로 실제 페이지가 2500을 넘을 수 있는지 체크
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
            
            const getUserOffset = () => {
                const offset = localStorage.getItem('userOffset');
                return offset ? parseInt(offset) : 1;
            };
            
            const timeBasedSeed = (dayOfYear * 1440) + (hours * 60) + minutes;
            const userOffset = getUserOffset();
            const basePage = (timeBasedSeed + userOffset) % 2400 + 1;
            const wouldBeActualPage = basePage + nextPage;
            
            if (wouldBeActualPage > 2500) {
                set({ hasMore: false });
                return;
            }
            
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