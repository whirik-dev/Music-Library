import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const customerKey = searchParams.get('customerKey');
        const authKey = searchParams.get('authKey');

        if (!customerKey || !authKey) {
            console.error('Missing parameters:', { customerKey, authKey });
            return NextResponse.redirect(new URL('/payment/fail', request.url));
        }

        // 토스페이먼츠 빌링키 발급 API 호출
        const secretKey = process.env.TOSS_SECRET_KEY;
        if (!secretKey) {
            console.error('Missing TOSS_SECRET_KEY environment variable');
            return NextResponse.redirect(new URL('/payment/fail', request.url));
        }

        // Basic 인증 헤더 생성 (시크릿키:를 base64 인코딩)
        const encodedAuth = Buffer.from(`${secretKey}:`).toString('base64');

        // 빌링키 발급 API 호출
        const billingResponse = await fetch('https://api.tosspayments.com/v1/billing/authorizations/issue', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${encodedAuth}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customerKey,
                authKey,
            }),
        });

        if (!billingResponse.ok) {
            const errorData = await billingResponse.json();
            console.error('Billing key issuance failed:', errorData);
            return NextResponse.redirect(new URL('/payment/fail', request.url));
        }

        const billingData = await billingResponse.json();
        console.log('Billing key issued successfully:', {
            customerKey: billingData.customerKey,
            billingKey: billingData.billingKey,
            method: billingData.method,
        });

        // 빌링키를 저장
        try {
            await fetch(`${request.nextUrl.origin}/api/payment/billing-keys`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerKey: billingData.customerKey,
                    billingKey: billingData.billingKey,
                    cardInfo: billingData.card,
                }),
            });
        } catch (saveError) {
            console.error('Failed to save billing key:', saveError);
            // 저장 실패해도 성공 페이지로 이동 (빌링키는 발급됨)
        }

        // 성공 페이지로 리다이렉트
        return NextResponse.redirect(new URL('/payment/success', request.url));
        
    } catch (error) {
        console.error('Billing auth error:', error);
        return NextResponse.redirect(new URL('/payment/fail', request.url));
    }
}