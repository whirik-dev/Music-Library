"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import { IconChevronLeft, IconDownload, IconEdit } from "@tabler/icons-react";

import Footer from "@/components/ui/Footer";
import Button from "@/components/ui/Button2";
import TailoredPlayer from "@/components/tailored/TailoredPlayer";
import TailoredStatusBadge from "@/components/tailored2/TailoredStatusBadge";
import TailoredTimeline from "@/components/tailored2/TailoredTimeline";
import TailoredDetailPending from "@/components/modal/partials/TailoredDetailPending";
import TailoredDetailEstimate from "@/components/modal/partials/TailoredDetailEstimate";
import TailoredDetailProcessing from "@/components/modal/partials/TailoredDetailProcessing";
import TailoredDetailResult from "@/components/modal/partials/TailoredDetailResult";
import TailoredDetailCompleted from "@/components/modal/partials/TailoredDetailCompleted";
import TailoredDetailCancelled from "@/components/modal/partials/TailoredDetailCancelled";
import TailoredDetailFail from "@/components/modal/partials/TailoredDetailFail";
import useAuthStore from "@/stores/authStore";

export default function TailoredDetailPage() {
    const t = useTranslations('tailored');
    const params = useParams();
    const router = useRouter();
    const { credits } = useAuthStore();
    const [work, setWork] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchWorkDetail(params.id);
        }
    }, [params.id]);

    const fetchWorkDetail = async (id) => {
        setIsLoading(true);
        try {
            const session = await fetch('/api/auth/session').then(res => res.json());
            if (!session?.user?.ssid) {
                router.push('/');
                return;
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/tailored/detail/${id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${session.user.ssid}`
                    }
                }
            );

            const data = await response.json();
            if (data.success && data.data) {
                setWork(data.data);
            } else {
                console.error('Failed to fetch work detail:', data.message);
            }
        } catch (error) {
            console.error('Failed to fetch work detail:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        router.push('/tailored');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center">
                <div className="text-zinc-500">Loading...</div>
            </div>
        );
    }

    if (!work) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center">
                <div className="text-zinc-500">Work not found</div>
            </div>
        );
    }

    // 날짜 포맷팅
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
                            <h1 className="text-2xl font-bold text-white">{work.title}</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <TailoredStatusBadge status={work.status} />
                                <span className="text-sm text-zinc-500">
                                    {t('created_at')}: {formatDate(work.created_at)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="space-y-6 mb-8">
                    {/* Reference Music */}
                    {work.requirements?.['ref-music'] && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">
                                {t('reference_music') || 'Reference Music'}
                            </h3>
                            {work.requirements['ref-music'].includes('tailoredrequestfiles.probgm.com') ? (
                                // 업로드된 파일 - 기본 audio 태그 사용
                                <div className="bg-zinc-800/50 p-4 rounded-lg">
                                    <audio
                                        controls
                                        src={`/api/media-stream?url=${encodeURIComponent(work.requirements['ref-music'])}`}
                                        className="w-full"
                                    />
                                </div>
                            ) : (
                                // 서비스 음악 - TailoredPlayer 사용
                                <TailoredPlayer id={work.requirements['ref-music'].split('/').pop().split('?')[0]} />
                            )}
                        </div>
                    )}

                    {/* Request Details */}
                    {work.requirements?.sow && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">
                                {t('request_details') || 'Request Details'}
                            </h3>

                            <div className="space-y-4">
                                {/* Items */}
                                {work.requirements.sow.items && work.requirements.sow.items.length > 0 && (
                                    <div>
                                        <div className="text-sm font-semibold text-zinc-400 mb-2">
                                            {t('detailed_requests') || 'Detailed Requests'}
                                        </div>
                                        <div className="space-y-2">
                                            {work.requirements.sow.items.map((item, index) => (
                                                <div key={index} className="bg-zinc-800/50 p-3 rounded-lg">
                                                    <div className="text-xs font-mono text-purple-400 mb-1">
                                                        {item.pos1} - {item.pos2}
                                                    </div>
                                                    <div className="text-sm text-white">
                                                        {item.comment}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Comment1 */}
                                {work.requirements.sow.comment1 && (
                                    <div>
                                        <div className="text-sm font-semibold text-zinc-400 mb-2">
                                            {t('additional_requests') || 'Additional Requests'}
                                        </div>
                                        <div className="bg-zinc-800/50 p-4 rounded-lg text-sm text-white whitespace-pre-wrap">
                                            {work.requirements.sow.comment1}
                                        </div>
                                    </div>
                                )}

                                {/* Comment2 */}
                                {work.requirements.sow.comment2 && (
                                    <div>
                                        <div className="text-sm font-semibold text-zinc-400 mb-2">
                                            {t('reference_notes') || 'Reference Notes'}
                                        </div>
                                        <div className="bg-zinc-800/50 p-4 rounded-lg text-sm text-zinc-400">
                                            {work.requirements.sow.comment2}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Status-based Content */}
                {work.status === 'pending' && (
                    <TailoredDetailPending id={work.job_id} onJobUpdate={fetchWorkDetail} />
                )}
                {work.status === 'estimated' && (
                    <TailoredDetailEstimate
                        id={work.job_id}
                        onJobUpdate={() => fetchWorkDetail(params.id)}
                        jobDetail={work}
                        userBalance={credits}
                    />
                )}
                {work.status === 'processing' && (
                    <TailoredDetailProcessing id={work.job_id} />
                )}
                {work.status === 'confirming' && (
                    <TailoredDetailResult
                        id={work.job_id}
                        onJobUpdate={() => fetchWorkDetail(params.id)}
                    />
                )}
                {work.status === 'completed' && (
                    <TailoredDetailCompleted id={work.job_id} jobDetail={work} />
                )}
                {work.status === 'cancelled' && (
                    <TailoredDetailCancelled id={work.job_id} jobDetail={work} />
                )}
                {work.status === 'failed' && (
                    <TailoredDetailFail id={work.job_id} jobDetail={work} />
                )}
            </div>

            <Footer />
        </div>
    );
}
