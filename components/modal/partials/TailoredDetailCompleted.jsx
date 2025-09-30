import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Button from "@/components/ui/Button2"

const TailoredDetailCompleted = ({ id }) => {
    const { data: session } = useSession();
    const [audioUrl, setAudioUrl] = useState(null);
    const [audioLoading, setAudioLoading] = useState(false);
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [error, setError] = useState(null);

    // 오디오 미리보기 가져오기
    const fetchAudioPreview = async () => {
        if (!session?.user?.ssid || !id) return;

        setAudioLoading(true);
        setError(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tailored/preview/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.ssid}`
                }
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // 성공 시 HTTP URL 직접 사용
                if (data.data?.wav_url) {
                    setAudioUrl(data.data.wav_url);
                } else {
                    throw new Error('Audio URL not found in response');
                }
            } else {
                // 실패 시 (404 등)
                if (response.status === 404) {
                    setError('Result is not ready yet. Please wait for the work to be completed.');
                } else {
                    throw new Error(data.message || 'Failed to load audio preview');
                }
            }
        } catch (err) {
            console.error('Error fetching audio preview:', err);
            if (!error) { // 이미 404 에러가 설정되지 않은 경우에만
                setError('Failed to load audio preview');
            }
        } finally {
            setAudioLoading(false);
        }
    };

    useEffect(() => {
        fetchAudioPreview();
    }, [id, session]);

    const downloadHandler = async () => {
        if (!session?.user?.ssid || !id) {
            setError('Authentication required');
            return;
        }

        setDownloadLoading(true);
        setError(null);

        try {
            // 먼저 오디오 URL을 가져옴
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tailored/preview/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.ssid}`
                }
            });

            const data = await response.json();

            if (response.ok && data.success && data.data?.wav_url) {
                // 다운로드 링크 생성 및 클릭
                const downloadUrl = data.data.wav_url;
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = `tailored-music-${id}.wav`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                if (response.status === 404) {
                    throw new Error('Result is not ready yet. Please wait for the work to be completed.');
                } else {
                    throw new Error(data.message || 'Failed to get download URL');
                }
            }
        } catch (err) {
            console.error('Error downloading file:', err);
            setError(err.message);
        } finally {
            setDownloadLoading(false);
        }
    };

    return (
        <>
            <div className="bg-foreground/3 p-3 rounded-lg">
                <div className="capitalize font-bold mb-3">
                    completed work
                </div>

                <div className="bg-foreground/3 p-3 rounded-lg mb-3">
                    <div className="text-xs text-foreground/50 uppercase mb-2">
                        Status
                    </div>
                    <div className="text-sm mb-2">
                        Your tailored music has been completed and confirmed.
                    </div>
                    <div className="text-sm text-foreground/70">
                        You can now download your custom music file.
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
                        <div className="flex flex-col items-center justify-center p-4 text-foreground/50 gap-3">
                            <div className="text-center">
                                {error?.includes('not ready') ?
                                    'Result is not ready yet' :
                                    'Audio preview not available'
                                }
                            </div>
                            {error?.includes('not ready') && (
                                <Button
                                    name="Refresh"
                                    onClick={fetchAudioPreview}
                                    bg="bg-purple-500/20 font-bold"
                                    className="text-xs px-3 py-1"
                                />
                            )}
                        </div>
                    )}
                </div>

                {error && !error.includes('not ready') && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-3 text-sm">
                        {error}
                    </div>
                )}

                {error?.includes('not ready') && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 p-3 rounded-lg mb-3 text-sm">
                        <div className="font-semibold mb-1">Work in Progress</div>
                        <div>The result is not ready yet. The work may not have been picked up or uploaded. Please check back later.</div>
                    </div>
                )}

                <div className="flex flex-row gap-2 justify-end">
                    <Button
                        name={downloadLoading ? "downloading..." : "download"}
                        onClick={downloadHandler}
                        bg="bg-purple-500 font-bold"
                        disabled={downloadLoading || !audioUrl}
                    />
                </div>
            </div>
        </>
    )
}
export default TailoredDetailCompleted;