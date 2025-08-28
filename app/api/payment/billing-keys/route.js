import { NextResponse } from 'next/server';

export const runtime = 'edge';

// 간단한 메모리 저장소 (실제로는 데이터베이스 사용)
const billingKeys = new Map();

// 빌링키 저장
export async function POST(request) {
    try {
        const { customerKey, billingKey, cardInfo } = await request.json();

        if (!customerKey || !billingKey) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        // 빌링키 저장 (실제로는 데이터베이스에 저장)
        billingKeys.set(customerKey, {
            billingKey,
            cardInfo,
            createdAt: new Date().toISOString(),
        });

        console.log('Billing key saved:', { customerKey, billingKey });

        return NextResponse.json({ success: true });
        
    } catch (error) {
        console.error('Save billing key error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// 빌링키 조회
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const customerKey = searchParams.get('customerKey');

        if (!customerKey) {
            return NextResponse.json(
                { error: 'Missing customerKey parameter' },
                { status: 400 }
            );
        }

        const billingData = billingKeys.get(customerKey);
        
        if (!billingData) {
            return NextResponse.json(
                { error: 'Billing key not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(billingData);
        
    } catch (error) {
        console.error('Get billing key error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}