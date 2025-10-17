"use client";

import { useTranslations } from 'next-intl';
import { IconBook, IconHeadphones, IconCreditCard, IconDownload, IconMail, IconQuestionMark } from '@tabler/icons-react';
import Hero from "@/components/ui/Hero";
import Footer from "@/components/ui/Footer";

const HelpCard = ({ icon: Icon, title, description, link }) => {
    const handleClick = (e) => {
        if (link.startsWith('#')) {
            e.preventDefault();
            const element = document.querySelector(link);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    return (
        <a
            href={link}
            onClick={handleClick}
            className="aspect-square p-6 rounded-lg bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 hover:border-foreground/20 transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
        >
            <div className="mb-4 p-4 rounded-full bg-foreground/10 group-hover:bg-foreground/20 transition-colors">
                <Icon size={32} className="text-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
            <p className="text-sm text-foreground/60">{description}</p>
        </a>
    );
};

const HelpSection = ({ id, title, children }) => {
    return (
        <div id={id} className="scroll-mt-20 mb-16">
            <h2 className="text-2xl font-bold mb-6 text-foreground">{title}</h2>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
};

const HelpItem = ({ question, answer }) => {
    return (
        <details className="p-5 rounded-lg bg-foreground/5 border border-foreground/10">
            <summary className="font-semibold cursor-pointer text-foreground">{question}</summary>
            <p className="mt-3 text-foreground/70 whitespace-pre-line">{answer}</p>
        </details>
    );
};

export default function Help() {
    const t = useTranslations('pages.help');

    const helpCategories = [
        {
            icon: IconBook,
            title: t('getting_started'),
            description: t('getting_started_desc'),
            link: '#getting-started'
        },
        {
            icon: IconHeadphones,
            title: t('music_usage'),
            description: t('music_usage_desc'),
            link: '#music-usage'
        },
        {
            icon: IconCreditCard,
            title: t('subscription_billing'),
            description: t('subscription_billing_desc'),
            link: '#subscription'
        },
        {
            icon: IconDownload,
            title: t('downloads'),
            description: t('downloads_desc'),
            link: '#downloads'
        },
        {
            icon: IconQuestionMark,
            title: t('faq'),
            description: t('faq_desc'),
            link: '#faq'
        },
        {
            icon: IconMail,
            title: t('contact_support'),
            description: t('contact_support_desc'),
            link: 'mailto:ir@whirik.com'
        }
    ];

    return (
        <div className="min-h-screen relative">
            <Hero className="bg-gradient-to-r from-0% via-50% from-blue-400 via-purple-400 to-pink-400 bg-no-repeat">
                <h1 className="text-3xl font-bold py-5 text-white">{t('hero_title')}</h1>
                <p className="text-white/80">{t('hero_subtitle')}</p>
            </Hero>

            <div className="container mx-auto px-5 py-10">
                {/* Category Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-20">
                    {helpCategories.map((category, index) => (
                        <HelpCard
                            key={index}
                            icon={category.icon}
                            title={category.title}
                            description={category.description}
                            link={category.link}
                        />
                    ))}
                </div>

                {/* Help Content Sections */}
                <div className="max-w-4xl mx-auto">
                    {/* Getting Started */}
                    <HelpSection id="getting-started" title={t('getting_started')}>
                        <HelpItem question={t('gs_q1')} answer={t('gs_a1')} />
                        <HelpItem question={t('gs_q2')} answer={t('gs_a2')} />
                        <HelpItem question={t('gs_q3')} answer={t('gs_a3')} />
                    </HelpSection>

                    {/* Music Usage */}
                    <HelpSection id="music-usage" title={t('music_usage')}>
                        <HelpItem question={t('mu_q1')} answer={t('mu_a1')} />
                        <HelpItem question={t('mu_q2')} answer={t('mu_a2')} />
                        <HelpItem question={t('mu_q3')} answer={t('mu_a3')} />
                    </HelpSection>

                    {/* Subscription & Billing */}
                    <HelpSection id="subscription" title={t('subscription_billing')}>
                        <HelpItem question={t('sb_q1')} answer={t('sb_a1')} />
                        <HelpItem question={t('sb_q2')} answer={t('sb_a2')} />
                        <HelpItem question={t('sb_q3')} answer={t('sb_a3')} />
                        <HelpItem question={t('sb_q4')} answer={t('sb_a4')} />
                    </HelpSection>

                    {/* Downloads */}
                    <HelpSection id="downloads" title={t('downloads')}>
                        <HelpItem question={t('dl_q1')} answer={t('dl_a1')} />
                        <HelpItem question={t('dl_q2')} answer={t('dl_a2')} />
                        <HelpItem question={t('dl_q3')} answer={t('dl_a3')} />
                    </HelpSection>

                    {/* FAQ */}
                    <HelpSection id="faq" title={t('faq')}>
                        <HelpItem question={t('faq_q1')} answer={t('faq_a1')} />
                        <HelpItem question={t('faq_q2')} answer={t('faq_a2')} />
                        <HelpItem question={t('faq_q3')} answer={t('faq_a3')} />
                        <HelpItem question={t('faq_q4')} answer={t('faq_a4')} />
                    </HelpSection>
                </div>

                {/* Contact Section */}
                <div id="contact" className="mt-20 max-w-4xl mx-auto text-center p-10 rounded-lg bg-foreground/5 border border-foreground/10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">{t('still_need_help')}</h2>
                    <p className="text-foreground/70 mb-6">{t('contact_message')}</p>
                    <a
                        href="mailto:ir@whirik.com"
                        className="inline-block px-6 py-3 bg-foreground text-background rounded-lg hover:opacity-80 transition-opacity font-semibold"
                    >
                        {t('contact_us')}
                    </a>
                </div>
            </div>

            <Footer />
        </div>
    );
}
