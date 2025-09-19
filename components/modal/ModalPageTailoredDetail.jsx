import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from 'next-intl';
import { IconLoader2 } from "@tabler/icons-react";
import useToggle from "@/utils/useToggle";
import modalStore from "@/stores/modalStore";

import ModalCard from "@/components/modal/ModalCard";

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
    const [jobDetail, setJobDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/jobs/${jobId}`, {
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
        return new Date(dateString).toLocaleDateString('ko-KR', {
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
            case 'completed': return '완료';
            case 'processing': return '진행중';
            case 'failed': return '실패';
            default: return status;
        }
    };

    return (
        <>
            <ModalCard title={t('tailored_service')} desc="tailored service detail page" />
            <div className="px-3">
                {error && <div>error: {error}</div>}
                {jobDetail ? (
                    <div className="flex flex-row gap-3">
                        <div className="flex-1 w-1/2 flex flex-col gap-2">
                            <ModalBox title="Name">
                                {jobDetail.requestData?.title || 'N/A'}
                            </ModalBox>
                            <ModalBox title="created date">
                                {formatDate(jobDetail.created_at)}
                            </ModalBox>
                            <ModalBox title="current state">
                                <span className={`indicator ${getStatusIndicator(jobDetail.status)}`}>
                                    {getStatusText(jobDetail.status)}
                                </span>
                            </ModalBox>
                        </div>
                        {/* <div className="flex-1 w-1/2 flex flex-col text-xs">
                            <pre>{JSON.stringify(jobDetail, null, 2)}</pre>
                        </div> */}
                        <div className="flex-1 flex flex-col items-center justify-center bg-foreground/3 p-3 rounded-lg">
                            <IconLoader2 size="64" className="animate-spin" />
                            now processing....
                        </div>
                    </div>
                ) : (
                    <div>loading....</div>
                )}
            </div>
        </>
    )
}
export default ModalPageTailoredDetail;