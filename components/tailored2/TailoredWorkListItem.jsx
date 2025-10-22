"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import { IconMusic, IconClock, IconCoin, IconLoader2, IconChevronRight } from "@tabler/icons-react";
import TailoredStatusBadge from "./TailoredStatusBadge";

const TailoredWorkListItem = ({ work }) => {
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
            className={`relative bg-zinc-900 border rounded-lg p-4 cursor-pointer 
                       transition-all duration-300 hover:shadow-lg flex items-center gap-4
                       ${isCancelled ? 'opacity-40' : ''}
                       ${needsAction 
                           ? 'border-purple-500/50 hover:border-purple-500 hover:shadow-purple-500/20' 
                           : 'border-zinc-800 hover:border-purple-500/50 hover:shadow-purple-500/10'
                       }`}
        >
            {/* Icon */}
            <div className="flex-shrink-0">
                {work.status === 'processing' ? (
                    <IconLoader2 className="text-yellow-500 animate-spin" size={32} />
                ) : (
                    <IconMusic className="text-zinc-600" size={32} />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white truncate flex-1">
                        {work.title || 'Untitled Work'}
                    </h3>
                    {needsAction && (
                        <div className="flex-shrink-0">
                            <div className="bg-gradient-to-r from-purple-500 to-blue-400 text-white text-xs font-bold 
                                          px-2 py-1 rounded-full whitespace-nowrap animate-pulse">
                                {work.status === 'estimated' 
                                    ? '⚡ Approve'
                                    : '⚡ Confirm'
                                }
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-4 text-sm text-zinc-400">
                    <TailoredStatusBadge status={work.status} />
                    <div className="flex items-center gap-1">
                        <IconClock size={14} />
                        <span>{formatDate(work.created_at)}</span>
                    </div>
                    {work.price && work.status !== 'pending' && (
                        <div className="flex items-center gap-1">
                            <IconCoin size={14} />
                            <span>{work.price * 10} credits</span>
                        </div>
                    )}
                    {work.estimated_duration && work.status !== 'pending' && (
                        <span className="text-xs text-zinc-500">
                            Est. {work.estimated_duration}
                        </span>
                    )}
                </div>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0">
                <IconChevronRight className="text-zinc-600" size={20} />
            </div>
        </div>
    );
};

export default TailoredWorkListItem;
