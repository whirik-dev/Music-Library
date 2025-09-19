"use client"
import { useState, useEffect } from "react"
import { IconLoader2, IconCheck, IconX } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { useTranslations } from 'next-intl';

import useTailoredStore from "@/stores/useTailoredStore";
import useModalStore from "@/stores/modalStore";
import useAuthStore from "@/stores/authStore";

import Button from "@/components/ui/Button2";
import InputField from "@/components/ui/InputField";
import InputTextarea from "@/components/ui/InputTextarea";

const ProcessingJobs = ({ status }) => {
    return (
        <div className="aspect-square flex flex-col items-center justify-center gap-5">
            <IconLoader2 size="72" className="animate-spin" />
            <div className="text-sm">
                {status}
            </div>
        </div>
    )
}

const SuccessJobs = ({ status }) => {
    const { initTailoredState } = useTailoredStore();
    const { toggleModal, setPath, setDepth } = useModalStore();
    const t = useTranslations('tailored');

    const jobsListHandler = () => {
        initTailoredState();
        setPath('tailored');
        setDepth(1);
        toggleModal();
    };

    return (
        <div className="aspect-square flex flex-col items-center justify-center gap-5">
            <IconCheck size="72" className="text-green-500" />
            <div className="text-sm mt-8 text-center">
                {t('tailored_work_completed')}
                <div className="flex flex-row gap-3 mt-10 justify-center">
                    <Button name={t('view_job_list')} onClick={jobsListHandler} className="min-w-34" />
                    <Button name={t('close')} onClick={initTailoredState} className="min-w-34" />
                </div>
            </div>
        </div>
    )
}

const ErrorJobs = ({ status }) => {
    const { initTailoredState } = useTailoredStore();
    const t = useTranslations('tailored');

    return (
        <div className="aspect-square flex flex-col items-center justify-center gap-5">
            <IconX size="72" className="text-red-500" />
            <div className="text-sm mt-8 text-center">
                {status}
                <div className="flex flex-row gap-3 mt-10 justify-center">
                    <Button name={t('try_again')} onClick={() => window.location.reload()} className="min-w-34" />
                    <Button name={t('close')} onClick={initTailoredState} className="min-w-34" />
                </div>
            </div>
        </div>
    )
}

const CommingSoon = ({}) => {
    const { initTailoredState } = useTailoredStore();
    const { toggleModal, setPath, setDepth } = useModalStore();
    const t = useTranslations('tailored');

    const jobsListHandler = () => {
        initTailoredState();
        setPath('tailored');
        setDepth(1);
        toggleModal();
    };
    return (
        <div className="aspect-square flex flex-col items-center justify-center gap-5">
            <IconCheck size="72" className="text-green-500" />
            <div className="text-sm mt-8 text-center">
                {t('tailored_work_completed')} <br />
                <div className="opacity-50">
                    (preview mode)
                </div>
                <div className="flex flex-row gap-3 mt-10 justify-center">
                    <Button name={t('view_job_list')} onClick={jobsListHandler} className="min-w-34" />
                    <Button name={t('close')} onClick={initTailoredState} className="min-w-34" />
                </div>
            </div>
        </div>
    )
}

const TailoredSubmit = () => {
    const { currentTailoredInfo } = useTailoredStore();
    const { userInfo } = useAuthStore();
    const [currentStatus, setCurrentStatus] = useState("");
    const [jobState, setJobState] = useState("processing"); // processing, success, error
    const { data: session, status } = useSession();
    const t = useTranslations('tailored');

    useEffect(() => {
        setCurrentStatus(t('tailored_request_being_processed'));

        // Jobs API 요청
        const submitTailoredJob = async () => {
            try {
                setCurrentStatus(t('reviewing_tailored_request'));

                // 1~7초 랜덤 지연
                const randomDelay = Math.floor(Math.random() * 7000) + 1000; // 1000ms ~ 7000ms

                await new Promise(resolve => setTimeout(resolve, randomDelay));

                setCurrentStatus(t('sending_tailored_work'));
                
                await new Promise(resolve => setTimeout(resolve, randomDelay));

                // currentTailoredInfo.data의 내용만 body로 전송
                const requestBody = currentTailoredInfo?.data || {};

                const response = await fetch('http://localhost:3030/jobs/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.user.ssid}`
                    },
                    body: JSON.stringify(requestBody)
                });

                const result = await response.json();

                if (!response.ok) {
                    // 에러 응답 처리
                    if (response.status === 400) {
                        const errorMessages = result.errors?.map(err => err.message).join(', ') || result.message;
                        setCurrentStatus(`${t('validation_error')}: ${errorMessages}`);
                    } else if (response.status === 401) {
                        setCurrentStatus(t('authentication_required'));
                    } else if (response.status === 502) {
                        setCurrentStatus(t('service_connection_failed'));
                    } else if (response.status === 503) {
                        setCurrentStatus(t('service_temporarily_unavailable'));
                    } else {
                        setCurrentStatus(`${t('work_publication_failed')}: ${result.message || t('unknown_error')}`);
                    }
                    setJobState("error");
                    return;
                }

                // 성공 응답 처리
                if (result.success) {
                    setCurrentStatus(t('tailored_work_published_successfully'));
                    setJobState("success");
                    console.log('Job created successfully:', result.data);
                } else {
                    setCurrentStatus(`${t('work_publication_failed')}: ${result.message}`);
                    setJobState("error");
                }

            } catch (error) {
                console.error('네트워크 오류:', error);
                setCurrentStatus(t('network_error'));
                setJobState("error");
            }
        };

        submitTailoredJob();
    }, [currentTailoredInfo]);

    return (
        <>
            {jobState === "success" && (
                // <SuccessJobs status={currentStatus} />
                <CommingSoon />
            )}
            {jobState === "error" && (
                <ErrorJobs status={currentStatus} />
            )}
            {jobState === "processing" && (
                <ProcessingJobs status={currentStatus} />
            )}
        </>
    )
}

export default TailoredSubmit;