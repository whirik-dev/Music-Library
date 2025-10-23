"use client";

import { useState, useRef } from "react";
import { useTranslations } from 'next-intl';
import { IconUpload, IconX, IconCheck, IconLoader2, IconMusic } from "@tabler/icons-react";

const TailoredR2FileUploader = ({ onUploadComplete, onBack }) => {
    const t = useTranslations('tailored');
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const generateFileName = (originalName, ssid) => {
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const extension = originalName.split('.').pop();
        const randomString = Math.random().toString(36).substring(2, 10); // 8자리 난수
        return `${date}/${ssid}/${randomString}.${extension}`;
    };

    const handleFileSelect = async (selectedFiles) => {
        const session = await fetch('/api/auth/session').then(res => res.json());
        if (!session?.user?.ssid) {
            alert('Please login first');
            return;
        }

        const newFiles = Array.from(selectedFiles).map(file => ({
            id: Math.random().toString(36).substring(7),
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'pending', // pending, uploading, completed, error
            progress: 0,
            uploadedFileName: null,
            publicUrl: null,
            error: null,
        }));

        setFiles(prev => [...prev, ...newFiles]);

        // 업로드 시작
        for (const fileItem of newFiles) {
            await uploadFile(fileItem, session.user.ssid);
        }
    };

    const uploadFile = async (fileItem, ssid) => {
        // 상태를 uploading으로 변경
        setFiles(prev => prev.map(f => 
            f.id === fileItem.id ? { ...f, status: 'uploading' } : f
        ));

        try {
            const fileName = generateFileName(fileItem.name, ssid);
            const formData = new FormData();
            formData.append('file', fileItem.file);
            formData.append('ssid', ssid);
            formData.append('fileName', fileName);

            const xhr = new XMLHttpRequest();

            // 진행률 추적
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const progress = Math.round((e.loaded / e.total) * 100);
                    setFiles(prev => prev.map(f => 
                        f.id === fileItem.id ? { ...f, progress } : f
                    ));
                }
            });

            // 업로드 완료
            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    if (response.success) {
                        setFiles(prev => prev.map(f => 
                            f.id === fileItem.id ? {
                                ...f,
                                status: 'completed',
                                progress: 100,
                                uploadedFileName: response.data.fileName,
                                publicUrl: response.data.publicUrl,
                            } : f
                        ));
                    } else {
                        throw new Error(response.message);
                    }
                } else {
                    throw new Error('Upload failed');
                }
            });

            // 에러 처리
            xhr.addEventListener('error', () => {
                setFiles(prev => prev.map(f => 
                    f.id === fileItem.id ? {
                        ...f,
                        status: 'error',
                        error: 'Upload failed',
                    } : f
                ));
            });

            xhr.open('POST', '/api/upload/r2');
            xhr.send(formData);

        } catch (error) {
            console.error('Upload error:', error);
            setFiles(prev => prev.map(f => 
                f.id === fileItem.id ? {
                    ...f,
                    status: 'error',
                    error: error.message,
                } : f
            ));
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length > 0) {
            handleFileSelect(droppedFiles);
        }
    };

    const removeFile = (fileId) => {
        setFiles(prev => prev.filter(f => f.id !== fileId));
    };

    const handleContinue = () => {
        const completedFiles = files.filter(f => f.status === 'completed');
        if (completedFiles.length === 0) {
            alert(t('please_upload_files') || 'Please upload at least one file');
            return;
        }
        onUploadComplete(completedFiles);
    };

    const allCompleted = files.length > 0 && files.every(f => f.status === 'completed');
    const hasFiles = files.length > 0;

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

            {/* Drop Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                    border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
                    transition-all duration-300
                    ${isDragging 
                        ? 'border-purple-500 bg-purple-500/10' 
                        : 'border-zinc-700 hover:border-zinc-600 bg-zinc-900'
                    }
                `}
            >
                <IconUpload size={48} className="mx-auto mb-4 text-zinc-500" />
                <p className="text-white font-semibold mb-2">
                    {t('click_or_drag') || 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-zinc-500">
                    {t('supported_formats') || 'MP3, WAV, FLAC, M4A (Max 100MB)'}
                </p>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="audio/*"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                />
            </div>

            {/* File List */}
            {hasFiles && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-white mb-4">
                        {t('uploaded_files') || 'Uploaded Files'} ({files.length})
                    </h3>
                    <div className="space-y-3">
                        {files.map((fileItem) => (
                            <div
                                key={fileItem.id}
                                className="bg-zinc-800/50 rounded-lg p-4"
                            >
                                <div className="flex items-center gap-3">
                                    {/* Icon */}
                                    <div className="flex-shrink-0">
                                        {fileItem.status === 'completed' && (
                                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                                <IconCheck size={20} className="text-green-500" />
                                            </div>
                                        )}
                                        {fileItem.status === 'uploading' && (
                                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                                <IconLoader2 size={20} className="text-purple-500 animate-spin" />
                                            </div>
                                        )}
                                        {fileItem.status === 'error' && (
                                            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                                <IconX size={20} className="text-red-500" />
                                            </div>
                                        )}
                                        {fileItem.status === 'pending' && (
                                            <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
                                                <IconMusic size={20} className="text-zinc-500" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-white truncate">
                                            {fileItem.name}
                                        </div>
                                        <div className="text-xs text-zinc-500">
                                            {(fileItem.size / 1024 / 1024).toFixed(2)} MB
                                        </div>
                                        {fileItem.status === 'uploading' && (
                                            <div className="mt-2">
                                                <div className="w-full bg-zinc-700 rounded-full h-2">
                                                    <div
                                                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${fileItem.progress}%` }}
                                                    />
                                                </div>
                                                <div className="text-xs text-zinc-500 mt-1">
                                                    {fileItem.progress}%
                                                </div>
                                            </div>
                                        )}
                                        {fileItem.status === 'error' && (
                                            <div className="text-xs text-red-500 mt-1">
                                                {fileItem.error}
                                            </div>
                                        )}
                                    </div>

                                    {/* Remove Button */}
                                    {fileItem.status !== 'uploading' && (
                                        <button
                                            onClick={() => removeFile(fileItem.id)}
                                            className="flex-shrink-0 text-zinc-500 hover:text-white transition-colors"
                                        >
                                            <IconX size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    onClick={onBack}
                    className="flex-1 px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors font-semibold"
                >
                    {t('back') || 'Back'}
                </button>
                <button
                    onClick={handleContinue}
                    disabled={!allCompleted}
                    className={`
                        flex-1 px-6 py-3 rounded-lg font-semibold transition-colors
                        ${allCompleted
                            ? 'bg-gradient-to-r from-purple-500 to-blue-400 text-white hover:opacity-90'
                            : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                        }
                    `}
                >
                    {t('continue') || 'Continue'}
                </button>
            </div>
        </div>
    );
};

export default TailoredR2FileUploader;
