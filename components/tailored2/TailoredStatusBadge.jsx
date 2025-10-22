import { useTranslations } from 'next-intl';

const TailoredStatusBadge = ({ status }) => {
    const t = useTranslations('tailored');

    const statusConfig = {
        pending: {
            label: t('status_pending') || '대기 중',
            className: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300'
        },
        in_progress: {
            label: t('status_in_progress') || '진행 중',
            className: 'bg-blue-500/20 border-blue-500/30 text-blue-300'
        },
        completed: {
            label: t('status_completed') || '완료',
            className: 'bg-green-500/20 border-green-500/30 text-green-300'
        },
        cancelled: {
            label: t('status_cancelled') || '취소됨',
            className: 'bg-red-500/20 border-red-500/30 text-red-300'
        }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
        <span className={`inline-block px-3 py-1 border rounded-full text-xs font-medium ${config.className}`}>
            {config.label}
        </span>
    );
};

export default TailoredStatusBadge;
