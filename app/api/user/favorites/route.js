import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function GET(request) {
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

    // favoriteList에서 음악 ID들을 가져와서 각각의 음악 정보를 조회
    const { searchParams } = new URL(request.url);
    const favoriteIds = searchParams.get('ids')?.split(',') || [];

    if (favoriteIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    // 각 음악 ID에 대해 백엔드에서 정보를 가져옴
    const musicDataPromises = favoriteIds.map(async (musicId) => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/music/${musicId}`, {
          headers: {
            'Authorization': `Bearer ${token.ssid}`
          }
        });
        const result = await response.json();
        
        if (result.success) {
          return { id: musicId, data: result.data };
        }
        return null;
      } catch (error) {
        console.error(`Error fetching music ${musicId}:`, error);
        return null;
      }
    });

    const musicDataResults = await Promise.all(musicDataPromises);
    const validMusicData = musicDataResults.filter(item => item !== null);

    return NextResponse.json({
      success: true,
      data: validMusicData
    });

  } catch (error) {
    console.error('Get favorites error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to get favorites' 
    }, { status: 500 });
  }
}