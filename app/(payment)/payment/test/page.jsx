'use client';

import { useState } from 'react';

export default function PaymentTestPage() {
    const [customerKey, setCustomerKey] = useState('');
    const [amount, setAmount] = useState('1000');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleTestPayment = async () => {
        if (!customerKey) {
            alert('Customer Key를 입력해주세요');
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            // 1. 빌링키 조회
            const billingResponse = await fetch(`/api/payment/billing-keys?customerKey=${customerKey}`);
            
            if (!billingResponse.ok) {
                throw new Error('빌링키를 찾을 수 없습니다');
            }

            const billingData = await billingResponse.json();
            
            // 2. 결제 승인
            const orderId = `order_${Date.now()}`;
            const paymentResponse = await fetch(`/api/payment/billing/${billingData.billingKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerKey,
                    orderId,
                    orderName: '테스트 상품',
                    amount: parseInt(amount),
                }),
            });

            const paymentResult = await paymentResponse.json();
            
            if (paymentResponse.ok) {
                setResult({ success: true, data: paymentResult });
            } else {
                setResult({ success: false, error: paymentResult });
            }

        } catch (error) {
            setResult({ success: false, error: { message: error.message } });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold mb-6">자동결제 테스트</h1>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Customer Key
                        </label>
                        <input
                            type="text"
                            value={customerKey}
                            onChange={(e) => setCustomerKey(e.target.value)}
                            placeholder="등록된 Customer Key를 입력하세요"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            결제 금액
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    
                    <button
                        onClick={handleTestPayment}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? '결제 진행 중...' : '자동결제 실행'}
                    </button>
                </div>

                {result && (
                    <div className="mt-6 p-4 rounded-lg border">
                        <h3 className="font-medium mb-2">
                            {result.success ? '✅ 결제 성공' : '❌ 결제 실패'}
                        </h3>
                        <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
                            {JSON.stringify(result.success ? result.data : result.error, null, 2)}
                        </pre>
                    </div>
                )}

                <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                    <h3 className="font-medium text-yellow-800 mb-2">사용 방법</h3>
                    <ol className="text-sm text-yellow-700 space-y-1">
                        <li>1. 먼저 메인 페이지에서 카드를 등록하세요</li>
                        <li>2. 등록 시 표시된 Customer Key를 복사하세요</li>
                        <li>3. 위 입력란에 Customer Key를 입력하고 테스트하세요</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}