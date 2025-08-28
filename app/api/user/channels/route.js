import { NextResponse } from "next/server";
import { validateAPISession } from '@/utils/authHelpers';

export async function GET(request) {
  try {
    // Validate session using secure helper
    const validation = await validateAPISession(request);
    
    if (!validation.isValid) {
      return NextResponse.json(validation.error, { status: validation.status });
    }

    const { ssid } = validation;

    // 백엔드에서 채널 정보 조회
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/channels`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${ssid}`
      }
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        message: result.message || 'Failed to fetch channels'
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Get channels error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to get channels' 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Validate session using secure helper
    const validation = await validateAPISession(request);
    
    if (!validation.isValid) {
      return NextResponse.json(validation.error, { status: validation.status });
    }

    const { ssid } = validation;

    const body = await request.json();

    // 백엔드에 채널 생성/수정 요청
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/channels`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${ssid}`
      },
      body: JSON.stringify(body)
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        message: result.message || 'Failed to create/update channel'
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Create/update channel error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create/update channel' 
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    // Validate session using secure helper
    const validation = await validateAPISession(request);
    
    if (!validation.isValid) {
      return NextResponse.json(validation.error, { status: validation.status });
    }

    const { ssid } = validation;

    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('id');

    if (!channelId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Channel ID is required' 
      }, { status: 400 });
    }

    // 백엔드에 채널 삭제 요청
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/channels/${channelId}`, {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${ssid}`
      }
    });

    if (!response.ok) {
      const result = await response.json();
      return NextResponse.json({
        success: false,
        message: result.message || 'Failed to delete channel'
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      message: 'Channel deleted successfully'
    });

  } catch (error) {
    console.error('Delete channel error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to delete channel' 
    }, { status: 500 });
  }
}