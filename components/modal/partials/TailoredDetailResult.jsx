import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Button from "@/components/ui/Button2"

const TailoredDetailResult = ({ id, onJobUpdate }) => {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [audioLoading, setAudioLoading] = useState(false);

    // 오디오 미리보기 가져오기
    const fetchAudioPreview = async () => {
        if (!session?.user?.ssid || !id) return;

        setAudioLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tailored/preview/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.ssid}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // JSON 응답에서 wav_url 추출
            const data = await response.json();

            if (data.success && data.data?.wav_url) {
                const wavUrl = data.data.wav_url;

                // S3 URL인 경우 프록시를 통해 접근하거나 직접 사용
                if (wavUrl.startsWith('s3://')) {
                    // S3 URL을 HTTP URL로 변환하거나 프록시 엔드포인트 사용
                    // 예: s3://bucket/path -> https://bucket.s3.region.amazonaws.com/path
                    // 또는 백엔드 프록시 엔드포인트 사용
                    setAudioUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tailored/audio-proxy/${id}`);
                } else {
                    // 이미 HTTP URL인 경우 직접 사용
                    setAudioUrl(wavUrl);
                }
            } else {
                throw new Error(data.message || 'Audio URL not found in response');
            }
        } catch (err) {
            console.error('Error fetching audio preview:', err);
            setError('Failed to load audio preview');
        } finally {
            setAudioLoading(false);
        }
    };

    useEffect(() => {
        fetchAudioPreview();

        // 컴포넌트 언마운트 시 URL 정리
        return () => {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [id, session]);

    const retryHandler = async () => {
        if (!session?.user?.ssid) {
            setError('Authentication required');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tailored/retry/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.ssid}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                // 성공 시 상위 컴포넌트에 알림
                if (onJobUpdate) {
                    onJobUpdate();
                }
                console.log('Retry successful:', data);
            } else {
                throw new Error(data.message || 'Failed to retry job');
            }
        } catch (err) {
            console.error('Error retrying job:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const confirmHandler = async () => {
        if (!session?.user?.ssid) {
            setError('Authentication required');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tailored/confirm/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.ssid}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                // 성공 시 상위 컴포넌트에 알림
                if (onJobUpdate) {
                    onJobUpdate();
                }
                console.log('Confirm successful:', data);
            } else {
                throw new Error(data.message || 'Failed to confirm job');
            }
        } catch (err) {
            console.error('Error confirming job:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="bg-foreground/3 p-3 rounded-lg">
                <div className="capitalize font-bold mb-3">
                    tailored service completed
                </div>

                <div className="bg-foreground/3 p-3 rounded-lg mb-3">
                    <div className="text-xs text-foreground/50 uppercase mb-2">
                        Status
                    </div>
                    <div className="text-sm mb-2">
                        Your result music has arrived.
                    </div>
                    <div className="text-sm text-foreground/70">
                        Please listen and click confirm. If not confirmed within 72 hours, it will be automatically confirmed.
                    </div>
                </div>

                <div className="bg-foreground/3 p-3 rounded-lg">
                    <div className="text-xs text-foreground/50 uppercase mb-1">
                        Offer Number
                    </div>
                    <div className="text-lg font-bold">
                        #{id}
                    </div>
                </div>
            </div>
            <div className="bg-foreground/3 p-3 rounded-lg">
                <div className="capitalize font-bold mb-3">
                    result
                </div>

                <div className="bg-foreground/3 p-3 rounded-lg mb-3">
                    <div className="text-xs text-foreground/50 uppercase mb-2">
                        Generated Music
                    </div>
                    {audioLoading ? (
                        <div className="flex items-center justify-center p-4 text-foreground/50">
                            Loading audio preview...
                        </div>
                    ) : audioUrl ? (
                        <audio src={audioUrl} controls className="w-full">
                            Your browser does not support the audio element.
                        </audio>
                    ) : (
                        <div className="flex items-center justify-center p-4 text-foreground/50">
                            Audio preview not available
                        </div>
                    )}
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-3 text-sm">
                        {error}
                    </div>
                )}

                <div className="flex flex-row gap-2 justify-end">
                    <Button
                        name={loading ? "retrying..." : "retry"}
                        onClick={retryHandler}
                        bg="bg-foreground/10 font-bold"
                        className="opacity-40"
                        disabled={loading}
                    />
                    <Button
                        name={loading ? "confirming..." : "confirm"}
                        onClick={confirmHandler}
                        bg="bg-purple-500 font-bold"
                        disabled={loading}
                    />
                </div>
            </div>
        </>
    )
}
export default TailoredDetailResult;