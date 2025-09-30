import { IconInfoCircle, IconShield, IconRefresh, IconCreditCard } from "@tabler/icons-react";
import { useTranslations } from 'next-intl';

const PricingNotice = () => {
    const t = useTranslations('pricing');

    const notices = [
        {
            icon: <IconCreditCard size={24} />,
            title: t('payment_billing'),
            items: [
                t('payment_billing_1'),
                t('payment_billing_2'),
                t('payment_billing_3'),
                t('payment_billing_4')
            ]
        },
        {
            icon: <IconRefresh size={24} />,
            title: t('subscription_management'),
            items: [
                t('subscription_management_1'),
                t('subscription_management_2'),
                t('subscription_management_3'),
                t('subscription_management_4')
            ]
        },

        {
            icon: <IconInfoCircle size={24} />,
            title: t('terms_conditions'),
            items: [
                t('terms_conditions_1'),
                t('terms_conditions_2'),
                t('terms_conditions_3'),
                t('terms_conditions_4')
            ]
        }
    ];

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">
                    {t('notice_title')}
                </h2>
                <p className="text-zinc-400 text-lg">
                    {t('notice_subtitle')}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {notices.map((notice, index) => (
                    <div
                        key={index}
                        className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-6 hover:bg-zinc-800/40 transition-colors"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="text-orange-400">
                                {notice.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white">
                                {notice.title}
                            </h3>
                        </div>

                        <ul className="space-y-3">
                            {notice.items.map((item, itemIndex) => (
                                <li key={itemIndex} className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                                    <span className="text-zinc-300 text-sm leading-relaxed">
                                        {item}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* <div className="mt-12 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <IconInfoCircle size={24} className="text-purple-400 flex-shrink-0 mt-1" />
                    <div>
                        <h4 className="text-lg font-bold text-white mb-2">
                            {t('have_questions')}
                        </h4>
                        <p className="text-zinc-300 mb-4">
                            {t('contact_description')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <a
                                href="mailto:support@probgm.com"
                                className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                            >
                                {t('email_inquiry')}
                            </a>
                            <a
                                href="/support"
                                className="inline-flex items-center justify-center px-6 py-3 border border-zinc-600 hover:border-zinc-500 text-zinc-300 hover:text-white rounded-lg font-medium transition-colors"
                            >
                                {t('customer_center')}
                            </a>
                        </div>
                    </div>
                </div>
            </div> */}
        </div>
    );
};

export default PricingNotice;