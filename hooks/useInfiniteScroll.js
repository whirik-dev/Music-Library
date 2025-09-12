"use client";

import { useEffect, useRef, useCallback } from 'react';

const useInfiniteScroll = (loadMore, hasMore, isLoading) => {
    const observerRef = useRef(null);
    const triggerRef = useRef(null);

    const handleIntersection = useCallback((entries) => {
        const [entry] = entries;
        
        if (entry.isIntersecting && hasMore && !isLoading) {
            loadMore();
        }
    }, [loadMore, hasMore, isLoading]);

    // 옵저버를 설정하는 함수
    const setupObserver = useCallback(() => {
        const currentTriggerRef = triggerRef.current;

        if (currentTriggerRef && !observerRef.current) {
            observerRef.current = new IntersectionObserver(handleIntersection, {
                root: null,
                rootMargin: '0px 0px -95% 0px', // 뷰포트 하단 5% 지점에서 트리거
                threshold: 0
            });

            observerRef.current.observe(currentTriggerRef);
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
        triggerRef.current = element;
        
        if (element) {
            // 다음 틱에서 옵저버 설정 (DOM이 완전히 렌더링된 후)
            setTimeout(() => {
                setupObserver();
            }, 0);
        } else if (observerRef.current) {
            // 요소가 제거될 때 옵저버 정리
            observerRef.current.disconnect();
            observerRef.current = null;
        }
    }, [setupObserver]);

    return enhancedTriggerRef;
};

export default useInfiniteScroll;