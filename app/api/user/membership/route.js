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

    // 백엔드에서 멤버십 정보 조회
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/membership`, {
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
        message: result.message || 'Failed to fetch membership info'
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Get membership error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to get membership info' 
    }, { status: 500 });
  }
}