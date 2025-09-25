import { IconScissors } from "@tabler/icons-react"

import useTailoredStore from "@/stores/useTailoredStore";
import useAuthStore from "@/stores/authStore";

const DownloadBtn = ({ id }) => {
    const { target, setTarget, setStep, addWorks, works } = useTailoredStore();
    const { toggleAuthModal, isLogged } = useAuthStore();

    const handleTailoredToggle = (id) => {

        // 로그인 했는지 안했는지
        if(!isLogged)
        {
            toggleAuthModal();
            return;
        }
    
        TailoredHandler(id);
        setStep(1);
        addWorks("work-d-1");
        console.log(works);
    }

    function TailoredHandler(id){
        if(target === null )
        {
            setTarget(id);
        }
        else
        {
            console.log('tailored target aleady exist');
        }
    }

    return (
        <div className="cursor-pointer hover:opacity-50" onClick={()=>handleTailoredToggle(id)}>
            <IconScissors size="18"  />
        </div>
    )
}
export default DownloadBtn;