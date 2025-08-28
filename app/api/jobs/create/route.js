import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function POST(request) {
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

    const body = await request.json();

    // 백엔드에 작업 생성 요청
    const response = await fetch('http://localhost:3030/jobs/create', {
      method: 'POST',
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
        message: result.message || 'Failed to create job'
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Create job error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create job' 
    }, { status: 500 });
  }
}