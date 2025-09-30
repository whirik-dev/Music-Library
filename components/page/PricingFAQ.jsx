"use client";

import { useState } from 'react';
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { useTranslations } from 'next-intl';

const PricingFAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const t = useTranslations('pricing');

    const faqs = [
        {
            question: t('faq_question_1'),
            answer: t('faq_answer_1')
        },
        {
            question: t('faq_question_2'),
            answer: t('faq_answer_2')
        },
        {
            question: t('faq_question_3'),
            answer: t('faq_answer_3')
        },
        {
            question: t('faq_question_4'),
            answer: t('faq_answer_4')
        },
        {
            question: t('faq_question_5'),
            answer: t('faq_answer_5')
        },

        {
            question: t('faq_question_6'),
            answer: t('faq_answer_6')
        },
        {
            question: t('faq_question_7'),
            answer: t('faq_answer_7')
        }
    ];

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">
                    {t('faq_title')}
                </h2>
                <p className="text-zinc-400 text-lg">
                    {t('faq_subtitle')}
                </p>
            </div>

            <div className="space-y-4">
                {faqs.map((faq, index) => (
                    <div 
                        key={index}
                        className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-xl overflow-hidden transition-all duration-200 hover:border-zinc-600/50"
                    >
                        <button
                            onClick={() => toggleFAQ(index)}
                            className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-zinc-700/20 transition-colors"
                        >
                            <h3 className="text-lg font-semibold text-white pr-4">
                                {faq.question}
                            </h3>
                            <div className="flex-shrink-0 text-zinc-400">
                                {openIndex === index ? (
                                    <IconChevronUp size={20} />
                                ) : (
                                    <IconChevronDown size={20} />
                                )}
                            </div>
                        </button>
                        
                        {openIndex === index && (
                            <div className="px-6 pb-5">
                                <div className="border-t border-zinc-700/50 pt-4">
                                    <p className="text-zinc-300 leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* <div className="mt-12 text-center">
                <p className="text-zinc-400 mb-4">
                    {t('no_answer_found')}
                </p>
                <a 
                    href="mailto:support@probgm.com"
                    className="inline-flex items-center justify-center px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                >
                    {t('contact_directly')}
                </a>
            </div> */}
        </div>
    );
};

export default PricingFAQ;