import { useEffect, useRef } from "react";

/**
 * 마운트 시 onMount, 언마운트 시 onUnmount 실행
 * StrictMode에서도 onMount는 진짜 1회만 실행됨
 */
const useToggle = (onMount, onUnmount) => {
    const hasMounted = useRef(false);

    useEffect(() => {
        if (!hasMounted.current) {
            if (typeof onMount === "function") {
                // console.log('is mounted');
                onMount();
            }
            hasMounted.current = true;
        }

        return () => {
            if (typeof onUnmount === "function") {
            //   console.log('is unmounted');
                onUnmount();
            }
        };
    }, []);
};

export default useToggle;
