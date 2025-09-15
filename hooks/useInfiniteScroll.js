"use client";

import { useEffect, useRef, useCallback } from 'react';

const useInfiniteScroll = (loadMore, hasMore, isLoading) => {
    const observerRef = useRef(null);
    const triggerRef = useRef(null);
    const lastTriggerTime = useRef(0);

    const handleIntersection = useCallback((entries) => {
        const [entry] = entries;

        // hasMore가 false이면 아예 처리하지 않음
        if (!hasMore) {
            return;
        }

        if (entry.isIntersecting && !isLoading) {
            // 연속 호출 방지: 마지막 트리거로부터 1초 이상 경과해야 함
            const now = Date.now();
            if (now - lastTriggerTime.current < 1000) {
                return;
            }
            lastTriggerTime.current = now;

            loadMore();
        }
    }, [loadMore, hasMore, isLoading]);

    // 옵저버를 설정하는 함수
    const setupObserver = useCallback(() => {
        const currentTriggerRef = triggerRef.current;

        if (currentTriggerRef && currentTriggerRef.isConnected && !observerRef.current) {
            try {
                observerRef.current = new IntersectionObserver(handleIntersection, {
                    root: null,
                    rootMargin: '0px 0px 100px 0px', // 뷰포트 하단 5% 지점에서 트리거
                    threshold: 0
                });

                observerRef.current.observe(currentTriggerRef);
            } catch (error) {
                console.error('Failed to create intersection observer:', error);
            }
        }
    }, [handleIntersection]);

    // 컴포넌트 언마운트 시 정리
    useEffect(() => {
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }
        };
    }, []);

    // ref가 설정될 때마다 옵저버 설정 시도
    const enhancedTriggerRef = useCallback((element) => {
        // 기존 옵저버 정리
        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }

        triggerRef.current = element;

        if (element) {
            // DOM이 완전히 렌더링된 후 옵저버 설정
            setTimeout(() => {
                if (triggerRef.current === element) {
                    setupObserver();
                }
            }, 100);
        }
    }, [setupObserver]);

    return enhancedTriggerRef;
};

export default useInfiniteScroll;