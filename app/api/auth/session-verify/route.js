import { NextResponse } from 'next/server';
import { validateAPISession, makeAuthenticatedRequest, createErrorResponse } from '@/utils/authHelpers';

export async function GET(request) {
    try {
        // Validate session using standardized helper
        const validation = await validateAPISession(request);
        
        if (!validation.isValid) {
            return NextResponse.json(validation.error, { status: validation.status });
        }

        const { ssid, requestId, timestamp } = validation;

        // Make authenticated request to backend
        try {
            const data = await makeAuthenticatedRequest('/auth/isLogged', ssid);

            // Return session verification response
            return NextResponse.json({
                success: true,
                data: {
                    isNewbie: data?.data?.isNewbie || false
                },
                timestamp,
                requestId
            });

        } catch (backendError) {
            console.error('Backend authentication failed:', backendError.message);

            let errorMessage = 'Authentication service unavailable';
            let statusCode = 503;

            if (backendError.message.includes('HTTP 401')) {
                errorMessage = 'Session expired or invalid';
                statusCode = 401;
            } else if (backendError.message.includes('HTTP 403')) {
                errorMessage = 'Access forbidden';
                statusCode = 403;
            }

            return NextResponse.json(
                createErrorResponse(errorMessage, 'BACKEND_ERROR', statusCode, { requestId }),
                { status: statusCode }
            );
        }

    } catch (error) {
        console.error('Session verification API error:', error.message);

        return NextResponse.json(
            createErrorResponse('Internal server error', 'FATAL_ERROR', 500),
            { status: 500 }
        );
    }
}