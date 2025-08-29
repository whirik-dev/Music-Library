"use client";

import { useEffect } from "react";
import { useJWTAuth } from "@/hooks/useJWTAuth";
import useAuthStore from "@/stores/authStore";

export default function AuthProvider() {
    const { data: session, status } = useJWTAuth();
    
    const {
        toggleIsLoading,
        setIsNewbie,
        setUserInfo,
        clearUserInfo,
        toggleIsLogged,
        setMembership,
        setCredits,
        setDownloadPoints,
        addDownloadHistory,
        setFavoriteId,
        addFavoriteList
    } = useAuthStore();

    useEffect(() => {
        if (status === "loading") return;

        const verifySession = async (session) => {
            // JWT 토큰에서 가져온 사용자 정보와 인증 상태 확인
            console.log('debug1');
            console.log(JSON.stringify(session));
            console.log(session);
            if (session?.user?.hasAuth) {
                try {
                    console.log('debug2');
                    toggleIsLoading(true);
                    console.log(`[${new Date().toISOString()}] Starting user initialization for user: ${session.user.email}`);

                    // Replace multiple fetch calls with single call to /api/auth/user-init
                    const response = await fetch('/api/auth/user-init', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        if (response.status === 401) {
                            // Handle logout/unauthorized case
                            console.log(`[${new Date().toISOString()}] Session expired or unauthorized, logging out`);
                            clearUserInfo();
                            toggleIsLogged(false);
                            toggleIsLoading(false);
                            return;
                        }

                        const errorText = await response.text();
                        console.error(`[${new Date().toISOString()}] User initialization API failed with status ${response.status}:`, errorText);
                        throw new Error(`HTTP ${response.status}: ${errorText}`);
                    }

                    const result = await response.json();
                    console.log(`[${new Date().toISOString()}] User initialization API response:`, result);

                    // Check if result is empty or invalid
                    if (!result || Object.keys(result).length === 0) {
                        console.warn(`[${new Date().toISOString()}] Received empty response, treating as logout`);
                        clearUserInfo();
                        toggleIsLogged(false);
                        toggleIsLoading(false);
                        return;
                    }

                    // Handle successful response (including partial failures)
                    if (result && result.success && result.data?.user) {
                        const userData = result.data.user;

                        // Set user info from JWT token
                        setUserInfo({
                            email: session.user.email,
                            name: session.user.name,
                            provider: session.user.provider
                        });

                        // Handle isNewbie flag
                        if (userData.isNewbie) {
                            setIsNewbie(true);
                        }

                        // Handle membership data with fallback
                        if (userData.membership?.tier) {
                            setMembership(userData.membership.tier);
                            console.log(`[${new Date().toISOString()}] Membership tier: ${userData.membership.tier}`);
                        } else {
                            console.warn(`[${new Date().toISOString()}] Membership data not available, using default`);
                            setMembership('free'); // Default to 'free'
                        }

                        // Handle credits data with fallback
                        if (userData.credits?.balance !== undefined) {
                            setCredits(userData.credits.balance);
                            console.log(`[${new Date().toISOString()}] Credits balance: ${userData.credits.balance}`);
                        } else {
                            console.warn(`[${new Date().toISOString()}] Credits data not available, using default`);
                            setCredits(0); // Default fallback
                        }

                        // Handle download points
                        if (userData.downloadPoints !== undefined && userData.downloadPoints !== null) {
                            setDownloadPoints(userData.downloadPoints);
                            console.log(`[${new Date().toISOString()}] Download points: ${userData.downloadPoints}`);
                        } else {
                            console.warn(`[${new Date().toISOString()}] Download points data not available`);
                            setDownloadPoints(0); // Default fallback
                        }

                        // Handle download history - maintain existing store method calls
                        if (userData.downloadHistory && Array.isArray(userData.downloadHistory)) {
                            userData.downloadHistory.forEach(downloadId => {
                                addDownloadHistory(downloadId);
                            });
                            console.log(`[${new Date().toISOString()}] Added ${userData.downloadHistory.length} download history items`);
                        } else {
                            console.log(`[${new Date().toISOString()}] Download history is empty or not available`);
                        }

                        // Handle favorite data - maintain existing store method calls
                        if (userData.favorite?.id) {
                            setFavoriteId(userData.favorite.id);
                            console.log(`[${new Date().toISOString()}] Favorite ID: ${userData.favorite.id}`);

                            // Add favorite music list if available
                            if (userData.favorite.musicIds && Array.isArray(userData.favorite.musicIds)) {
                                userData.favorite.musicIds.forEach(musicId => {
                                    addFavoriteList(musicId);
                                });
                                console.log(`[${new Date().toISOString()}] Added ${userData.favorite.musicIds.length} favorite music items`);
                            } else {
                                console.log(`[${new Date().toISOString()}] Favorite music list is empty or not available`);
                            }
                        } else {
                            console.log(`[${new Date().toISOString()}] No favorite ID found`);
                        }

                        // Log any service errors for monitoring
                        if (result.errors && Object.keys(result.errors).length > 0) {
                            console.warn(`[${new Date().toISOString()}] Some services failed during initialization:`, result.errors);

                            // Check for critical service failures
                            if (result.errors.auth) {
                                console.error(`[${new Date().toISOString()}] Critical: Auth service failed - user experience may be degraded`);
                            }
                        }

                        // Set logged in state (maintain existing behavior)
                        toggleIsLogged(true);
                        console.log(`[${new Date().toISOString()}] User initialization completed successfully`);
                    }
                    else {
                        // Handle authentication failure or critical errors
                        console.log(`[${new Date().toISOString()}] User initialization failed. Response:`, result);
                        console.log(`[${new Date().toISOString()}] Response type:`, typeof result, 'Keys:', Object.keys(result || {}));

                        // Check if it's a partial success (some services failed but auth succeeded)
                        if (result && result.data?.user && !result.success) {
                            // Only proceed if auth service succeeded (no critical failures)
                            if (result.meta?.serviceStats && result.errors && !result.errors.auth) {
                                console.warn(`[${new Date().toISOString()}] Partial failure detected, proceeding with available data`);
                                const userData = result.data.user;
                                setUserInfo(session.user);
                                if (userData.isNewbie) setIsNewbie(true);
                                toggleIsLogged(true);
                            } else {
                                console.log(`[${new Date().toISOString()}] Critical auth failure, logging out`);
                                clearUserInfo();
                                toggleIsLogged(false);
                            }
                        } else {
                            console.log(`[${new Date().toISOString()}] No valid user data, clearing session`);
                            clearUserInfo();
                            toggleIsLogged(false);
                        }
                    }

                    toggleIsLoading(false);
                }
                catch (err) {
                    console.log(`[${new Date().toISOString()}] Error during user initialization:`, err);

                    // Fallback: try simple session verification if user-init fails
                    try {
                        console.log(`[${new Date().toISOString()}] Attempting fallback session verification`);
                        const fallbackResponse = await fetch('/api/auth/session-verify', {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });

                        const fallbackResult = await fallbackResponse.json();

                        if (fallbackResult.success) {
                            // Minimal user setup with JWT token verification only
                            setUserInfo({
                                email: session.user.email,
                                name: session.user.name,
                                provider: session.user.provider
                            });
                            if (fallbackResult.data?.isNewbie) {
                                setIsNewbie(true);
                            }
                            toggleIsLogged(true);
                            console.log(`[${new Date().toISOString()}] Fallback session verification successful`);
                        } else {
                            clearUserInfo();
                            toggleIsLogged(false);
                        }
                    } catch (fallbackErr) {
                        console.log(`[${new Date().toISOString()}] Fallback session verification also failed:`, fallbackErr);
                        clearUserInfo();
                        toggleIsLogged(false);
                    } finally {
                        toggleIsLoading(false);
                    }
                }
            }
            else {
                console.log('debug3');
                // Silently handle logout state
                clearUserInfo();
                toggleIsLogged(false);
                toggleIsLoading(false);
            }
        };

        verifySession(session);
    }, [session, status, setUserInfo, clearUserInfo, toggleIsLogged]);

    return null;
}
