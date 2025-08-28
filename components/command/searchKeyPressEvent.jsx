"use client";

import { useEffect, forwardRef } from 'react';

const SearchKeyPressEvent = forwardRef(({ onEnter }, inputRef) => {
    useEffect(() => {
        const handleKeyDown = (event) => {
            // 키 입력을 input 요소 바깥에서만 감지
            if (
                event.target.tagName === 'INPUT' ||
                event.target.tagName === 'TEXTAREA' ||
                event.target.isContentEditable
            ) {
                return;
            }

            switch (event.code) {
                case 'KeyK':
                    if (event.metaKey || event.ctrlKey) {
                        event.preventDefault();
                        inputRef?.current?.focus();
                    }
                    break;
                default:
                    break;
            }
        };

        const handleInputKeyDown = (event) => {
            if (event.code === 'Escape') {
                inputRef?.current?.blur();
            } else if (event.code === 'Enter') {
                if (typeof onEnter === 'function') {
                    onEnter(event);
                }
            }
        };

        // 전체 window 단위 핫키
        window.addEventListener('keydown', handleKeyDown);

        // inputRef에 연결된 DOM에 직접 이벤트 연결
        const inputEl = inputRef?.current;
        inputEl?.addEventListener('keydown', handleInputKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            inputEl?.removeEventListener('keydown', handleInputKeyDown);
        };
    }, [inputRef, onEnter]);

    return null;
});

export default SearchKeyPressEvent;
