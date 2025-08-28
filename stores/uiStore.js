import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

/**
 * User Interface Store (with immer)
 */
const useUiStore = create(
    immer((set) => ({
        colorMode: "dark",
        setColorMode: (mode) =>
            set((state) => {
                state.colorMode = mode;
            }),

        // Sidebar Visibility
        sidebarVisible : false,
        setSidebarVisible: (visible) =>
            set((state) => {
                state.sidebarVisible = visible;
            }),
        toggleSidebarVisible: () =>
            set((state) => {
                state.sidebarVisible = !state.sidebarVisible;
            }),


        // Popup

        currentPopup: null,
        currentPopupArgument: {},

        setCurrentPopup: (popup, argument = {}) =>
            set((state) => {
                state.currentPopup = popup;
                state.currentPopupArgument = argument;
            }),

        setCurrentPopupArgument: (argument) =>
            set((state) => {
                state.currentPopupArgument = argument;
            }),

        closePopup: () =>
            set((state) => {
                state.currentPopup = null;
                state.currentPopupArgument = {};
            }),

        // 팝업 argument 업데이트 (기존 argument와 병합)
        updatePopupArgument: (newArgument) =>
            set((state) => {
                state.currentPopupArgument = { ...state.currentPopupArgument, ...newArgument };
            }),

        // 특정 키의 argument 값 설정
        setPopupArgumentKey: (key, value) =>
            set((state) => {
                state.currentPopupArgument[key] = value;
            }),

        // 특정 키의 argument 값 제거
        removePopupArgumentKey: (key) =>
            set((state) => {
                delete state.currentPopupArgument[key];
            }),

        // reset all values
        resetUiStore: () =>
            set((state) => {
                state.colorMode = "dark";
                state.currentPopup = null;
                state.currentPopupArgument = {};
            }),
    }))
);

export default useUiStore;
