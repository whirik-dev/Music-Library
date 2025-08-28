import { NextResponse } from "next/server";
import { validateAPISession } from '@/utils/authHelpers';

export async function POST(request) {
  try {
    // Validate session using secure helper
    const validation = await validateAPISession(request);
    
    if (!validation.isValid) {
      return NextResponse.json(validation.error, { status: validation.status });
    }

    const { ssid } = validation;

    const { asset_id } = await request.json();

    if (!asset_id) {
      return NextResponse.json({ 
        success: false, 
        message: 'Asset ID is required' 
      }, { status: 400 });
    }

    // 백엔드에 다운로드 권한 요청
    const downloadPermission = await fetch(`https://w46-g5e.whirik.com/download/${asset_id}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${ssid}`
      },
    });

    const result = await downloadPermission.json();

    if (result.error) {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: result.message || 'Download permission denied'
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Download permission error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to get download permission' 
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    // Validate session using secure helper
    const validation = await validateAPISession(request);
    
    if (!validation.isValid) {
      return NextResponse.json(validation.error, { status: validation.status });
    }

    const { ssid } = validation;

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json({ 
        success: false, 
        message: 'File ID is required' 
      }, { status: 400 });
    }

    // 파일 다운로드 요청
    const fileUrl = `https://mimiu-test.changhyun-me.workers.dev/${fileId}`;
    const response = await fetch(fileUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ssid}`
      }
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        message: 'File download failed'
      }, { status: response.status });
    }

    // 파일을 스트림으로 전달
    return new Response(response.body, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileId}.mp3"`
      }
    });

  } catch (error) {
    console.error('File download error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to download file' 
    }, { status: 500 });
  }
}