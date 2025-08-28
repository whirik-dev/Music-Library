import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Get backend service URL from environment variables
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!backendUrl) {
            console.error('NEXT_PUBLIC_BACKEND_URL environment variable is not configured');
            return NextResponse.json(
                {
                    status: 'error',
                    message: 'Backend service configuration error'
                },
                { status: 500 }
            );
        }

        try {
            // Proxy request to backend /health endpoint
            const response = await fetch(`${backendUrl}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.warn(`Backend health check failed: ${response.status} ${response.statusText}`);
                return NextResponse.json(
                    {
                        status: 'error',
                        message: 'Backend service unhealthy'
                    },
                    { status: 503 }
                );
            }

            const data = await response.json();
            return NextResponse.json(data);

        } catch (fetchError) {
            console.error('Network error during health check:', fetchError.message);

            return NextResponse.json(
                {
                    status: 'error',
                    message: 'Backend service unavailable'
                },
                { status: 503 }
            );
        }

    } catch (error) {
        console.error('FATAL ERROR in health check API:', error);

        return NextResponse.json(
            {
                status: 'error',
                message: 'Internal server error'
            },
            { status: 500 }
        );
    }
}