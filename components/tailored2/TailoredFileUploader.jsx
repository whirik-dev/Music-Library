"use client";

import { useState, useRef } from "react";
import { useTranslations } from 'next-intl';
import { IconUpload, IconFile, IconX } from "@tabler/icons-react";
import Button from "@/components/ui/Button2";

const TailoredFileUploader = ({ onUpload }) => {
    const t = useTranslations('tailored');
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && isValidFile(droppedFile)) {
            setFile(droppedFile);
        }
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && isValidFile(selectedFile)) {
            setFile(selectedFile);
        }
    };

    const isValidFile = (file) => {
        const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3'];
        const maxSize = 50 * 1024 * 1024; // 50MB
        
        if (!validTypes.includes(file.type)) {
            alert(t('invalid_file_type') || '지원하지 않는 파일 형식입니다');
            return false;
        }
        
        if (file.size > maxSize) {
            alert(t('file_too_large') || '파일 크기가 너무 큽니다 (최대 50MB)');
            return false;
        }
        
        return true;
    };

    const handleRemoveFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = () => {
        if (file) {
            onUpload(file);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                    {t('upload_music') || '음악 업로드'}
                </h2>
                <p className="text-zinc-400">
                    {t('upload_music_description') || '맞춤 제작할 음악 파일을 업로드하세요'}
                </p>
            </div>

            {/* Upload Area */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                    isDragging
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-zinc-700 bg-zinc-900'
                }`}
            >
                {!file ? (
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
                                <IconUpload size={32} className="text-zinc-400" />
                            </div>
                        </div>
                        <div>
                            <p className="text-white font-semibold mb-2">
                                {t('drag_drop_file') || '파일을 드래그하거나 클릭하여 업로드'}
                            </p>
                            <p className="text-sm text-zinc-500">
                                {t('supported_formats') || 'MP3, WAV 형식 지원 (최대 50MB)'}
                            </p>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="audio/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="file-upload"
                        />
                        <label
                            htmlFor="file-upload"
                            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 
                                     text-white rounded-lg cursor-pointer transition-colors"
                        >
                            {t('select_file') || '파일 선택'}
                        </label>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-center gap-4 p-4 bg-zinc-800 rounded-lg">
                            <IconFile size={32} className="text-purple-400" />
                            <div className="flex-1 text-left">
                                <p className="text-white font-semibold">{file.name}</p>
                                <p className="text-sm text-zinc-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                            <button
                                onClick={handleRemoveFile}
                                className="text-zinc-400 hover:text-red-400 transition-colors"
                            >
                                <IconX size={24} />
                            </button>
                        </div>
                        <Button
                            name={t('continue') || '계속'}
                            onClick={handleSubmit}
                            size="lg"
                            bg="bg-purple-600"
                            color="text-white"
                        />
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-white mb-2">
                    {t('upload_notice') || '업로드 안내'}
                </h3>
                <ul className="text-sm text-zinc-400 space-y-1 list-disc list-inside">
                    <li>{t('upload_notice_1') || '저작권이 있는 음악만 업로드해주세요'}</li>
                    <li>{t('upload_notice_2') || '고품질 파일일수록 더 좋은 결과를 얻을 수 있습니다'}</li>
                    <li>{t('upload_notice_3') || '업로드된 파일은 안전하게 보관됩니다'}</li>
                </ul>
            </div>
        </div>
    );
};

export default TailoredFileUploader;
