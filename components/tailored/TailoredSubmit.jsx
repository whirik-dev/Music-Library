"use client"
import { useState, useEffect } from "react"
import { IconLoader2, IconCheck, IconX } from "@tabler/icons-react";
import { useJWTAuth } from "@/hooks/useJWTAuth";

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
                Tailored 작업 발행이 완료되었습니다.
                <div className="flex flex-row gap-3 mt-10 justify-center">
                    <Button name="작업목록 보기" onClick={jobsListHandler} className="min-w-34" />
                    <Button name="닫기" onClick={initTailoredState} className="min-w-34" />
                </div>
            </div>
        </div>
    )
}

const ErrorJobs = ({ status }) => {
    const { initTailoredState } = useTailoredStore();

    return (
        <div className="aspect-square flex flex-col items-center justify-center gap-5">
            <IconX size="72" className="text-red-500" />
            <div className="text-sm mt-8 text-center">
                {status}
                <div className="flex flex-row gap-3 mt-10 justify-center">
                    <Button name="다시 시도" onClick={() => window.location.reload()} className="min-w-34" />
                    <Button name="닫기" onClick={initTailoredState} className="min-w-34" />
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
    const { data: session, status } = useJWTAuth();

    useEffect(() => {
        setCurrentStatus("요청하신 Tailored 작업을 발행 중 입니다.");

        // Jobs API 요청
        const submitTailoredJob = async () => {
            try {
                setCurrentStatus("Tailored 요청사항을 검토하는중...");

                // 1~7초 랜덤 지연
                const randomDelay = Math.floor(Math.random() * 7000) + 1000; // 1000ms ~ 7000ms

                await new Promise(resolve => setTimeout(resolve, randomDelay));

                setCurrentStatus("Tailored 작업을 서버에 전송 중...");
                
                await new Promise(resolve => setTimeout(resolve, randomDelay));

                // currentTailoredInfo.data의 내용만 body로 전송
                const requestBody = currentTailoredInfo?.data || {};

                const response = await fetch('/api/jobs/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify(requestBody)
                });

                const result = await response.json();

                if (!response.ok) {
                    // 에러 응답 처리
                    if (response.status === 400) {
                        const errorMessages = result.errors?.map(err => err.message).join(', ') || result.message;
                        setCurrentStatus(`검증 오류: ${errorMessages}`);
                    } else if (response.status === 401) {
                        setCurrentStatus("인증이 필요합니다. 다시 로그인해주세요.");
                    } else if (response.status === 502) {
                        setCurrentStatus("서비스 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
                    } else if (response.status === 503) {
                        setCurrentStatus("서비스가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.");
                    } else {
                        setCurrentStatus(`작업 발행 실패: ${result.message || '알 수 없는 오류'}`);
                    }
                    setJobState("error");
                    return;
                }

                // 성공 응답 처리
                if (result.success) {
                    setCurrentStatus("Tailored 작업이 성공적으로 발행되었습니다.");
                    setJobState("success");
                    console.log('Job created successfully:', result.data);
                } else {
                    setCurrentStatus(`작업 발행 실패: ${result.message}`);
                    setJobState("error");
                }

            } catch (error) {
                console.error('네트워크 오류:', error);
                setCurrentStatus("네트워크 오류가 발생했습니다. 연결을 확인하고 다시 시도해주세요.");
                setJobState("error");
            }
        };

        submitTailoredJob();
    }, [currentTailoredInfo]);

    return (
        <>
            {jobState === "success" && (
                <SuccessJobs status={currentStatus} />
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