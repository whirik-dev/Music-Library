"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from 'next-intl';
import { IconChevronLeft, IconMusic, IconUpload, IconCheck } from "@tabler/icons-react";

import Footer from "@/components/ui/Footer";
import Button from "@/components/ui/Button2";
import TailoredRequestTypeSelector from "@/components/tailored2/TailoredRequestTypeSelector";
import TailoredMusicSelector from "@/components/tailored2/TailoredMusicSelector";
import TailoredFileUploader from "@/components/tailored2/TailoredFileUploader";
import TailoredR2FileUploader from "@/components/tailored2/TailoredR2FileUploader";
import TailoredRequestForm from "@/components/tailored2/TailoredRequestForm";
import TailoredUploadRequestForm from "@/components/tailored2/TailoredUploadRequestForm";
import TailoredRequestConfirm from "@/components/tailored2/TailoredRequestConfirm";

export default function TailoredNewPage() {
    const t = useTranslations('tailored');
    const router = useRouter();
    const searchParams = useSearchParams();
    const [step, setStep] = useState(2); // 1: 타입선택, 2: 음악선택/업로드, 3: 요청사항입력
    const [requestType, setRequestType] = useState('upload'); // 'service' or 'upload' - 기본값 upload
    const [selectedMusic, setSelectedMusic] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [musicTitle, setMusicTitle] = useState('');
    const [requestData, setRequestData] = useState({
        title: '',
        items: [],
        comment1: '',
        comment2: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'
    const [submitMessage, setSubmitMessage] = useState('');

    // URL 파라미터에서 음악 ID 확인 (다른 페이지에서 직접 연결된 경우)
    useEffect(() => {
        const musicId = searchParams.get('musicId');
        if (musicId) {
            // 서비스 음악으로 자동 설정
            setRequestType('service');
            setSelectedMusic({ id: musicId });
            
            // 음악 정보 가져오기
            fetchMusicTitle(musicId);
            
            setStep(3); // 바로 요청사항 입력 단계로
        } else {
            // musicId가 없으면 업로드 화면으로 (기본값)
            setRequestType('upload');
            setStep(2);
        }
    }, [searchParams]);

    // 음악 제목 가져오기
    const fetchMusicTitle = async (musicId) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/music/${musicId}`);
            if (response.ok) {
                const data = await response.json();
                const title = data.data?.metadata?.find(item => item.type === 'title')?.content || '';
                setMusicTitle(`Tailored Jobs - ${title}`);
            }
        } catch (error) {
            console.error('Failed to fetch music title:', error);
            setMusicTitle(`Tailored Jobs - ${musicId.slice(-6)}`);
        }
    };

    const handleBack = () => {
        if (step === 1) {
            router.push('/tailored');
        } else {
            setStep(step - 1);
        }
    };

    const handleTypeSelect = (type) => {
        setRequestType(type);
        setStep(2);
    };

    const handleMusicSelect = async (music) => {
        setSelectedMusic(music);
        
        // 음악 제목 가져오기
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/music/${music.id}`);
            if (response.ok) {
                const data = await response.json();
                const title = data.data?.metadata?.find(item => item.type === 'title')?.content || '';
                setMusicTitle(`Tailored Jobs - ${title}`);
            } else {
                setMusicTitle(`Tailored Jobs - ${music.id.slice(-6)}`);
            }
        } catch (error) {
            console.error('Failed to fetch music title:', error);
            setMusicTitle(`Tailored Jobs - ${music.id.slice(-6)}`);
        }
        
        setStep(3);
    };

    const handleFileUpload = (file) => {
        setUploadedFile(file);
        // 파일 업로드 시 파일명 기반 제목
        const fileName = file.name.replace(/\.[^/.]+$/, ''); // 확장자 제거
        setMusicTitle(`Tailored Jobs - ${fileName}`);
        setStep(3);
    };

    const handleR2UploadComplete = (uploadedFiles) => {
        setUploadedFile(uploadedFiles); // 배열로 저장
        setStep(3);
    };

    const handleRequestSubmit = async (data) => {
        setRequestData(data);
        setIsSubmitting(true);
        setSubmitStatus(null);
        setSubmitMessage('');

        try {
            const session = await fetch('/api/auth/session').then(res => res.json());
            if (!session?.user?.ssid) {
                setSubmitStatus('error');
                setSubmitMessage('Please login first');
                setTimeout(() => router.push('/'), 2000);
                return;
            }

            // API 요청 데이터 구성
            const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
            const musicId = requestType === 'service' ? selectedMusic?.id : null;
            
            const requestBody = {
                title: data.title,
                director: 'api@whirik.com',
                'music-genre': ['Tailored Service'],
                'due-date': threeDaysLater.toISOString(),
                invisible: true,
                sow: {
                    items: [
                        {
                            pos1: '00:00.00',
                            pos2: '00:00.00',
                            comment: data.comment1 // 상세 요청사항을 comment로
                        }
                    ],
                    comment1: data.comment1,
                    comment2: data.comment2 || t('whirik_reference_work') || 'Reference work for tailored service'
                }
            };

            // 서비스 음악 선택 시 ref-music 추가
            if (musicId) {
                requestBody['ref-music'] = `https://${process.env.NEXT_PUBLIC_ASSET_SERVER}/${musicId}?r=preview`;
            }
            
            // 업로드된 파일이 있는 경우 (R2 업로드)
            if (requestType === 'upload' && data.uploadedFiles && data.uploadedFiles.length > 0) {
                // 첫 번째 파일의 공개 URL 사용
                requestBody['ref-music'] = data.uploadedFiles[0].publicUrl;
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/tailored/create`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.user.ssid}`
                    },
                    body: JSON.stringify(requestBody)
                }
            );

            const responseData = await response.json();
            
            if (responseData.success) {
                setSubmitStatus('success');
                setSubmitMessage('Your tailored request has been submitted successfully!');
                // 2초 후 목록으로 이동
                setTimeout(() => router.push('/tailored'), 2000);
            } else {
                throw new Error(responseData.message || 'Failed to create request');
            }
        } catch (error) {
            console.error('Failed to submit request:', error);
            setSubmitStatus('error');
            setSubmitMessage(error.message || 'Failed to submit request. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStepTitle = () => {
        if (isSubmitting) return t('submitting') || 'Submitting...';
        if (submitStatus === 'success') return t('submit_success') || 'Success!';
        if (submitStatus === 'error') return t('submit_error') || 'Error';

        switch (step) {
            case 1:
                return t('select_request_type') || '요청 유형 선택';
            case 2:
                return requestType === 'service' 
                    ? t('select_music') || '음악 선택'
                    : t('upload_music') || '음악 업로드';
            case 3:
                return t('enter_request_details') || '요청사항 입력';
            default:
                return '';
        }
    };

    return (
        <div className="min-h-screen w-full">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleBack}
                            className="text-zinc-400 hover:text-white transition-colors"
                        >
                            <IconChevronLeft size={24} />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-white">
                                {t('new_request') || '새 요청'}
                            </h1>
                            <p className="text-sm text-zinc-500 mt-1">
                                {getStepTitle()}
                            </p>
                        </div>
                        {/* Progress Indicator */}
                        {!isSubmitting && !submitStatus && (
                            <div className="flex items-center gap-2">
                                {[1, 2, 3].map((s) => (
                                    <div
                                        key={s}
                                        className={`w-2 h-2 rounded-full transition-colors ${
                                            s <= step ? 'bg-purple-500' : 'bg-zinc-700'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Submitting or Result Status */}
                {(isSubmitting || submitStatus) ? (
                    <TailoredRequestConfirm
                        isSubmitting={isSubmitting}
                        status={submitStatus}
                        message={submitMessage}
                    />
                ) : (
                    <>
                        {/* Step 1: Request Type Selection */}
                        {step === 1 && (
                            <TailoredRequestTypeSelector onSelect={handleTypeSelect} />
                        )}

                        {/* Step 2: Music Selection or Upload */}
                        {step === 2 && (
                            <>
                                {requestType === 'service' ? (
                                    <TailoredMusicSelector onSelect={handleMusicSelect} />
                                ) : (
                                    <TailoredR2FileUploader 
                                        onUploadComplete={handleR2UploadComplete}
                                        onBack={() => setStep(1)}
                                    />
                                )}
                            </>
                        )}

                        {/* Step 3: Request Form */}
                        {step === 3 && (
                            <>
                                {requestType === 'service' ? (
                                    <TailoredRequestForm
                                        music={selectedMusic}
                                        file={null}
                                        musicTitle={musicTitle}
                                        onSubmit={handleRequestSubmit}
                                        onBack={() => setStep(2)}
                                    />
                                ) : (
                                    <TailoredUploadRequestForm
                                        uploadedFiles={uploadedFile}
                                        onSubmit={handleRequestSubmit}
                                        onBack={() => setStep(2)}
                                    />
                                )}
                            </>
                        )}
                    </>
                )}
            </div>

            <Footer />
        </div>
    );
}
