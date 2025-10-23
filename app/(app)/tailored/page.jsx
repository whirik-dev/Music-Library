"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';

import Footer from "@/components/ui/Footer";
import Button from "@/components/ui/Button2";
import PageHero from "@/components/page/PageHero";
import EmptyContent from "@/components/page/EmptyContent";
import TailoredWorkCard from "@/components/tailored2/TailoredWorkCard";
import TailoredWorkListItem from "@/components/tailored2/TailoredWorkListItem";
import TailoredWorkCardSkeleton from "@/components/tailored2/TailoredWorkCardSkeleton";
import { IconLayoutGrid, IconList } from "@tabler/icons-react";

export default function TailoredPage() {
    const t = useTranslations('tailored');
    const router = useRouter();
    const [works, setWorks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    useEffect(() => {
        fetchWorks();
    }, []);

    const fetchWorks = async () => {
        setIsLoading(true);
        try {
            const session = await fetch('/api/auth/session').then(res => res.json());
            if (!session?.user?.ssid) {
                setIsLoading(false);
                return;
            }

            // 백엔드가 숫자 타입을 요구하므로 숫자로 전달
            const params = new URLSearchParams();
            params.append('page', 1);
            params.append('limit', 50);
            params.append('sort', 'created_at');
            params.append('order', 'desc');

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/tailored/list?${params.toString()}`,
                {
                    headers: {
                        'Authorization': `Bearer ${session.user.ssid}`
                    }
                }
            );

            if (!response.ok) {
                console.error('API Error:', response.status, response.statusText);
                const errorData = await response.json();
                console.error('Error details:', errorData);
                // 백엔드 validation 에러 - 임시로 빈 배열 사용
                setWorks([]);
                return;
            }

            const data = await response.json();
            if (data.success && data.data?.jobs) {
                setWorks(data.data.jobs);
            }
        } catch (error) {
            console.error('Failed to fetch works:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewRequest = () => {
        router.push('/tailored/new');
    };

    return (
        <div className="min-h-screen w-full">
            <PageHero
                title={t('tailored_service')}
                description={t('tailored_description') || '음악을 당신의 취향에 맞게 커스터마이징하세요'}
                buttonText={t('custom_request') || 'Custom Request'}
                onButtonClick={handleNewRequest}
            />

            {/* Works List */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* View Mode Toggle */}
                {!isLoading && works.length > 0 && (
                    <div className="flex justify-end mb-6">
                        <div className="inline-flex rounded-lg border border-zinc-800 bg-zinc-900 p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${viewMode === 'grid'
                                    ? 'bg-purple-600 text-white'
                                    : 'text-zinc-400 hover:text-white'
                                    }`}
                            >
                                <IconLayoutGrid size={18} />
                                <span className="text-sm font-medium">Grid</span>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${viewMode === 'list'
                                    ? 'bg-purple-600 text-white'
                                    : 'text-zinc-400 hover:text-white'
                                    }`}
                            >
                                <IconList size={18} />
                                <span className="text-sm font-medium">List</span>
                            </button>
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <TailoredWorkCardSkeleton key={i} />
                        ))}
                    </div>
                ) : works.length === 0 ? (
                    <EmptyContent content={t('no_works') || '아직 작업이 없습니다'}>
                        <div className="flex flex-col gap-4 mt-6">
                            <p className="text-zinc-500">
                                {t('start_first_request') || '첫 번째 맞춤 제작을 시작해보세요'}
                            </p>
                            <Button
                                name={t('new_request') || '새 요청'}
                                onClick={handleNewRequest}
                                size="md"
                                bg="bg-purple-600"
                                color="text-white"
                            />
                        </div>
                    </EmptyContent>
                ) : (
                    <>
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {works.map((work) => (
                                    <TailoredWorkCard key={work.id} work={work} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {works.map((work) => (
                                    <TailoredWorkListItem key={work.id} work={work} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <Footer />
        </div>
    );
}
