import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: 'No token found' 
      }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      exp: token.exp, // 만료 시간 (Unix timestamp)
      iat: token.iat, // 발급 시간
      timeUntilExpiry: token.exp - Math.floor(Date.now() / 1000)
    });

  } catch (error) {
    console.error('Get token info error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to get token info' 
    }, { status: 500 });
  }
}