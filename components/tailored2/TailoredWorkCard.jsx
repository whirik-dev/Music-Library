"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import { IconMusic, IconClock, IconCoin, IconLoader2 } from "@tabler/icons-react";
import TailoredStatusBadge from "./TailoredStatusBadge";

const TailoredWorkCard = ({ work }) => {
    const t = useTranslations('tailored');
    const router = useRouter();

    const handleClick = () => {
        router.push(`/tailored/${work.job_id}`);
    };

    // 날짜 포맷팅
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    // Action Required 상태 체크
    const needsAction = work.status === 'estimated' || work.status === 'confirming';
    const isCancelled = work.status === 'cancelled' || work.status === 'failed';

    return (
        <div
            onClick={handleClick}
            className={`relative bg-zinc-900 border rounded-lg p-6 cursor-pointer 
                       transition-all duration-300 hover:shadow-lg
                       ${isCancelled ? 'opacity-40' : ''}
                       ${needsAction 
                           ? 'border-purple-500/50 hover:border-purple-500 hover:shadow-purple-500/20' 
                           : 'border-zinc-800 hover:border-purple-500/50 hover:shadow-purple-500/10'
                       }`}
        >
            {/* Action Required Badge */}
            {needsAction && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <div className="relative">
                        <div className="bg-gradient-to-r from-purple-500 to-blue-400 text-white text-xs font-bold 
                                      px-3 py-1 rounded-full shadow-lg whitespace-nowrap animate-pulse">
                            {work.status === 'estimated' 
                                ? t('action_required_approve') || '⚡ Action Required - Approve'
                                : t('action_required_confirm') || '⚡ Action Required - Confirm'
                            }
                        </div>
                        {/* 말풍선 꼬리 */}
                        <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-0 h-0 
                                      border-l-4 border-l-transparent 
                                      border-r-4 border-r-transparent 
                                      border-t-4 border-t-blue-400">
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
                        {work.title || 'Untitled Work'}
                    </h3>
                    <TailoredStatusBadge status={work.status} />
                </div>
                {work.status === 'processing' ? (
                    <IconLoader2 className="text-yellow-500 animate-spin" size={24} />
                ) : (
                    <IconMusic className="text-zinc-600" size={24} />
                )}
            </div>

            {/* Info */}
            <div className="space-y-2 text-sm text-zinc-400">
                <div className="flex items-center gap-2">
                    <IconClock size={16} />
                    <span>{formatDate(work.created_at)}</span>
                </div>
                {work.price && work.status !== 'pending' && (
                    <div className="flex items-center gap-2">
                        <IconCoin size={16} />
                        <span>{work.price * 10} credits</span>
                    </div>
                )}
                {work.estimated_duration && work.status !== 'pending' && (
                    <div className="text-xs text-zinc-500">
                        Est. {work.estimated_duration}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TailoredWorkCard;
