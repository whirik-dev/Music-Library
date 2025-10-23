import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const ssid = formData.get('ssid');
        const fileName = formData.get('fileName');

        if (!file || !ssid || !fileName) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // 파일을 Buffer로 변환
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // R2에 업로드
        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileName,
            Body: buffer,
            ContentType: file.type,
        });

        await s3Client.send(command);

        // 공개 URL 생성
        const publicUrl = `https://tailoredrequestfiles.probgm.com/tailored-service-upload/${fileName}`;

        return NextResponse.json({
            success: true,
            data: {
                fileName,
                publicUrl,
                size: file.size,
                type: file.type,
            },
        });
    } catch (error) {
        console.error('R2 upload error:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
