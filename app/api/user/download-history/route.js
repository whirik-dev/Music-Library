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

    // downloadHistory에서 URL들을 가져와서 음악 ID를 추출하고 정보를 조회
    const { searchParams } = new URL(request.url);
    const downloadUrls = searchParams.get('urls')?.split(',') || [];

    if (downloadUrls.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    // URL에서 음악 ID 추출하는 함수
    const extractMusicIdFromUrl = (url) => {
      const patterns = [
        /\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i,
        /\/([a-f0-9]{32})/i,
        /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i,
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          return match[1];
        }
      }
      return null;
    };

    // 유니크한 음악 ID들 추출
    const musicIds = [...new Set(
      downloadUrls
        .map(url => extractMusicIdFromUrl(decodeURIComponent(url)))
        .filter(id => id !== null)
    )];

    if (musicIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    // 각 음악 ID에 대해 백엔드에서 정보를 가져옴
    const musicDataPromises = musicIds.map(async (musicId) => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/music/${musicId}`, {
          headers: {
            'Authorization': `Bearer ${ssid}`
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
    console.error('Get download history error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to get download history' 
    }, { status: 500 });
  }
}