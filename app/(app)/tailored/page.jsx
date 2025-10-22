"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';

import Footer from "@/components/ui/Footer";
import Button from "@/components/ui/Button2";
import PageHero from "@/components/page/PageHero";
import EmptyContent from "@/components/page/EmptyContent";
import TailoredWorkCard from "@/components/tailored2/TailoredWorkCard";
import TailoredWorkCardSkeleton from "@/components/tailored2/TailoredWorkCardSkeleton";

export default function TailoredPage() {
    const t = useTranslations('tailored');
    const router = useRouter();
    const [works, setWorks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/tailored/list?page=1&limit=50&sort=created_at&order=desc`,
                {
                    headers: {
                        'Authorization': `Bearer ${session.user.ssid}`
                    }
                }
            );

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
                buttonText={t('new_request') || '새 요청'}
                onButtonClick={handleNewRequest}
            />

            {/* Works List */}
            <div className="max-w-7xl mx-auto px-4 py-12">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {works.map((work) => (
                            <TailoredWorkCard key={work.id} work={work} />
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}