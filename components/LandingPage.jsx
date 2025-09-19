'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';

const Landing = ({ }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentFeature, setCurrentFeature] = useState(0);

    useEffect(() => {
        setIsVisible(true);
        const interval = setInterval(() => {
            setCurrentFeature(prev => (prev + 1) % 4);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const features = [
        {
            title: "AI 맞춤 BGM",
            description: "인공지능이 당신의 취향을 분석해 완벽한 배경음악을 추천합니다",
            icon: "🎵"
        },
        {
            title: "무제한 다운로드",
            description: "프리미엄 플랜으로 고품질 음원을 무제한으로 다운로드하세요",
            icon: "⬇️"
        },
        {
            title: "실시간 스트리밍",
            description: "끊김 없는 고품질 스트리밍으로 언제 어디서나 음악을 즐기세요",
            icon: "🎧"
        },
        {
            title: "커스텀 플레이리스트",
            description: "나만의 플레이리스트를 만들고 친구들과 공유해보세요",
            icon: "📝"
        }
    ];



    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/80 to-teal-400/30"></div>
                <div className="relative px-6 py-20 lg:px-8 lg:py-32">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                            <div className="mb-8">
                                <span className="text-6xl font-light bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                                    PRO
                                </span>
                                <span className="text-6xl font-extrabold text-white ml-2">BGM</span>
                                <div className="text-sm font-medium text-zinc-400 mt-2">powered by WhiRik</div>
                            </div>

                            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
                                당신의 창작을 위한
                                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent block">
                                    완벽한 배경음악
                                </span>
                            </h1>

                            <p className="text-xl text-zinc-300 mb-8 max-w-2xl mx-auto">
                                AI가 추천하는 맞춤형 BGM으로 영상, 팟캐스트, 프레젠테이션을 더욱 생동감 있게 만들어보세요
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105">
                                    웨잇리스트 등록하기
                                </button>
                                <button className="px-8 py-4 border border-zinc-600 text-white font-semibold rounded-lg hover:bg-zinc-800 transition-all duration-300">
                                    데모 보기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                            왜 PROBGM을 선택해야 할까요?
                        </h2>
                        <p className="text-zinc-400 text-lg">
                            창작자들이 선택하는 이유가 있습니다
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className={`p-6 bg-zinc-800/50 rounded-xl border border-zinc-700 hover:border-purple-500/50 transition-all duration-500 transform hover:scale-105 ${currentFeature === index ? 'ring-2 ring-purple-500/50' : ''
                                    }`}
                            >
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                                <p className="text-zinc-400">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 px-6 lg:px-8 bg-zinc-800/30">
                <div className="mx-auto max-w-4xl">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-3xl lg:text-4xl font-bold text-white mb-2">50K+</div>
                            <div className="text-zinc-400">고품질 음원</div>
                        </div>
                        <div>
                            <div className="text-3xl lg:text-4xl font-bold text-white mb-2">10K+</div>
                            <div className="text-zinc-400">활성 사용자</div>
                        </div>
                        <div>
                            <div className="text-3xl lg:text-4xl font-bold text-white mb-2">99.9%</div>
                            <div className="text-zinc-400">업타임</div>
                        </div>
                        <div>
                            <div className="text-3xl lg:text-4xl font-bold text-white mb-2">24/7</div>
                            <div className="text-zinc-400">고객지원</div>
                        </div>
                    </div>
                </div>
            </section>


            {/* CTA Section */}
            <section className="py-20 px-6 lg:px-8 bg-gradient-to-r from-purple-600/20 to-blue-600/20">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                        얼리 액세스 신청하기
                    </h2>
                    <p className="text-xl text-zinc-300 mb-8">
                        PROBGM 출시 소식을 가장 먼저 받아보세요
                    </p>
                    <button className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105">
                        웨잇리스트 등록하기
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 lg:px-8 border-t border-zinc-800">
                <div className="mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex flex-row gap-4 mb-4">
                                <div className="flex flex-col items-baseline gap-0">
                                    <span className="text-2xl font-black bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                                        <span className="font-light">PRO</span>
                                        <span className="font-extrabold text-white">BGM</span>
                                    </span>
                                    <span className="text-xs font-medium text-zinc-400">powered by WhiRik</span>
                                </div>
                            </div>
                            <p className="text-zinc-400 mb-4">
                                창작자를 위한 최고의 배경음악 라이브러리
                            </p>
                            <div className="flex space-x-4">
                                <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                                    <span className="sr-only">Facebook</span>
                                    📘
                                </a>
                                <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                                    <span className="sr-only">Instagram</span>
                                    📷
                                </a>
                                <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                                    <span className="sr-only">YouTube</span>
                                    📺
                                </a>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-white font-semibold mb-4">서비스</h3>
                            <ul className="space-y-2 text-zinc-400">
                                <li><a href="#" className="hover:text-white transition-colors">음원 라이브러리</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">AI 추천</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">플레이리스트</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">다운로드</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-white font-semibold mb-4">지원</h3>
                            <ul className="space-y-2 text-zinc-400">
                                <li><a href="#" className="hover:text-white transition-colors">고객센터</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">이용약관</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">개인정보처리방침</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">문의하기</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-zinc-800 text-center text-zinc-400">
                        <p>&copy; 2024 WhiRik. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Landing;