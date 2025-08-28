
import modalStore from "@/stores/modalStore";
/**
 * 모달 내비게이션 요소 컴포넌트
 *
 * @component
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.name - 내비게이션 항목 이름 (표시될 텍스트)
 * @param {string} props.href - 이동할 링크 경로
 * @param {boolean} props.active - 현재 활성화된 항목 여부
 * @returns {JSX.Element} 렌더링된 내비게이션 요소
 */
const ModalNavElem = ({ name, href }) => {
    const { path, setPath, depth, setDepth} = modalStore();
    
    function pageHandler(href){
        setPath(href);
    }
    const active = depth === 1 ? path === href : path.split('/')[0] === href;
    return (
        <div className={`transition-all duration-300 ${active && "mr-0"}`}
             onClick={()=>pageHandler(href)}>
            <div className={`cursor-pointer font-bold capitalize transition-all duration-300 ${active ? "text-foreground" : "text-foreground/30"}`}>
                {name}
            </div>
        </div>
    );
};
export default ModalNavElem;