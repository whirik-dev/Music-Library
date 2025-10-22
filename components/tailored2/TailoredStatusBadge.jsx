import { useTranslations } from 'next-intl';

const TailoredStatusBadge = ({ status }) => {
    const t = useTranslations('tailored');

    const statusConfig = {
        pending: {
            label: t('status_pending') || 'Pending',
            className: 'bg-zinc-500/20 border-zinc-500/30 text-zinc-300'
        },
        estimated: {
            label: t('status_estimated') || 'Estimated',
            className: 'bg-blue-500/20 border-blue-500/30 text-blue-300'
        },
        processing: {
            label: t('status_processing') || 'Processing',
            className: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300'
        },
        confirming: {
            label: t('status_confirming') || 'Confirming',
            className: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300'
        },
        completed: {
            label: t('status_completed') || 'Completed',
            className: 'bg-green-500/20 border-green-500/30 text-green-300'
        },
        cancelled: {
            label: t('status_cancelled') || 'Cancelled',
            className: 'bg-red-500/20 border-red-500/30 text-red-300'
        },
        failed: {
            label: t('status_failed') || 'Failed',
            className: 'bg-red-600/20 border-red-600/30 text-red-400'
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
