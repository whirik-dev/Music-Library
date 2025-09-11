import { useTranslations } from 'next-intl';
import useToggle from "@/utils/useToggle";

import Button from "@/components/ui/Button";
import ModalCard from "@/components/modal/ModalCard";

import useModalStore from "@/stores/modalStore";
import useUiStore from "@/stores/uiStore";

const ModalPagePreference = ({}) => {
    const t = useTranslations('modal');

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
            <ModalCard title={t('signin_method')} desc={t('sign_in_as', { method })} />
            {/* <ModalCard title={t('change_signin_method')} desc={t('sign_in_as_google')} 
            type="action" action="change"/> */}

            <hr className={`mx-3 border-zinc-800`}/>

            <ModalCard title={t('add_channel')} desc={t('you_are_registered', { count: 3 })} 
                       type="action" action="add" onClick={()=>{setPath('preference/channelManage')}}/>

            <hr className={`mx-3 border-zinc-800`}/>

            <ModalCard title={t('favorite_list')} desc={t('favorite_list')} 
                       type="action" action="view" onClick={()=>{setPath('preference/favoriteList')}}/>
            <ModalCard title={t('download_history')} desc={t('download_history')} 
                       type="action" action="view" onClick={()=>{setPath('preference/downloadHistory')}}/>
            {/* <Button name="btn" href="/" /> */}

            <hr className={`mx-3 border-zinc-800`}/>


            <ModalCard 
                title={t('change_theme')} 
                desc={t('enable_mode', { mode: colorMode === 'dark' ? t('light_mode') : t('dark_mode') })} 
                type="toggle" 
                action={colorMode} 
                onClick={()=>{
                    const newMode = colorMode === 'dark' ? 'light' : 'dark';
                    setColorMode(newMode);
                    localStorage.setItem('colorMode', newMode);
                }}
            />

            <div className="px-3 text-zinc-600">
                {t('terms')}
            </div>
        </>
    )
}
export default ModalPagePreference;