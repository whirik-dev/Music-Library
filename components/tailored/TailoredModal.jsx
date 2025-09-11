"use client"

import { motion } from "motion/react"
import { ToastContainer, toast } from 'react-toastify';
import { IconX, IconChevronLeft} from "@tabler/icons-react"
import { useTranslations } from 'next-intl';

import useTailoredStore from "@/stores/useTailoredStore";
import useUiStore from "@/stores/uiStore";

import TailoredList from "@/components/tailored/TailoredList";
import TailoredPlayer from "@/components/tailored/TailoredPlayer";
import TailoredWorksView from "@/components/tailored/TailoredWorksView";
import TailoredDetails from "@/components/tailored/TailoredDetails";
import TailoredConfirm from "@/components/tailored/TailoredConfirm";
import TailoredSubmit from "@/components/tailored/TailoredSubmit";

import Button from "@/components/ui/Button2";
import InputField from "@/components/ui/InputField";
import InputTextarea from "@/components/ui/InputTextarea";
import Divider from "@/components/ui/Divider";

/**
 * Tailored Moda의 진입점임.
 * @param {*} param0 
 * @returns 
 */
const TailoredModal = ({}) => {
    const { target,initTailoredState,works,step,setStep,detail,setDetail,currentTailoredInfo } = useTailoredStore();
    const { colorMode } = useUiStore();
    const t = useTranslations('tailored');

    function exitModalHander()
    {
        if( step === 2 || step === 3 )
        {
            if( window.confirm(t('exit_confirmation')) )
            {
                initTailoredState();
            }
        }
        else 
        {
            initTailoredState();
        }
    }

    function step1to2Handler()
    {
        if(works.length > 0)
        {
            setStep(2);
        }
        else
        {
            toast(t('please_select_works'));
        }
    }

    function step2to3Handler()
    {
        const sowItems = currentTailoredInfo.data.sow.items.length > 0; // true
        const comment1 = currentTailoredInfo.data.sow.comment1 != null; // true
        const comment2 = currentTailoredInfo.data.sow.comment2 != null;
        console.log(sowItems, comment1);
        if(sowItems && comment1)
        {
            setStep(3);
        }
        else
        {
            toast(t('please_enter_request_detail'));
        }
    }

    return (
        <>
        {target != null && (
            <div className={`z-50 flex fixed top-0 left-0 w-full h-full items-center justify-center`}>
                {/* 전역 백그라운드 */}
                <div className="absolute top-0 left-0 w-full h-full" 
                    onClick={()=>exitModalHander()}>   
                </div>
                {/* 모달창 */}
                <motion.div className={`z-51 relative w-full h-full lg:min-h-[720px] lg:max-h-[720px] 
                                ring-1 ring-zinc-800 shadow-xl bg-zinc-900/100 rounded-md backdrop-blur-md
                                overflow-y-scroll scroll-smooth
                                ${colorMode === 'dark' && 'border border-foreground/10'}
                                `}
                            initial={false}
                            animate={{
                                width: "520px"
                            }}
                            transition={{
                                type: "spring",
                                bounce: 0.55,
                            }}
                >
                    {/* id : {target} */}
                    <div className="z-50 sticky top-0 left-0 p-0 pt-1 bg-zinc-900 shadow-2xl">
                        <div className="pt-2">
                            <div className="px-3 py-0 flex flex-row justify-between items-center text-sm">

                                <div className="w-10 text-white/50 hover:text-white transition-colors duration-300 cursor-pointer">
                                {step != 1 && (
                                    <IconChevronLeft onClick={()=>setStep(step-1)}/>
                                )}
                                
                                </div>
                                <div className="font-black">
                                    {t('tailored_service')}
                                </div>

                                <div className="w-10 flex justify-end text-white/50 hover:text-white transition-colors duration-300 cursor-pointer"
                                    onClick={()=>exitModalHander()}
                                >
                                    <IconX />
                                </div>
                            </div>
                        </div>
                        <TailoredPlayer id={target}/>
                    </div>
                    
                    {/* 스텝1 - 리스트 표시  */}
                    {step === 1 && (
                        <div className="m-2">
                            <TailoredList />
                             {/* TODO: 현상황에서 리스트가 길어지면 스크롤 내려야 버튼이 보임 이거 좀 아닌거같음 해결해야함 */}
                            <Button name={t('next_step')} onClick={()=>step1to2Handler()}/>
                        </div>
                    )}

                    {/* 스텝2 - 요청사항 입력 */}
                    {step === 2 && (
                        <div className="m-2">
                            <div className="flex flex-col gap-2">
                                <TailoredWorksView />
                                {/* <Divider name="" /> */}
                                
                                <TailoredDetails />
                                {/* <Button name="prev step" onClick={()=>setStep(1)}/> */}
                                <Button name={t('request')} onClick={()=>step2to3Handler()}/>
                            </div>
                        </div>
                    )}

                    {/* 스텝3 - 요청사항 확인 */}
                    {step === 3 && (
                        <div className="m-2">
                            <div className="flex flex-col gap-2">

                                <TailoredWorksView />
                                {/* <Divider name="" /> */}
                                <TailoredConfirm />
                                <Button name={t('modify')} onClick={()=>setStep(2)}/>
                                <Button name={t('submit')} onClick={()=>setStep(4)}/>
                            </div>
                        </div>
                    )}

                    {/* 스텝4 - 결제 및 확인 */}
                    {step === 4 && (
                        <div className="m-2">
                            <div className="flex flex-col gap-2">
                                <TailoredSubmit />
                                {/* <Button name="완료" onClick={()=>exitModalHander()}/> */}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        )}
        </>
    )
}
export default TailoredModal;