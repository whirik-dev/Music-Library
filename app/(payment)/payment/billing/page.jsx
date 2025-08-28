'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function BillingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const customerKey = searchParams.get('customerKey');
        const authKey = searchParams.get('authKey');

        if (customerKey && authKey) {
            // API 엔드포인트로 리다이렉트
            window.location.href = `/api/payment/billing?customerKey=${customerKey}&authKey=${authKey}`;
        } else {
            // 파라미터가 없으면 실패 페이지로
            router.push('/payment/fail');
        }
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">결제 정보를 처리하고 있습니다...</p>
            </div>
        </div>
    );
}

export default function BillingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">로딩 중...</p>
                </div>
            </div>
        }>
            <BillingContent />
        </Suspense>
    );
}