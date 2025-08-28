import { NextResponse } from 'next/server';
import { validateAPISession } from '@/utils/authHelpers';

export async function POST(request) {
    try {
        // Validate session using secure helper
        const validation = await validateAPISession(request);
        
        if (!validation.isValid) {
            console.log(`[${new Date().toISOString()}] No valid session found for signout - treating as already logged out`);
            return NextResponse.json(
                {
                    success: true,
                    message: 'Already logged out',
                    timestamp: new Date().toISOString()
                },
                { status: 200 }
            );
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

        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] Signout request for user: ${ssid}`);

        try {
            // Proxy request to backend /auth/signout endpoint
            const response = await fetch(`${backendUrl}/auth/signout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ssid}`
                }
            });

            console.log(`[${new Date().toISOString()}] Backend /auth/signout responded with status: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Unknown error');
                console.warn(`[${new Date().toISOString()}] Backend signout failed: ${response.status} ${response.statusText}`);

                return NextResponse.json(
                    {
                        success: false,
                        error: 'Signout failed',
                        details: errorText,
                        timestamp: new Date().toISOString()
                    },
                    { status: response.status }
                );
            }

            const data = await response.json();
            console.log(`[${new Date().toISOString()}] Signout successful`);

            return NextResponse.json({
                success: true,
                data,
                timestamp: new Date().toISOString()
            });

        } catch (fetchError) {
            console.error(`[${new Date().toISOString()}] Network error during signout:`, fetchError.message);

            return NextResponse.json(
                {
                    success: false,
                    error: 'Unable to signout - backend service unavailable',
                    timestamp: new Date().toISOString()
                },
                { status: 503 }
            );
        }

    } catch (error) {
        const timestamp = new Date().toISOString();
        const errorId = Math.random().toString(36).substring(2, 15);

        console.error(`[${timestamp}] FATAL ERROR in signout API (ID: ${errorId}):`, {
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