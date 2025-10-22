"use client";

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { IconLoader2, IconCheck, IconX } from "@tabler/icons-react";
import Button from "@/components/ui/Button2";

const TailoredRequestConfirm = ({ isSubmitting, status, message }) => {
    const t = useTranslations('tailored');
    const router = useRouter();

    // 제출 중
    if (isSubmitting) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
                <IconLoader2 size={72} className="animate-spin text-purple-500" />
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {t('submitting_request') || 'Submitting Request...'}
                    </h2>
                    <p className="text-zinc-400">
                        {t('please_wait') || 'Please wait while we process your request'}
                    </p>
                </div>
            </div>
        );
    }

    // 성공
    if (status === 'success') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                    <IconCheck size={48} className="text-green-500" />
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {t('request_submitted') || 'Request Submitted!'}
                    </h2>
                    <p className="text-zinc-400 mb-6">
                        {message || t('request_submitted_message') || 'Your tailored request has been submitted successfully'}
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button
                            name={t('view_requests') || 'View Requests'}
                            onClick={() => router.push('/tailored')}
                            size="lg"
                            bg="bg-purple-600"
                            color="text-white"
                        />
                    </div>
                </div>
            </div>
        );
    }

    // 에러
    if (status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
                <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                    <IconX size={48} className="text-red-500" />
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {t('request_failed') || 'Request Failed'}
                    </h2>
                    <p className="text-zinc-400 mb-6">
                        {message || t('request_failed_message') || 'Failed to submit your request. Please try again.'}
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button
                            name={t('try_again') || 'Try Again'}
                            onClick={() => window.location.reload()}
                            size="lg"
                            bg="bg-zinc-800"
                            color="text-white"
                        />
                        <Button
                            name={t('go_back') || 'Go Back'}
                            onClick={() => router.push('/tailored')}
                            size="lg"
                            bg="bg-purple-600"
                            color="text-white"
                        />
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default TailoredRequestConfirm;
