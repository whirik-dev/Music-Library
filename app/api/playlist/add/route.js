import { NextResponse } from 'next/server';
import { validateAPISession } from '@/utils/authHelpers';

export async function POST(request) {
    try {
        // Validate session using secure helper
        const validation = await validateAPISession(request);
        
        if (!validation.isValid) {
            return NextResponse.json(validation.error, { status: validation.status });
        }

        const { ssid } = validation;

        // Get backend service URL from environment variables
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!backendUrl) {
            console.error('NEXT_PUBLIC_BACKEND_URL environment variable is not configured');
            return NextResponse.json(
                {
                    success: false,
                    error: 'Backend service configuration error'
                },
                { status: 500 }
            );
        }

        // Parse request body
        const body = await request.json();
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] Playlist add request for user: ${ssid}`, body);

        try {
            // Proxy request to backend /playlist/add endpoint
            const response = await fetch(`${backendUrl}/playlist/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ssid}`
                },
                body: JSON.stringify(body)
            });

            console.log(`[${new Date().toISOString()}] Backend /playlist/add responded with status: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Unknown error');
                console.warn(`[${new Date().toISOString()}] Backend playlist add failed: ${response.status} ${response.statusText}`);

                return NextResponse.json(
                    {
                        success: false,
                        error: 'Playlist add failed',
                        details: errorText,
                        timestamp: new Date().toISOString()
                    },
                    { status: response.status }
                );
            }

            const data = await response.json();
            console.log(`[${new Date().toISOString()}] Playlist add successful`);

            return NextResponse.json(data);

        } catch (fetchError) {
            console.error(`[${new Date().toISOString()}] Network error during playlist add:`, fetchError.message);

            return NextResponse.json(
                {
                    success: false,
                    error: 'Unable to add to playlist - backend service unavailable',
                    timestamp: new Date().toISOString()
                },
                { status: 503 }
            );
        }

    } catch (error) {
        const timestamp = new Date().toISOString();
        const errorId = Math.random().toString(36).substring(2, 15);

        console.error(`[${timestamp}] FATAL ERROR in playlist add API (ID: ${errorId}):`, {
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                errorId,
                timestamp
            },
            { status: 500 }
        );
    }
}