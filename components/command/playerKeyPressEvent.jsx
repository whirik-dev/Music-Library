"use client";

import { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import useMusicItemStore from '../../stores/useMusicItemStore';
import useMusicListStore from '../../stores/useMusicListStore';

const PlayerKeyPressEvent = () => {
    useEffect(() => {
        const handleKeyDown = (event) => {
        // 입력 필드에서 키 이벤트가 발생한 경우 무시
            if (
            event.target.tagName === 'INPUT' ||
            event.target.tagName === 'TEXTAREA' ||
            event.target.isContentEditable
            ) {
            return;
            }

            const musicStore = useMusicItemStore.getState();
            const { status, player, currentTime } = musicStore;

            const musicList = useMusicListStore.getState().musicList;
            const currentTrackId = musicStore.playingTrackId;

            switch (event.code) {
                // 스페이스바: 재생/일시정지 토글
                case 'Space':
                    event.preventDefault(); // 스크롤 방지
                    if (status === 'playing') 
                    {
                        musicStore.pause();
                    } 
                    else if (status === 'paused') 
                    {
                        musicStore.resume();
                    } 
                    else if (status === null )
                    {
                        // 아무거도 없을경우 첫 곡부터 재생
                        musicStore.play(musicList[0].id);
                    }
                    break;

                // 왼쪽 화살표: 5초 또는 2초 뒤로
                case 'ArrowLeft': {
                    const skipTime = event.shiftKey ? 10 : 5;
                    const newTime = Math.max(0, currentTime - skipTime);
                    if (player && (status === 'playing' || status === 'paused')) {
                        musicStore.updateCurrentTime(newTime);
                    }
                    if (player && status === 'paused') {
                        musicStore.updatePauseTime(newTime);
                    }
                    break;
                }
                
                // 오른쪽 화살표: 5초 또는 2초 앞으로
                case 'ArrowRight': {
                    const skipTime = event.shiftKey ? 20 : 5;
                    const duration = musicStore.duration || 0;
                    const newTime = Math.min(duration, currentTime + skipTime);
                    if (player && (status === 'playing' || status === 'paused')) {
                        musicStore.updateCurrentTime(newTime);
                    }
                    if (player && status === 'paused') {
                        musicStore.updatePauseTime(newTime);
                    }
                    break;
                }
                // 위 화살표: 다음 곡 재생
                case 'ArrowDown':
                    if (musicStore.status === 'loading') {
                        toast.warn('item is loading...');
                        break;
                    }
                    event.preventDefault();

                    if (musicList.length > 0 && currentTrackId) {
                        const currentIndex = musicList.findIndex(item => item.id === currentTrackId);
                        console.log(currentIndex);
                        if (currentIndex !== -1 && currentIndex < musicList.length - 1) {
                            const nextTrack = musicList[currentIndex + 1];
                            musicStore.stop();
                            musicStore.play(nextTrack.id);
                        } 
                        else 
                        {
                            if(currentIndex === -1)
                            {
                                musicStore.play(musicList[0].id);
                                break;
                            }
                            toast.warn("last item");
                        }
                    }
                    break;

                case 'ArrowUp':
                    if (musicStore.status === 'loading') {
                        toast.warn('item is loading...');
                        break;
                    }
                    event.preventDefault();

                    if(musicList.length === 0)
                    {
                        break;
                    }

                    if (musicList.length > 0 && currentTrackId) {
                        const currentIndex = musicList.findIndex(item => item.id === currentTrackId);
                        console.log(currentIndex);
                        if (currentIndex > 0) {
                            const prevTrack = musicList[currentIndex - 1];
                            musicStore.stop();
                            musicStore.play(prevTrack.id);
                        }
                        else 
                        {
                            if(currentIndex === -1)
                            {
                                musicStore.play(musicList[0].id);
                                break;
                            }
                            toast.warn("no more item");
                        }
                    }
                    break;

                default:
                break;
            }
        };

        // 이벤트 리스너 등록
        window.addEventListener('keydown', handleKeyDown);

        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // 이 컴포넌트는 UI를 렌더링하지 않음
    return null;
};

export default PlayerKeyPressEvent;