import { create } from 'zustand';
import { produce } from 'immer';

const useTailoredStore = create((set, get) => ({
    /** 현재 열려있는 타겟이 있는지 없는지 */
    target: null,

    /**
     * 
     * @param {string} id 
     * @returns 
     */
    setTarget: (id) =>
        set(() => ({
            target: id,
            step: 1
        })),
    clearTarget: () =>
        set(() => ({
            target: null
        })),

    /**
     * 테일러드 서비스 페이지네이션
     */
    step: null,

    /**
     * 
     * @param {number} step 
     * @returns 
     */
    setStep: (step) =>
        set(() => ({
            step: step
        })),

    /**
     *  TODO: 테일러드 서비스 스테이트 짜기
     */
    works: [],
    /**
     * 
     * @param {string} worksId 
     * @returns 
     */
    addWorks: (worksId) =>
        set((state) => ({
            works: [...state.works, worksId],
        })),
    clearWorks: () =>
        set(() => ({
            works: [],
        })),
    /**
     * 
     * @param {string} worksId 
     * @returns 
     */
    removeWorks: (worksId) =>
        set((state) => ({
            works: state.works.filter((id) => id !== worksId),
        })),

    detail: '',
    /**
     * 
     * @param {string} detail 
     * @returns 
     */
    setDetail: (detail) =>
        set(() => ({
            detail: detail
        })),


    currentTailoredInfo: {
        data : {
            "title": null,
            "director": "api@whirik.com",
            "music-genre": [],
            "due-date": null,
            "invisible": true,
            "sow": {
              "items": [],
              "comment1": null,
              "comment2": null
            }
        }
    },

    /**
     * currentTailoredInfo 업데이트 (immer 사용)
     * @param {string} key - 업데이트할 키
     * @param {any} value - 설정할 값
     */
    setTailoredInfo: (key, value) =>
        set(produce((state) => {
            state.currentTailoredInfo[key] = value;
        })),

    /**
     * currentTailoredInfo의 중첩된 객체 업데이트
     * @param {string} path - 점 표기법으로 된 경로 (예: 'step1.data.name')
     * @param {any} value - 설정할 값
     */
    setTailoredInfoByPath: (path, value) =>
        set(produce((state) => {
            const keys = path.split('.');
            let current = state.currentTailoredInfo;

            // 경로의 마지막 키를 제외하고 객체 생성
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }

            // 마지막 키에 값 설정
            current[keys[keys.length - 1]] = value;
        })),

    /**
     * currentTailoredInfo 전체 업데이트
     * @param {object} info - 새로운 tailored 정보 객체
     */
    updateTailoredInfo: (info) =>
        set(produce((state) => {
            state.currentTailoredInfo = { ...state.currentTailoredInfo, ...info };
        })),

    /**
     * currentTailoredInfo 초기화
     */
    clearTailoredInfo: () =>
        set(produce((state) => {
            state.currentTailoredInfo = {
                data : {
                    "title": null,
                    "director": "api@whirik.com",
                    "music-genre": [],
                    "due-date": null,
                    "invisible": true,
                    "sow": {
                      "items": [],
                      "comment1": null,
                      "comment2": null
                    }
                }
            }
        })),

    /**
     * 테일러드 스테이트 초기화
     */
    initTailoredState: () =>
        set(() => ({
            target: null,
            step: null,
            works: [],
            detail: '',
            currentTailoredInfo: {
                data : {
                    "title": null,
                    "director": "api@whirik.com",
                    "music-genre": [],
                    "due-date": null,
                    "invisible": true,
                    "sow": {
                      "items": [],
                      "comment1": null,
                      "comment2": null
                    }
                }
            }
        }))
}));

export default useTailoredStore;
