import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

/**
 * 클라이언트에서 인증 상태만 확인하는 API
 * SSID는 절대 노출하지 않음
 */
export async function GET(request) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      return NextResponse.json({
        hasAuth: false,
        email: null,
        name: null,
        provider: null
      });
    }

    return NextResponse.json({
      hasAuth: !!token.ssid,
      email: token.email,
      name: token.name,
      provider: token.provider
    });

  } catch (error) {
    console.error('Get auth status error:', error);
    return NextResponse.json({
      hasAuth: false,
      email: null,
      name: null,
      provider: null
    }, { status: 500 });
  }
}