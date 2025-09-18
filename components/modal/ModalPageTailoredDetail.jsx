import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from 'next-intl';
import useToggle from "@/utils/useToggle";
import modalStore from "@/stores/modalStore";

import ModalCard from "@/components/modal/ModalCard";

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
            <ModalCard title={t('tailored_service')} desc="작업 상세 정보" />
            <div className="px-3">
                {loading && <div>로딩 중...</div>}
                {error && <div>오류: {error}</div>}
                {jobDetail && <pre>{JSON.stringify(jobDetail, null, 2)}</pre>}
            </div>
        </>
    )
}
export default ModalPageTailoredDetail;