import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token || !token.ssid) {
      return NextResponse.json({ 
        success: false, 
        message: 'No valid session found' 
      }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: 'Channel ID is required' 
      }, { status: 400 });
    }

    // 백엔드에 채널 수정 요청
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/channel/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token.ssid}`
      },
      body: JSON.stringify(body)
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        message: result.message || 'Failed to update channel'
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Update channel error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update channel' 
    }, { status: 500 });
  }
}