import { IconX, IconCheck, IconStar, IconDownload, IconMusic, IconShield } from "@tabler/icons-react"
import { useTranslations } from 'next-intl';

const PriceDiffTable = () => {
    const t = useTranslations('pricing');
    
    // 플랜 정보
    const plans = [
        { name: t('free'), price: t('free'), color: 'text-zinc-400' },
        { name: 'Basic', price: '₩11,900', color: 'text-blue-400' },
        { name: 'Pro', price: '₩22,900', color: 'text-purple-400', popular: true },
        { name: 'Master', price: '₩59,900', color: 'text-orange-400' }
    ];

    // 테이블 데이터 구조화
    const tableData = [
        {
            category: t('download_category'),
            icon: <IconDownload size={20} />,
            features: [
                {
                    feature: t('monthly_download_limit'),
                    values: [`10 ${t('songs')}`, t('unlimited'), t('unlimited'), t('unlimited')]
                },
                {
                    feature: t('audio_quality'),
                    values: ['192kbps MP3', 'WAV 24bit', 'WAV 24bit', 'WAV 24bit']
                },
                {
                    feature: t('monthly_credits'),
                    values: ['20', '70', '150', '500']
                }
            ]
        },
        {
            category: t('features_category'),
            icon: <IconMusic size={20} />,
            features: [
                {
                    feature: t('commercial_use'),
                    values: [false, true, true, true],
                    isBoolean: true
                },
                {
                    feature: t('preview'),
                    values: [true, true, true, true],
                    isBoolean: true
                },
                {
                    feature: t('advanced_search_filters'),
                    values: [false, false, true, true],
                    isBoolean: true
                },
                {
                    feature: t('playlist_creation'),
                    values: [`3 playlists`, `10 playlists`, t('unlimited'), t('unlimited')]
                }
            ]
        },
        {
            category: t('support_category'),
            icon: <IconShield size={20} />,
            features: [
                {
                    feature: t('customer_support'),
                    values: [t('support_community'), t('support_3days'), t('support_24hours'), t('support_priority')]
                }
            ]
        }
    ];

    const renderCellContent = (value, isBoolean) => {
        if (isBoolean) {
            return value ? (
                <IconCheck size="20" className="text-green-400 mx-auto" />
            ) : (
                <IconX size="20" className="text-zinc-600 mx-auto" />
            );
        }
        return <span className="text-zinc-300">{value}</span>;
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">
                    {t('plan_comparison_title')}
                </h2>
                <p className="text-zinc-400 text-lg">
                    {t('plan_comparison_subtitle')}
                </p>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block bg-zinc-800/30 backdrop-blur-sm rounded-2xl border border-zinc-700/50 overflow-hidden">
                {/* Header */}
                <div className="bg-zinc-800/50 border-b border-zinc-700/50">
                    <div className="grid grid-cols-5 gap-4 p-6">
                        <div className="font-bold text-white text-lg">{t('features')}</div>
                        {plans.map((plan) => (
                            <div key={plan.name} className="text-center">
                                <div className={`font-black text-lg ${plan.color} flex items-center justify-center gap-2`}>
                                    {plan.name}
                                    {plan.popular && <IconStar size={16} className="text-purple-400" />}
                                </div>
                                <div className="text-sm text-zinc-400 mt-1">{plan.price}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="divide-y divide-zinc-700/50">
                    {tableData.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="text-orange-400">{category.icon}</div>
                                <h3 className="text-xl font-bold text-white">{category.category}</h3>
                            </div>
                            
                            <div className="space-y-4">
                                {category.features.map((row, rowIndex) => (
                                    <div key={rowIndex} className="grid grid-cols-5 gap-4 items-center py-3 hover:bg-zinc-700/20 rounded-lg px-4 transition-colors">
                                        <div className="text-zinc-300 font-medium">{row.feature}</div>
                                        {row.values.map((value, valueIndex) => (
                                            <div key={valueIndex} className="text-center">
                                                {renderCellContent(value, row.isBoolean)}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-6">
                {plans.map((plan, planIndex) => (
                    <div key={plan.name} className="bg-zinc-800/30 backdrop-blur-sm rounded-xl border border-zinc-700/50 p-6">
                        <div className="text-center mb-6">
                            <div className={`font-black text-xl ${plan.color} flex items-center justify-center gap-2 mb-2`}>
                                {plan.name}
                                {plan.popular && <IconStar size={16} className="text-purple-400" />}
                            </div>
                            <div className="text-zinc-400">{plan.price}</div>
                        </div>
                        
                        {tableData.map((category, categoryIndex) => (
                            <div key={categoryIndex} className="mb-6 last:mb-0">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="text-orange-400">{category.icon}</div>
                                    <h4 className="font-bold text-white">{category.category}</h4>
                                </div>
                                
                                <div className="space-y-2">
                                    {category.features.map((row, rowIndex) => (
                                        <div key={rowIndex} className="flex justify-between items-center py-2 border-b border-zinc-700/30 last:border-b-0">
                                            <span className="text-zinc-300 text-sm">{row.feature}</span>
                                            <div className="text-right">
                                                {renderCellContent(row.values[planIndex], row.isBoolean)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};
export default PriceDiffTable;