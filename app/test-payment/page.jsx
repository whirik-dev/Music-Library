"use client"
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button2";

export default function TestPayment() {
    const router = useRouter();

    // 결제 성공 시뮬레이션
    const simulateSuccess = () => {
        const params = new URLSearchParams({
            r: 'success',
            orderId: 'order_1757988894724_rq9bxalua7',
            paymentKey: 'tbill20250916111455SHWo2',
            amount: '259080'
        });
        
        router.push(`/payment?${params.toString()}`);
    };

    // 결제 실패 시뮬레이션
    const simulateFailure = () => {
        const params = new URLSearchParams({
            r: 'fail',
            code: 'REJECT_CARD_COMPANY',
            message: encodeURIComponent('카드사에서 거절된 결제입니다.')
        });
        
        router.push(`/payment?${params.toString()}`);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900">
                        결제 테스트
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        토스페이먼츠 결제 응답을 시뮬레이션합니다
                    </p>
                </div>
                
                <div className="space-y-4">
                    <Button 
                        className="w-full bg-green-600 hover:bg-green-700"
                        name="결제 성공 시뮬레이션"
                        onClick={simulateSuccess}
                    />
                    
                    <Button 
                        className="w-full bg-red-600 hover:bg-red-700"
                        name="결제 실패 시뮬레이션"
                        onClick={simulateFailure}
                    />
                    
                    <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2">테스트 URL 예시:</h3>
                        <div className="text-xs text-blue-700 break-all">
                            <p className="mb-2">
                                <strong>성공:</strong> /payment?r=success&orderId=order_123&paymentKey=key_123&amount=259080
                            </p>
                            <p>
                                <strong>실패:</strong> /payment?r=fail&code=REJECT_CARD_COMPANY&message=카드사%20거절
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}