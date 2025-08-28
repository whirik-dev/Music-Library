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

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: 'Channel ID is required' 
      }, { status: 400 });
    }

    // 백엔드에 자동 갱신 설정 요청
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/channel/${id}/auto-renewal`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token.ssid}`
      }
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        message: result.message || 'Failed to update auto renewal'
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Update auto renewal error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update auto renewal' 
    }, { status: 500 });
  }
}