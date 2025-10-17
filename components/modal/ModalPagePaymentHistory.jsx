import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import useToggle from "@/utils/useToggle";
import modalStore from "@/stores/modalStore";

import ModalCard from "@/components/modal/ModalCard";

const PaymentHistoryItem = ({ type, data, onViewDetails }) => {
    const t = useTranslations('modal');

    if (type === "head") {
        return (
            <div className="border-b-2 border-foreground/20">
                <div className="flex flex-row w-full py-3 text-foreground font-semibold text-sm">
                    <div className="w-1/5">{t('date')}</div>
                    <div className="w-1/5">{t('order_id')}</div>
                    <div className="w-1/5">{t('amount')}</div>
                    <div className="w-1/5">{t('status')}</div>
                    <div className="w-1/5 text-right">{t('actions')}</div>
                </div>
            </div>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    const formatAmount = (amount) => {
        if (!amount) return '-';
        return `₩${Number(amount).toLocaleString('ko-KR')}`;
    };

    const getStatusText = (status) => {
        const statusMap = {
            'DONE': t('status_done'),
            'CANCELED': t('status_canceled'),
            'PARTIAL_CANCELED': t('status_partial_canceled'),
            'WAITING_FOR_DEPOSIT': t('status_waiting'),
            'ABORTED': t('status_aborted'),
            'EXPIRED': t('status_expired')
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status) => {
        if (status === 'DONE') return 'text-green-600 dark:text-green-400';
        if (status === 'CANCELED' || status === 'ABORTED' || status === 'EXPIRED') return 'text-red-600 dark:text-red-400';
        if (status === 'PARTIAL_CANCELED') return 'text-orange-600 dark:text-orange-400';
        return 'text-gray-600 dark:text-gray-400';
    };

    return (
        <div className="border-b border-foreground/10 hover:bg-foreground/5 transition-colors">
            <div className="flex flex-row w-full py-3 text-sm">
                <div className="w-1/5 text-foreground/70">
                    {formatDate(data.approvedAt || data.requestedAt)}
                </div>
                <div className="w-1/5 text-foreground/70 truncate" title={data.orderId}>
                    {data.orderId}
                </div>
                <div className="w-1/5 text-foreground font-medium">
                    {formatAmount(data.amount)}
                </div>
                <div className={`w-1/5 font-medium ${getStatusColor(data.status)}`}>
                    {getStatusText(data.status)}
                </div>
                <div className="w-1/5 text-right">
                    <button
                        onClick={() => onViewDetails(data)}
                        className="text-xs px-3 py-1 rounded bg-foreground/10 hover:bg-foreground/20 transition-colors"
                    >
                        {t('view_details')}
                    </button>
                </div>
            </div>
            {data.cancellations && data.cancellations.length > 0 && (
                <div className="px-4 pb-3">
                    <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                        {t('canceled_info')}: {formatAmount(data.cancellations[0].cancelAmount)} - {data.cancellations[0].cancelReason}
                    </div>
                </div>
            )}
        </div>
    );
};

const ModalPageDownloadHistory = () => {
    const t = useTranslations('modal');
    const { data: session } = useSession();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useToggle(
        () => {
            toggleExpand();
            setDepth(2);
        },
        () => {
            toggleExpand();
        }
    );

    const { toggleExpand, setDepth } = modalStore();

    useEffect(() => {
        fetchPaymentHistory();
    }, [page, session]);

    const fetchPaymentHistory = async () => {
        if (!session?.user?.ssid) {
            setError(t('login_required'));
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payments/user/history-with-cancellations?page=${page}&limit=10`,
                {
                    headers: {
                        'Authorization': `Bearer ${session.user.ssid}`
                    }
                }
            );

            const result = await response.json();

            if (response.ok && result.success) {
                setPayments(result.data.items || []);
                setTotalPages(result.data.pagination?.totalPages || 1);
                setError(null);
            } else {
                setError(result.message || t('fetch_error'));
            }
        } catch (err) {
            console.error('Failed to fetch payment history:', err);
            setError(t('network_error'));
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (payment) => {
        // 상세 정보 모달 또는 확장 뷰 구현
        console.log('Payment details:', payment);
        alert(JSON.stringify(payment, null, 2));
    };

    return (
        <>
            <ModalCard title={t('payment_history')} />
            <div className="mx-3 mb-5">
                {loading ? (
                    <div className="text-center py-10 text-foreground/50">
                        {t('loading')}...
                    </div>
                ) : error ? (
                    <div className="text-center py-10 text-red-600 dark:text-red-400">
                        {error}
                    </div>
                ) : payments.length === 0 ? (
                    <div className="text-center py-10 text-foreground/50">
                        {t('no_payment_history')}
                    </div>
                ) : (
                    <>
                        <PaymentHistoryItem type="head" />
                        {payments.map((payment) => (
                            <PaymentHistoryItem
                                key={payment.id}
                                data={payment}
                                onViewDetails={handleViewDetails}
                            />
                        ))}

                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-5">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-3 py-1 rounded bg-foreground/10 hover:bg-foreground/20 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                                >
                                    {t('prev')}
                                </button>
                                <span className="px-3 py-1 text-sm text-foreground/70">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-3 py-1 rounded bg-foreground/10 hover:bg-foreground/20 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                                >
                                    {t('next')}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default ModalPageDownloadHistory;