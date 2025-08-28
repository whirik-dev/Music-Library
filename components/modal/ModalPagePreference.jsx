import useToggle from "@/utils/useToggle";

import Button from "@/components/ui/Button";
import ModalCard from "@/components/modal/ModalCard";

import useModalStore from "@/stores/modalStore";
import useUiStore from "@/stores/uiStore";

const ModalPagePreference = ({}) => {

    useToggle(
        () => {
            setDepth(1);
        }
    );

    const { setPath, setDepth } = useModalStore();
    const { colorMode, setColorMode } = useUiStore();
    const method = 'local account';
    return (
        <>
            <ModalCard title="Signin Method" desc={`Sign in as ${method}`} />
            {/* <ModalCard title="Change Signin Method" desc="Sign in as Google account" 
            type="action" action="change"/> */}

            <hr className={`mx-3 border-zinc-800`}/>

            <ModalCard title="Add Channel" desc="You are currently registered for 3 platforms." 
                       type="action" action="add" onClick={()=>{setPath('preference/channelManage')}}/>

            <hr className={`mx-3 border-zinc-800`}/>

            <ModalCard title="Favorite List" desc="amu seomyeong neo eot sumnidap" 
                       type="action" action="view" onClick={()=>{setPath('preference/favoriteList')}}/>
            <ModalCard title="Download History" desc="amu seomyeong neo eot sumnidap" 
                       type="action" action="view" onClick={()=>{setPath('preference/downloadHistory')}}/>
            {/* <Button name="btn" href="/" /> */}

            <hr className={`mx-3 border-zinc-800`}/>


            <ModalCard 
                title="Change Theme" 
                desc={`enable ${colorMode === 'dark' ? 'light mode' : 'dark mode'}`} 
                type="toggle" 
                action={colorMode} 
                onClick={()=>{
                    const newMode = colorMode === 'dark' ? 'light' : 'dark';
                    setColorMode(newMode);
                    localStorage.setItem('colorMode', newMode);
                }}
            />

            <div className="px-3 text-zinc-600">
                Terms
            </div>
        </>
    )
}
export default ModalPagePreference;