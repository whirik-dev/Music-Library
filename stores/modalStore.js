import { create } from 'zustand';

/**
 * Zustand 기반의 모달 상태 관리 스토어
 */
const useModalStore = create((set, get) => ({

    /**
     * legacy
     */
    previousPath: '/',
    setPreviousPath: (path) => set({ previousPath: path }),

    /**
     * 모달 상태 (true = 열림, false = 닫힘)
     * @type {boolean}
     */
    modal: false,
    /**
     * 모달 상태를 토글하거나 강제로 설정, 근데 Next Modal Route 쓰면서 이거는 딱히 안쓰게됨. 지울예정
     * @param {boolean} [forceState] - true 또는 false로 강제 설정. 전달하지 않으면 현재 상태 반전
     * @param {string} [page] - (선택) 페이지 정보. 현재는 사용되지 않음
     */
    toggleModal: (forceState, page) =>
        set(() => ({
            modal:
                typeof forceState === 'boolean'
                    ? forceState
                    : !get().modal
        })),

    /**
     * 확장 상태 (true = 확장됨, false = 축소됨)
     * @type {boolean}
     */
    expand: false,

    /**
     * 확장 상태를 토글하거나 강제로 설정
     * @param {boolean} [forceState] - true 또는 false로 강제 설정. 전달하지 않으면 현재 상태 반전
     */
    toggleExpand: (forceState) =>
        set(() => ({
            expand:
                typeof forceState === 'boolean'
                    ? forceState
                    : !get().expand
        })),

    /*----------------------*
     *      Navigation      *
     *----------------------*/
    
    path: '',
    /**
     * 
     * @param {string} path 
     * @returns 
     */
    setPath: (path) =>
        set(()=>({
            path: path,
        })),
    
    depth: 0,
    /**
     * 
     * @param {number} depth 
     * @returns 
     */
    setDepth: (depth) => 
        set(()=>({
            depth: depth,
        })),

    /*----------------------*
     *      Initialize      *
     *----------------------*/
    
    init:() => 
        set(()=>({
            previousPath: "/",
            path : '',
            depth : 0
        })),
}));

export default useModalStore;
