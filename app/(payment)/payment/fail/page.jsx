'use client';

import { useRouter } from 'next/navigation';

export default function PaymentFailPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    카드 등록 실패
                </h1>
                
                <p className="text-gray-600 mb-6">
                    카드 등록 중 문제가 발생했습니다.<br />
                    다시 시도해주세요.
                </p>
                
                <div className="space-y-3">
                    <button
                        onClick={() => router.back()}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        다시 시도
                    </button>
                    
                    <button
                        onClick={() => router.push('/')}
                        className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        메인으로 돌아가기
                    </button>
                </div>
            </div>
        </div>
    );
}