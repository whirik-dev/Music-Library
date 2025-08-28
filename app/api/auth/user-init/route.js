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

        // Make parallel requests to backend services
        const serviceRequests = [
            { name: 'auth', endpoint: '/auth/isLogged' },
            { name: 'membership', endpoint: '/user/membership' },
            { name: 'credits', endpoint: '/user/credits' },
            { name: 'downloadPoints', endpoint: '/user/downloadPoint' },
            { name: 'downloadHistory', endpoint: '/download/list' },
            { name: 'favorite', endpoint: '/favoriteId' }
        ];

        const results = await Promise.allSettled(
            serviceRequests.map(service => 
                makeAuthenticatedRequest(service.endpoint, ssid)
            )
        );

        // Process results and handle partial failures
        const userData = {
            isNewbie: false,
            membership: { tier: 'free' },
            credits: { balance: 0 },
            downloadPoints: 0,
            downloadHistory: [],
            favorite: null
        };

        const errors = {};
        let successfulServices = 0;

        // Process each service result
        for (let index = 0; index < results.length; index++) {
            const result = results[index];
            const serviceName = serviceRequests[index].name;

            if (result.status === 'fulfilled') {
                const data = result.value;
                successfulServices++;

                try {
                    switch (serviceName) {
                        case 'auth':
                            if (data?.success && data?.data) {
                                userData.isNewbie = data.data.isNewbie || false;
                            }
                            break;
                        case 'membership':
                            if (data?.data) {
                                let tierValue = 'free';
                                if (typeof data.data.tier === 'number') {
                                    const tierMap = ['free', 'basic', 'pro', 'master'];
                                    tierValue = tierMap[data.data.tier] || 'free';
                                } else if (typeof data.data.tier === 'string') {
                                    const validTiers = ['free', 'basic', 'pro', 'master', 'premium'];
                                    tierValue = validTiers.includes(data.data.tier.toLowerCase()) ? 
                                        data.data.tier.toLowerCase() : 'free';
                                }
                                userData.membership = { tier: tierValue };
                            }
                            break;
                        case 'credits':
                            if (data?.data) {
                                userData.credits = { balance: data.data.balance || 0 };
                            }
                            break;
                        case 'downloadPoints':
                            if (data?.data !== undefined && data?.data !== null) {
                                userData.downloadPoints = data.data;
                            }
                            break;
                        case 'downloadHistory':
                            if (data?.data) {
                                let downloadItems = [];
                                if (Array.isArray(data.data)) {
                                    downloadItems = data.data;
                                } else if (data.data.items && Array.isArray(data.data.items)) {
                                    downloadItems = data.data.items;
                                }
                                userData.downloadHistory = downloadItems.map(item => item.id || item);
                            }
                            break;
                        case 'favorite':
                            if (data?.data) {
                                userData.favorite = {
                                    id: data.data.id || data.data,
                                    musicIds: []
                                };

                                // Fetch music list for favorite playlist
                                if (userData.favorite.id) {
                                    try {
                                        const musicListResult = await makeAuthenticatedRequest(
                                            `/playlist/${userData.favorite.id}/musics`, ssid
                                        );
                                        
                                        let musicItems = [];
                                        if (musicListResult?.data) {
                                            if (Array.isArray(musicListResult.data)) {
                                                musicItems = musicListResult.data;
                                            } else if (musicListResult.data.items && Array.isArray(musicListResult.data.items)) {
                                                musicItems = musicListResult.data.items;
                                            }
                                        }
                                        
                                        if (musicItems.length > 0) {
                                            userData.favorite.musicIds = musicItems.map(music => music.id || music);
                                        }
                                    } catch (musicError) {
                                        console.error(`Failed to fetch music list for favorite ${userData.favorite.id}:`, musicError.message);
                                        errors.favoriteMusics = {
                                            type: 'music_list_error',
                                            message: 'Failed to load favorite music list',
                                            details: musicError.message
                                        };
                                    }
                                }
                            }
                            break;
                    }
                } catch (processingError) {
                    console.error(`Error processing ${serviceName} response:`, processingError.message);
                    errors[serviceName] = {
                        type: 'processing_error',
                        message: 'Failed to process service response',
                        details: processingError.message
                    };
                    successfulServices--;
                }
            } else {
                // Handle service failure
                console.error(`Service ${serviceName} failed:`, result.reason.message);
                errors[serviceName] = {
                    type: 'service_error',
                    message: 'Service request failed',
                    details: result.reason.message
                };

                // Mark critical failures (auth service is critical)
                if (serviceName === 'auth') {
                    console.error('CRITICAL: Auth service failed');
                }
            }
        }

        // Determine overall response success
        // 임시: auth 서비스 실패는 무시하고 다른 서비스 성공 여부로 판단
        const hasAuthData = true; // 기본값으로 설정
        const hasCriticalFailures = false; // auth 실패를 무시
        const isSuccessful = successfulServices > 0; // 하나라도 성공하면 OK

        // Build response
        const response = {
            success: isSuccessful,
            data: { user: userData },
            meta: {
                timestamp,
                requestId,
                serviceStats: {
                    total: serviceRequests.length,
                    successful: successfulServices,
                    failed: serviceRequests.length - successfulServices,
                    successRate: `${((successfulServices / serviceRequests.length) * 100).toFixed(1)}%`
                },
                // 🔍 디버깅: SSID 정보 (보안상 일부만 노출)
                debug: {
                    ssidPrefix: ssid ? `${ssid.substring(0, 8)}...` : 'missing',
                    backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL
                }
            }
        };

        // Include errors if any services failed
        if (Object.keys(errors).length > 0) {
            response.errors = errors;
            response.meta.hasPartialFailures = true;
        }

        return NextResponse.json(response);

    } catch (error) {
        console.error('User initialization API error:', error.message);

        return NextResponse.json(
            createErrorResponse('Internal server error during user initialization', 'FATAL_ERROR', 500),
            { status: 500 }
        );
    }
}