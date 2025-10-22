"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import { IconMusic, IconClock, IconCoin } from "@tabler/icons-react";
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

    return (
        <div
            onClick={handleClick}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 cursor-pointer 
                       hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
                        {work.title || 'Untitled Work'}
                    </h3>
                    <TailoredStatusBadge status={work.status} />
                </div>
                <IconMusic className="text-zinc-600" size={24} />
            </div>

            {/* Info */}
            <div className="space-y-2 text-sm text-zinc-400">
                <div className="flex items-center gap-2">
                    <IconClock size={16} />
                    <span>{formatDate(work.created_at)}</span>
                </div>
                {work.price && (
                    <div className="flex items-center gap-2">
                        <IconCoin size={16} />
                        <span>{work.price * 10} credits</span>
                    </div>
                )}
                {work.estimated_duration && (
                    <div className="text-xs text-zinc-500">
                        Est. {work.estimated_duration}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TailoredWorkCard;
