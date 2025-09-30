import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from 'next-intl';
import {
    IconLoader2,
    IconHandClick,
    IconCalculator,
    IconSettings,
    IconCheck,
    IconCircleCheck
} from "@tabler/icons-react";
import useToggle from "@/utils/useToggle";
import modalStore from "@/stores/modalStore";
import useAuthStore from "@/stores/authStore";

import ModalCard from "@/components/modal/ModalCard";

import TailoredDetailEstimate from "@/components/modal/partials/TailoredDetailEstimate";
import TailoredDetailResult from "@/components/modal/partials/TailoredDetailResult";
import TailoredDetailCancelled from "@/components/modal/partials/TailoredDetailCancelled";
import TailoredDetailPending from "@/components/modal/partials/TailoredDetailPending";
import TailoredDetailProcessing from "@/components/modal/partials/TailoredDetailProcessing";
import TailoredDetailCompleted from "@/components/modal/partials/TailoredDetailCompleted";
import TailoredDetailFail from "@/components/modal/partials/TailoredDetailFail";

const ModalBox = ({ children, title }) => {
    return (
        <div className="bg-foreground/3 p-3 rounded-lg">
            <div className="capitalize font-bold">
                {title}
            </div>
            <div className="asd text-xs">
                {children}
            </div>
        </div>
    )
}

