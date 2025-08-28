import { NextResponse } from 'next/server';

export const runtime = 'edge';

// 빌링키로 자동결제 승인
export async function POST(request, { params }) {
    try {
        const { billingKey } = params;
        const body = await request.json();
        
        const { customerKey, orderId, orderName, amount } = body;

        if (!customerKey || !orderId || !orderName || !amount) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        const secretKey = process.env.TOSS_SECRET_KEY;
        if (!secretKey) {
            return NextResponse.json(
                { error: 'Missing TOSS_SECRET_KEY environment variable' },
                { status: 500 }
            );
        }

        // Basic 인증 헤더 생성
        const encodedAuth = Buffer.from(`${secretKey}:`).toString('base64');

        // 자동결제 승인 API 호출
        const paymentResponse = await fetch(`https://api.tosspayments.com/v1/billing/${billingKey}`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${encodedAuth}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customerKey,
                amount,
                orderId,
                orderName,
            }),
        });

        if (!paymentResponse.ok) {
            const errorData = await paymentResponse.json();
            console.error('Billing payment failed:', errorData);
            return NextResponse.json(errorData, { status: paymentResponse.status });
        }

        const paymentData = await paymentResponse.json();
        console.log('Billing payment success:', paymentData);

        return NextResponse.json(paymentData);
        
    } catch (error) {
        console.error('Billing payment error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}