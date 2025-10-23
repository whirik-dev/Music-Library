"use client";

import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import Button from "@/components/ui/Button2";
import InputTextarea from "@/components/ui/InputTextarea";

const TailoredUploadRequestForm = ({ uploadedFiles, onSubmit, onBack }) => {
    const t = useTranslations('tailored');
    const [title, setTitle] = useState('');
    const [comment1, setComment1] = useState('');
    const [comment2, setComment2] = useState(t('whirik_reference_work') || 'Reference work for tailored service');

    useEffect(() => {
        // 첫 번째 파일 이름으로 제목 생성
        if (uploadedFiles && uploadedFiles.length > 0) {
            const fileName = uploadedFiles[0].name.replace(/\.[^/.]+$/, '');
            setTitle(`Tailored Jobs - ${fileName}`);
        }
    }, [uploadedFiles]);

    const handleSubmit = () => {
        if (!title.trim()) {
            alert(t('please_enter_title') || '제목을 입력해주세요');
            return;
        }
        if (!comment1.trim()) {
            alert(t('please_enter_comment') || '요청사항을 입력해주세요');
            return;
        }

        onSubmit({
            title: title.trim(),
            comment1: comment1.trim(),
            comment2: comment2.trim(),
            uploadedFiles,
        });
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                    {t('enter_request_details') || '요청사항 입력'}
                </h2>
                <p className="text-zinc-400">
                    {t('enter_request_details_description') || '어떻게 수정하고 싶으신가요?'}
                </p>
            </div>

            {/* Title Input */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <label className="text-sm font-semibold text-white mb-2 block">
                    {t('request_title') || '요청 제목'} *
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t('request_title_placeholder') || 'Tailored Jobs - 음악 이름'}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
                />
            </div>

            {/* Uploaded Files Preview */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-sm font-semibold text-zinc-400 mb-4">
                    {t('uploaded_files') || 'Uploaded Files'}
                </h3>
                <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                        <div key={index} className="bg-zinc-800/50 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-white font-semibold">{file.name}</div>
                                    <div className="text-sm text-zinc-500">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </div>
                                </div>
                                <audio
                                    controls
                                    src={`/api/media-stream?url=${encodeURIComponent(file.publicUrl)}`}
                                    className="h-10"
                                    style={{ maxWidth: '300px' }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Comments */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
                <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                        {t('detailed_request') || '상세 요청사항'} *
                    </label>
                    <InputTextarea
                        value={comment1}
                        onChange={(e) => setComment1(e.target.value)}
                        placeholder={t('detailed_request_placeholder') || '어떻게 수정하고 싶으신지 자세히 설명해주세요'}
                        rows={4}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white"
                    />
                </div>
                <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                        {t('additional_request') || '추가 요청사항'} ({t('optional') || '선택사항'})
                    </label>
                    <InputTextarea
                        value={comment2}
                        onChange={(e) => setComment2(e.target.value)}
                        placeholder={t('additional_request_placeholder') || '추가로 요청하실 사항이 있다면 입력해주세요'}
                        rows={3}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <Button
                    name={t('back') || '이전'}
                    onClick={onBack}
                    size="lg"
                    bg="bg-zinc-800"
                    color="text-white"
                    className="flex-1"
                />
                <Button
                    name={t('submit_request') || 'Submit Request'}
                    onClick={handleSubmit}
                    size="lg"
                    bg="bg-gradient-to-r from-purple-500 to-blue-400"
                    color="text-white"
                    className="flex-1"
                />
            </div>
        </div>
    );
};

export default TailoredUploadRequestForm;
