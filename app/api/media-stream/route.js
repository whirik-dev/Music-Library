import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const fileUrl = searchParams.get('url');

        if (!fileUrl) {
            return NextResponse.json(
                { success: false, message: 'Missing file URL' },
                { status: 400 }
            );
        }

        // 인증 토큰으로 파일 가져오기
        const response = await fetch(fileUrl, {
            headers: {
                'Authorization': `Bearer ${process.env.R2_ACTION_TOKEN}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch media file');
        }

        // 파일 데이터를 스트림으로 전달
        const blob = await response.blob();
        const buffer = await blob.arrayBuffer();

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'audio/mpeg',
                'Content-Length': response.headers.get('Content-Length') || '',
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error) {
        console.error('Media stream error:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
