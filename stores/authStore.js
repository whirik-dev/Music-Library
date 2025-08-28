import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { getSession } from "next-auth/react";

/** Membership Tier 정의 */
const membershipTier = ['free', 'basic', 'pro', 'master'];

const useAuthStore = create(immer((set, get) => ({

    // 최초가입인지 아닌지?
    isNewbie: false,
    setIsNewbie: (forceState) =>
        set((state) => {
            state.isNewbie = typeof forceState === 'boolean' ? forceState : !state.isNewbie;
        }),

    isLoading: null,
    toggleIsLoading: (forceState) =>
        set((state) => {
            state.isLoading = typeof forceState === 'boolean' ? forceState : !state.isLoading;
        }),

    /** 로그인 했는지 아닌지 (레거시) */
    isLogged: null,
    toggleIsLogged: (forceState) =>
        set((state) => {
            state.isLogged = typeof forceState === 'boolean' ? forceState : !state.isLogged;
            state.authModal = false;
        }),

    /** 로그인창 열렸는지 아닌지 */
    authModal: false,
    toggleAuthModal: (forceState) =>
        set((state) => {
            state.authModal = typeof forceState === 'boolean' ? forceState : !state.authModal;
            state.modalPage = "signin";
        }),

    /** 모달 내부 페이지 전환 */
    modalPage: "signin",
    setModalPage: (pagename) =>
        set((state) => {
            state.modalPage = pagename;
        }),

    /** 사용자 정보 */
    userInfo: null,
    setUserInfo: (obj) =>
        set((state) => {
            state.userInfo = obj;
        }),
    clearUserInfo: () =>
        set((state) => {
            state.userInfo = null;
        }),

    /** Membership */
    membership: null,
    setMembership: (membership_input) => {
        set((state) => {
            // Handle both string and number inputs
            if (typeof membership_input === 'string') {
                // If it's already a valid tier string, use it directly
                if (membershipTier.includes(membership_input)) {
                    state.membership = membership_input;
                } else {
                    state.membership = 'free'; // Default fallback
                }
            } else if (typeof membership_input === 'number') {
                // If it's a number, use it as index
                state.membership = membershipTier[membership_input] || 'free';
            } else {
                state.membership = 'free'; // Default fallback
            }
        });
    },

    /** Downloads Point */
    downloadPoints: 0,
    setDownloadPoints: (downloadPoint_num) => {
        set((state) => {
            state.downloadPoints = downloadPoint_num;
        });
    },

    isDownloading: false,
    toggleIsDownloading: (forceState) =>
        set((state) => {
            state.isDownloading = typeof forceState === 'boolean' ? forceState : !state.isDownloading;
        }),

    /** 
     * Ui상 중복차감되게 보이는것을 방지하기위한것, 기본적으로 서버에서 갯수처리함.
     */
    downloadHistory: [],
    addDownloadHistory: (url) => set((state) => {
        if (!state.downloadHistory.includes(url)) {
            state.downloadHistory.push(url);
        }
    }),

    favoriteId: '',
    setFavoriteId:  (obj) =>
        set((state) => {
            state.favoriteId = obj;
        }),

    favoriteList: [],
    addFavoriteList: (id) => set((state) => {
        if (!state.favoriteList.includes(id)) {
            state.favoriteList.push(id);
        }
    }),
    removeFavoriteList: (id) => set((state) => {
        state.favoriteList = state.favoriteList.filter(item => item !== id);
    }),

    /** Credits */
    credits: 0,
    setCredits: (balance) =>
        set((state) => {
            state.credits = balance;
        }),


    /** Initializing */
    initializing: () =>
        set((state) => {
            state.setCredits = 0;
            state.favoriteList = [];
            state.favoriteId = [];
            state.downloadHistory = [];
        }),

})));

export default useAuthStore;