const ModalPageTailoredDetail = ({ }) => {
    const t = useTranslations('modal');
    const { data: session } = useSession();
    const { credits } = useAuthStore();
    const [jobDetail, setJobDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const timelineSteps = [
        {
            id: 'offer',
            label: 'offer',
            icon: IconHandClick,
            bgColor: 'bg-purple-500',
            rounded: 'rounded-l-full'
        },
        {
            id: 'estimate',
            label: 'estimate',
            icon: IconCalculator,
            bgColor: 'bg-purple-500',
            rounded: ''
        },
        {
            id: 'processing',
            label: 'processing',
            icon: IconSettings,
            bgColor: 'bg-foreground/10',
            rounded: ''
        },
        {
            id: 'confirming',
            label: 'confirm',
            icon: IconCheck,
            bgColor: 'bg-foreground/10',
            rounded: ''
        },
        {
            id: 'done',
            label: 'done',
            icon: IconCircleCheck,
            bgColor: 'bg-foreground/10',
            rounded: 'rounded-r-full'
        }
    ];

    useToggle(
        () => {
            toggleExpand();
            setDepth(2);
        },
        () => {
            toggleExpand();
        }
    );

    const { toggleExpand, setDepth, modalParameter } = modalStore();

    const fetchJobDetail = async (jobId) => {
        if (!session?.user?.ssid || !jobId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tailored/detail/${jobId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.ssid}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setJobDetail(data.data);
            } else {
                throw new Error(data.message || 'Failed to fetch job detail');
            }
        } catch (err) {
            console.error('Error fetching job detail:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (modalParameter && session?.user?.ssid) {
            fetchJobDetail(modalParameter);
        }
    }, [modalParameter, session]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusIndicator = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'processing': return 'warning';
            case 'failed': return 'error';
            default: return 'off';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'completed': return 'Done';
            case 'processing': return 'in Progress';
            case 'failed': return 'closed';
            default: return status;
        }
    };

    const getCurrentStepIndex = (status) => {
        switch (status) {
            case 'pending': return 0;        // offer 단계
            case 'estimated': return 1;      // estimate 단계  
            case 'processing': return 2;     // processing 단계
            case 'confirming': return 3;        // confirm 단계
            case 'completed': return 4;      // done 단계
            case 'failed': return 2;         // processing에서 실패
            case 'cancelled': return 0;      // 취소된 경우
            default: return 0;
        }
    };

    const getStepStatus = (stepIndex, currentStepIndex, jobStatus) => {
        if (jobStatus === 'failed' || jobStatus === 'cancelled') {
            return stepIndex <= currentStepIndex ? 'failed' : 'inactive';
        }

        if (stepIndex < currentStepIndex) {
            return 'completed';
        } else if (stepIndex === currentStepIndex) {
            return 'current';
        } else {
            return 'inactive';
        }
    };

    const getStepStyles = (status) => {
        switch (status) {
            case 'completed':
                return {
                    bgColor: 'bg-purple-400',
                    iconColor: 'text-purple-500',
                    textColor: 'text-foreground/50'
                };
            case 'current':
                return {
                    bgColor: 'bg-gradient-to-r from-purple-400 via-red-400 to-orange-500',
                    iconColor: 'text-orange-500',
                    textColor: 'text-foreground'
                };
            case 'failed':
                return {
                    bgColor: 'bg-red-500',
                    iconColor: 'text-red-500',
                    textColor: 'text-red-500'
                };
            default:
                return {
                    bgColor: 'bg-foreground/10',
                    iconColor: 'text-foreground/30',
                    textColor: 'text-foreground/30'
                };
        }
    };

    const handleJobUpdate = () => {
        // 잡 상태가 변경되었을 때 다시 데이터를 가져옴
        if (modalParameter) {
            fetchJobDetail(modalParameter);
        }
    };

    function formatSowText(jobDetail) {
        if (!jobDetail?.requirements?.sow) return '';

        const sow = jobDetail.requirements.sow;
        const itemsText = sow.items?.map(item =>
            `<${item.pos1} - ${item.pos2}> ${item.comment}`
        ).join('\n') || '';

        return `${itemsText}\n\n${sow.comment1 || ''}`;
    }

    return (
        <>
            <ModalCard title={t('tailored_service')} desc="tailored service detail page" />
            <div className="px-3">
                {error && <div>error: {error}</div>}
                {jobDetail ? (
                    <>
                        {jobDetail.status === 'failed' ? (
                            <TailoredDetailFail id={jobDetail.job_id} />
                        ) : (
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col">
                                    <div className="bg-foreground/3 p-3 flex flex-row">
                                        {timelineSteps.map((step, index) => {
                                            const IconComponent = step.icon;
                                            const currentStepIndex = getCurrentStepIndex(jobDetail.status);
                                            const stepStatus = getStepStatus(index, currentStepIndex, jobDetail.status);
                                            const styles = getStepStyles(stepStatus);

                                            return (
                                                <div key={step.id} className="flex-1">
                                                    <div className="flex flex-col gap-3 items-center justify-center">
                                                        {jobDetail.status === 'processing' && step.id === 'processing' ? (
                                                            <IconLoader2 className={`animate-spin ${styles.iconColor}`} size="24" />
                                                        ) : (
                                                            <IconComponent className={styles.iconColor} />
                                                        )}
                                                        <div className={`text-sm capitalize ${styles.textColor}`}>
                                                            {step.label}
                                                        </div>
                                                        <div className={`w-full h-1 ${styles.bgColor} ${step.rounded}`} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="flex flex-row gap-3">
                                    <div className="flex-1 w-1/2 flex flex-col gap-2">
                                        <ModalBox title="Name">
                                            {jobDetail.title || 'N/A'}
                                        </ModalBox>
                                        <ModalBox title="created date">
                                            {formatDate(jobDetail.created_at)}
                                        </ModalBox>
                                    </div>
                                    {/* <div className="flex-1 w-1/2 flex flex-col text-xs">
                                        <pre>{JSON.stringify(jobDetail, null, 2)}</pre>
                                    </div> */}
                                    <div className="flex-1 flex flex-col bg-foreground/3 p-3 rounded-lg">
                                        {/* <IconLoader2 size="64" className="animate-spin" /> */}
                                        Request Details
                                        <textarea value={formatSowText(jobDetail)} className="bg-foreground/3 py-1 px-2 text-sm text-foreground/50 rounded-md h-full mt-2" disabled />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {jobDetail.status === 'estimated' && (
                                        <TailoredDetailEstimate
                                            id={jobDetail.job_id}
                                            onJobUpdate={handleJobUpdate}
                                            jobDetail={jobDetail}
                                            userBalance={credits || 0}
                                        />
                                    )}
                                    {jobDetail.status === 'confirm' && (
                                        <TailoredDetailResult 
                                            id={jobDetail.job_id} 
                                            onJobUpdate={handleJobUpdate}
                                        />
                                    )}
                                    {jobDetail.status === 'cancelled' && (
                                        <TailoredDetailCancelled />
                                    )}
                                    {jobDetail.status === 'pending' && (
                                        <TailoredDetailPending id={jobDetail.job_id} />
                                    )}
                                    {jobDetail.status === 'processing' && (
                                        <TailoredDetailProcessing id={jobDetail.job_id} />
                                    )}
                                    {jobDetail.status === 'completed' && (
                                        <TailoredDetailCompleted id={jobDetail.job_id} />
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div>loading....</div>
                )}
            </div>
        </>
    )
}
export default ModalPageTailoredDetail;