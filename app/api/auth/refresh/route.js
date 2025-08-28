import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token || !token.ssid) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid token' 
      }, { status: 401 });
    }

    // 백엔드에서 세션 유효성 재확인
    const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/verify-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ssid: token.ssid
      }),
    });

    if (!verifyResponse.ok) {
      return NextResponse.json({ 
        success: false, 
        message: 'Session expired on backend' 
      }, { status: 401 });
    }

    // 새로운 토큰 생성 (NextAuth가 자동으로 처리)
    const now = Math.floor(Date.now() / 1000);
    const newToken = {
      ...token,
      iat: now,
      exp: now + (15 * 60) // 15분 연장
    };

    // 쿠키 업데이트는 NextAuth 미들웨어에서 자동 처리됨
    return NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      exp: newToken.exp
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to refresh token' 
    }, { status: 500 });
  }
}