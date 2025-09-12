import { create } from 'zustand';
import { Howl } from 'howler';

import useMusicListStore from "@/stores/useMusicListStore";

let animationFrameId = null;
let lastUpdateTime = 0;
const updateInterval = 100; // 약 10fps
let skipNextUpdate = false;

const useMusicItemStore = create((set, get) => {

    let currentPlayPromise = null; // 현재 진행 중인 재생 요청 추적

    const startTimer = () => {
        const update = (currentTime) => {
            const player = get().player;
            if (player && player.playing()) {
                if (currentTime - lastUpdateTime >= updateInterval) {
                    if (!skipNextUpdate) {
                        const time = player.seek();
                        const prevTime = get().currentTime;
                        if (Math.abs(time - prevTime) >= 0.05) {
                            set({ currentTime: time });
                        }
                    } else {
                        skipNextUpdate = false;
                    }
                    lastUpdateTime = currentTime;
                }
            }
            animationFrameId = requestAnimationFrame(update);
        };

        cancelAnimationFrame(animationFrameId);
        lastUpdateTime = performance.now();
        animationFrameId = requestAnimationFrame(update);
    };

    const stopTimer = () => {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        lastUpdateTime = 0;
    };

    return {
        status: null,
        playingTrackId: null,
        playingMetadata: null,
        playingFiles: null,
        pauseTime: null,
        currentTime: 0,
        duration: 1,
        player: null,
        volume: 0.8,

        play: async (trackId) => {
            // 이미 같은 트랙이 재생 중이면 무시
            if (get().playingTrackId === trackId && get().status !== null) {
                return;
            }

            // 이전 재생 요청이 있으면 취소
            if (currentPlayPromise) {
                currentPlayPromise.cancelled = true;
            }

            const musicList = useMusicListStore.getState().musicList;
            const metadata = musicList.find((m) => m.id === trackId).metadata;
            const files = musicList.find((m) => m.id === trackId).files;
            const url = `https://asset.mimiu.me/${trackId}?r=preview`;

            const prevPlayer = get().player;
            if (prevPlayer) {
                prevPlayer.stop();
                prevPlayer.unload();
                stopTimer();
            }

            set({
                status: 'loading',
                playingTrackId: trackId,
                playingMetadata: metadata,
                playingFiles: files,
                currentTime: 0,
                duration: 0,
                pauseTime: null,
                player: null,
            });

            const playPromise = new Promise((resolve, reject) => {
                const howl = new Howl({
                    src: [url],
                    format: ['mp3'],
                    html5: true,
                    xhrWithCredentials: false,
                    onloaderror: (id, error) => {
                        if (playPromise.cancelled) return;
                        reject(new Error(`Failed to load audio: ${error}`));
                    },
                    onend: () => {
                        if (playPromise.cancelled) return;
                        stopTimer();
                        set({
                            status: null,
                            playingTrackId: null,
                            playingMetadata: null,
                            playingfiles: null,
                            pauseTime: null,
                            currentTime: 0,
                            duration: 1,
                            player: null,
                        });
                    }
                });

                howl.volume(get().volume);
                howl.play();

                howl.once('play', () => {
                    if (playPromise.cancelled) {
                        howl.stop();
                        howl.unload();
                        return;
                    }

                    set({
                        duration: howl.duration(),
                        player: howl,
                        status: 'playing'
                    });
                    startTimer();
                    resolve();
                });
            });

            currentPlayPromise = playPromise;

            try {
                await playPromise;
            } catch (error) {
                if (!playPromise.cancelled) {
                    console.error('Play error:', error);
                }
            } finally {
                if (currentPlayPromise === playPromise) {
                    currentPlayPromise = null;
                }
            }
        },

        seek: (time) => {
            const { player } = get();
            if (player) {
                player.seek(time);
                skipNextUpdate = true;
                set({
                    pauseTime: null,
                    status: 'playing',
                    currentTime: time
                });
            }
        },

        pause: () => {
            const { player } = get();
            if (player && player.playing()) {
                const currentTime = player.seek();
                player.pause();
                stopTimer();
                set({
                    status: 'paused',
                    pauseTime: currentTime
                });
            }
        },

        resume: () => {
            return new Promise((resolve, reject) => {
                const { player, pauseTime } = get();
                if (!player || pauseTime == null) {
                    reject(new Error('재생을 재개할 수 없습니다'));
                    return;
                }

                try {
                    player.seek(pauseTime);
                    player.play();
                    skipNextUpdate = true;
                    startTimer();

                    player.once('play', () => {
                        set({
                            status: 'playing',
                            pauseTime: null
                        });
                        resolve();
                    });

                    player.once('playerror', (id, error) => {
                        stopTimer();
                        reject(new Error(`오디오 재생 재개 실패: ${error}`));
                    });
                } catch (error) {
                    stopTimer();
                    reject(new Error(`오디오 재개 중 오류 발생: ${error.message}`));
                }
            });
        },

        stop: () => {
            const { player } = get();
            if (player) {
                player.stop();
                player.unload();
            }
            stopTimer();
            set({
                status: null,
                playingTrackId: null,
                playingMetadata: null,
                pauseTime: null,
                duration: 1,
                currentTime: 0,
                player: null
            });
        },

        setVolume: (vol) => {
            const clampedVol = Math.max(0, Math.min(vol, 1));
            const player = get().player;
            if (player) player.volume(clampedVol / 4);
            set({ volume: clampedVol / 4 });
        },

        updateCurrentTime: (time) => {
            const player = get().player;
            if (player) {
                player.seek(time);
                skipNextUpdate = true;
                set({ currentTime: time });
            }
        },

        updatePauseTime: (time) => {
            set({ pauseTime: time });
        }
    };
});

export default useMusicItemStore;
