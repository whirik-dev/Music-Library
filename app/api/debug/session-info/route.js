import { auth } from "@/auth";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

/**
 * 개발 환경에서만 사용하는 세션 디버깅 API
 * 클라이언트와 서버 세션의 차이를 확인
 */
export async function GET(request) {
  // 개발 환경에서만 동작
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ 
      error: 'This endpoint is only available in development' 
    }, { status: 404 });
  }

  try {
    // 1. 클라이언트가 받는 세션 정보 (SSID 없어야 함)
    const clientSession = await auth();
    
    // 2. 서버에서 접근 가능한 토큰 정보 (SSID 있음)
    const serverToken = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      clientSession: {
        user: clientSession?.user || null,
        expires: clientSession?.expires || null,
        hasSSID: !!(clientSession?.user?.ssid), // 이게 false여야 함
      },
      serverToken: {
        hasSSID: !!serverToken?.ssid, // 이게 true여야 함
        email: serverToken?.email || null,
        provider: serverToken?.provider || null,
        ssidLength: serverToken?.ssid?.length || 0, // 길이만 표시 (값은 노출 안함)
      },
      securityCheck: {
        clientSSIDExposed: !!(clientSession?.user?.ssid),
        serverSSIDAvailable: !!serverToken?.ssid,
        isSecure: !(clientSession?.user?.ssid) && !!serverToken?.ssid
      }
    });

  } catch (error) {
    console.error('Session debug error:', error);
    return NextResponse.json({ 
      error: 'Failed to get session info',
      message: error.message 
    }, { status: 500 });
  }
}