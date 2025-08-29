'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
import usePaymentStore from "@/stores/paymentStore";

export default function PaymentModal({ onClose, onSuccess }) {
    const [tp, setTp] = useState(null);

    const {
        paymentStep,    
        setPaymentStep
    } = usePaymentStore();

    // 한 번 생성해서 유지(권장: 서버에서 만들어 내려주기)
    const customerKeyRef = useRef(null);
    if (typeof window !== 'undefined' && !customerKeyRef.current) {
        if (window.crypto && window.crypto.randomUUID) {
            customerKeyRef.current = window.crypto.randomUUID();
        } else {
            customerKeyRef.current = `ck_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        }
    }

    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_TEST; // 예: test_ck_xxxxx

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                if (!clientKey) throw new Error('Missing env: NEXT_PUBLIC_TOSS_CLIENT_TEST');
                const instance = await loadTossPayments(clientKey);
                if (mounted) setTp(instance);
            } catch (err) {
                console.error('[TossPayments] load error:', err);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [clientKey]);

    const handleStartBilling = useCallback(async () => {
        if (!tp) return;
        try {
            const customerKey = customerKeyRef.current;

            await tp
                .payment({ customerKey })
                .requestBillingAuth({
                    method: 'CARD',
                    successUrl: `${window.location.origin}/payment/billing`,
                    failUrl: `${window.location.origin}/fail`,
                    customerEmail: 'customer123@gmail.com',
                    customerName: '김토스',
                });

            // 보통 위에서 리다이렉트됨. 성공 처리는 successUrl 페이지에서.
            if (onSuccess) onSuccess();
        } catch (err) {
            setPaymentStep(null);
            console.error('[TossPayments] requestBillingAuth error:', err);
        }
    }, [tp, onSuccess]);

    return (
        <>
            {paymentStep === 'payment' ? (
                <div className={`fixed inset-0 z-[100] bg-black/30 flex items-center justify-center`}>
                    <div className="w-[480px] bg-white rounded-xl p-6 space-y-5">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">자동결제 카드 등록</h2>
                            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 cursor-pointer">✕</button>
                        </div>

                        <p className="text-gray-600">
                            안전한 결제를 위해 카드를 등록해주세요.
                        </p>

                        <button
                            disabled={!tp}
                            onClick={handleStartBilling}
                            className="w-full bg-[#0064ff] text-white py-3 rounded-lg disabled:opacity-50 opacity-90 hover:opacity-100 cursor-pointer text-bold"
                        >
                            {tp ? '카드 등록하기' : '로딩 중...'}
                        </button>

                        <div className="text-xs text-gray-400">
                            customerKey: {customerKeyRef.current} / DEV only
                        </div>
                    </div>
                </div>
            ) : (<></>)}
        </>
    );
}
