import {useTranslations} from 'next-intl';

const Footer = ({ }) => {

    const t = useTranslations('test');

    const footerLinks = [
        {
            id: 'terms',
            label: '이용약관',
            href: '/terms'
        },
        {
            id: 'privacy',
            label: '개인정보처리방침',
            href: '/privacy'
        },
        {
            id: 'support',
            label: '고객지원',
            href: '/support'
        }
    ];

    return (
        <footer className="bg-gradient-to-b from-zinc-900/50 to-zinc-950 border-t border-zinc-800/50 mt-8">
            <div className="px-4 lg:px-12 py-16">
                <div className="w-full mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
                        {/* 브랜드 섹션 */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-black bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                                        <span className="font-light">PRO</span><span className="font-bold">BGM</span>
                                    </span>
                                    <span className="text-xs font-medium text-zinc-400">powered by WhiRik</span>
                                </div>
                                <p className="text-sm text-zinc-500 leading-relaxed">
                                    {t('test')}
                                </p>
                            </div>

                            {/* 회사 정보 */}
                            <div className="bg-zinc-900/30 rounded-xl p-6 border border-zinc-800/30">
                                <h3 className="font-semibold text-white mb-4 text-sm">
                                    주식회사 휘릭에이아이
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 text-xs text-zinc-400 leading-relaxed">
                                    <div>
                                        <span className="text-zinc-500">대표자명:</span> 최정우, 이선조
                                    </div>
                                    <div>
                                        <span className="text-zinc-500">사업자등록번호:</span> 224-88-03066
                                    </div>
                                    <div>
                                        <span className="text-zinc-500">통신판매업신고:</span> 제 2025-서울관악-1041 호
                                    </div>
                                    <div>
                                        <span className="text-zinc-500">주소:</span> 서울특별시 관악구 호암로 597, 3층 1호
                                    </div>
                                    <div>
                                        <span className="text-zinc-500">유선번호:</span> 0507-1373-0978
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 링크 섹션 */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-white mb-4 text-sm">
                                    서비스 정보
                                </h3>
                                <ul className="space-y-3">
                                    {footerLinks.map((link) => (
                                        <li key={link.id}>
                                            <a
                                                href={link.href}
                                                className="text-sm text-zinc-400 hover:text-white transition-colors duration-200 flex items-center gap-2"
                                            >
                                                <span>{link.label}</span>
                                                <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* 하단 구분선 및 저작권 */}
                    <div className="mt-12 pt-8 border-t border-zinc-800/30">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-xs text-zinc-500">
                                PROBGM © 2025 WhiRik. All rights reserved.
                            </p>
                            <div className="flex items-center gap-4">
                                <span className="text-xs text-zinc-600">client version v0.2.1 dev preview</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
export default Footer;