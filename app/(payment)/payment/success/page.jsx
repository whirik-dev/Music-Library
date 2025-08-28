'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentSuccessPage() {
    const router = useRouter();

    useEffect(() => {
        // 3초 후 메인 페이지로 이동
        const timer = setTimeout(() => {
            router.push('/');
        }, 3000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    카드 등록 완료!
                </h1>
                
                <p className="text-gray-600 mb-6">
                    자동결제 카드가 성공적으로 등록되었습니다.
                </p>
                
                <button
                    onClick={() => router.push('/')}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    메인으로 돌아가기
                </button>
                
                <p className="text-sm text-gray-400 mt-4">
                    3초 후 자동으로 이동됩니다.
                </p>
            </div>
        </div>
    );
}