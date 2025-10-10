"use client";

import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import useAuthStore from '@/stores/authStore';
import PageWrapper from "@/components/page/PageWrapper";
import PriceCard from "@/components/page/PriceCard";
import Heading from "@/components/ui/Heading";
import HeadingSub from "@/components/ui/HeadingSub";
import PriceDiffTable from "@/components/page/PriceDiffTable";
import PricingNotice from "@/components/page/PricingNotice";
import PricingFAQ from "@/components/page/PricingFAQ";
import Footer from "@/components/ui/Footer";
import Checkout from "@/components/payment/CheckoutModal";
import SignInModal from "@/components/auth/SignInModal";

export default function Price() {
    const t = useTranslations('pages.pricing');
    const tPricing = useTranslations('pricing');
    const { data: session } = useSession();
    const toggleAuthModal = useAuthStore(state => state.toggleAuthModal);

    const handleChoosePlan = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleTryFree = () => {
        if (!session) {
            // authStore의 로그인 모달 띄우기
            toggleAuthModal(true);
            return;
        }
        // 이미 로그인된 경우 explorer로 이동
        window.location.href = '/explorer';
    };

    return (
        <>
            <SignInModal />
            {/* Hero Section */}
            <PageWrapper id="pricing" className="relative bg-gradient-to-br from-zinc-900 via-purple-900/20 to-zinc-900 min-h-screen flex items-center">
                <div className="absolute inset-0 bg-[url('/bg_price.png')] bg-cover bg-center opacity-10"></div>
                <div className="relative z-10 w-full">
                    <div className="text-center mb-16">
                        <div className="inline-block px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm font-medium mb-6">
                            {tPricing('unlimited_music_access')}
                        </div>
                        <Heading align="text-center" className="text-4xl lg:text-6xl font-black bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent mb-6">
                            {t('hero_title')}
                        </Heading>
                        <HeadingSub className="text-xl lg:text-2xl text-zinc-300 max-w-3xl mx-auto">
                            {t('hero_subtitle')}
                        </HeadingSub>
                    </div>
                    <PriceCard />
                </div>
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-zinc-900 to-transparent"></div>
            </PageWrapper>

            {/* Feature Comparison */}
            <PageWrapper className="bg-zinc-900">
                <PriceDiffTable />
            </PageWrapper>

            {/* Purchase Notice */}
            <PageWrapper className="bg-gradient-to-b from-zinc-900 to-zinc-800">
                <PricingNotice />
            </PageWrapper>

            {/* FAQ Section */}
            <PageWrapper className="bg-zinc-800">
                <PricingFAQ />
            </PageWrapper>

            {/* CTA Section */}
            <PageWrapper className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 py-20">
                <div className="text-center">
                    <h2 className="text-3xl lg:text-4xl font-black text-white mb-6">
                        {tPricing('get_started_now')}
                    </h2>
                    <p className="text-zinc-300 text-lg mb-8 max-w-2xl mx-auto">
                        {tPricing('get_started_description')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={handleChoosePlan}
                            className="inline-flex items-center justify-center px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-lg transition-colors"
                        >
                            {tPricing('choose_plan')}
                        </button>
                        {!session && (
                            <button
                                onClick={handleTryFree}
                                className="inline-flex items-center justify-center px-8 py-4 border-2 border-zinc-600 hover:border-zinc-500 text-zinc-300 hover:text-white rounded-xl font-bold text-lg transition-colors"
                            >
                                {tPricing('try_free')}
                            </button>
                        )}
                    </div>
                </div>
            </PageWrapper>

            <Checkout />
            <Footer />
        </>
    );
}
