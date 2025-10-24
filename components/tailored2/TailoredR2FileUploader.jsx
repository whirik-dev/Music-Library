"use client";

import { useState, useRef } from "react";
import { useTranslations } from 'next-intl';
import { IconUpload, IconX, IconCheck, IconLoader2, IconMusic } from "@tabler/icons-react";

const TailoredR2FileUploader = ({ onUploadComplete, onBack }) => {
    const t = useTranslations('tailored');
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [descriptions, setDescriptions] = useState({}); // 파일별 설명 저장
    const [descriptionUploadStatus, setDescriptionUploadStatus] = useState({}); // 설명 업로드 상태
    const fileInputRef = useRef(null);

    // 파일 타입 감지
    const getFileCategory = (file) => {
        const extension = file.name.split('.').pop().toLowerCase();
        const audioExts = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma'];
        const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v', 'mpeg', 'mpg', '3gp'];
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

        if (audioExts.includes(extension)) return 'audio';
        if (videoExts.includes(extension)) return 'video';
        if (imageExts.includes(extension)) return 'image';
        return 'unknown';
    };

    // 파일 타입별 워딩
    const getDescriptionLabel = (fileCategory) => {
        switch (fileCategory) {
            case 'audio':
                return t('detailed_music_description') || 'Detailed Music Description';
            case 'video':
                return t('detailed_video_description') || 'Detailed Video Description';
            case 'image':
                return t('detailed_image_description') || 'Detailed Image Description';
            default:
                return t('detailed_file_description') || 'Detailed File Description';
        }
    };

    const getDescriptionPlaceholder = (fileCategory) => {
        switch (fileCategory) {
            case 'audio':
                return t('describe_music_details') || 'Describe genre, mood, instruments, tempo, purpose...';
            case 'video':
                return t('describe_video_details') || 'Describe content, style, mood, duration, purpose...';
            case 'image':
                return t('describe_image_details') || 'Describe subject, style, mood, colors, purpose...';
            default:
                return t('describe_file_details') || 'Describe this file in detail...';
        }
    };

    const generateFileName = (originalName, ssid) => {
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const randomString = Math.random().toString(36).substring(2, 10); // 8자리 난수
        // 원본 파일명을 URL-safe하게 인코딩 (한글, 공백, 특수문자 처리)
        const safeFileName = encodeURIComponent(originalName);
        // /날짜/ssid/임의문자/원본제목.확장자
        return `${date}/${ssid}/${randomString}/${safeFileName}`;
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
        setDescriptions(prev => {
            const newDesc = { ...prev };
            delete newDesc[fileId];
            return newDesc;
        });
    };

    const handleDescriptionChange = (fileId, value) => {
        setDescriptions(prev => ({
            ...prev,
            [fileId]: value
        }));
    };

    const handleDescriptionBlur = async (fileId) => {
        const description = descriptions[fileId];

        // 유효성 검사
        if (!validateDescription(description)) {
            return;
        }

        // 이미 업로드 중이면 무시
        if (descriptionUploadStatus[fileId] === 'uploading') {
            return;
        }

        // 업로드 시작
        setDescriptionUploadStatus(prev => ({
            ...prev,
            [fileId]: 'uploading'
        }));

        try {
            const session = await fetch('/api/auth/session').then(res => res.json());
            if (!session?.user?.ssid) {
                throw new Error('Not logged in');
            }

            const fileItem = files.find(f => f.id === fileId);
            if (!fileItem) {
                throw new Error('File not found');
            }

            const descriptionUrl = await uploadDescriptionFile(fileItem, description, session.user.ssid);

            // 파일 정보 업데이트
            setFiles(prev => prev.map(f =>
                f.id === fileId ? { ...f, descriptionUrl, description } : f
            ));

            setDescriptionUploadStatus(prev => ({
                ...prev,
                [fileId]: 'completed'
            }));
        } catch (error) {
            console.error('Failed to upload description:', error);
            setDescriptionUploadStatus(prev => ({
                ...prev,
                [fileId]: 'error'
            }));
        }
    };

    const validateDescription = (text) => {
        if (!text || text.trim().length < 12) {
            return false;
        }

        // 특수문자만 있는지 체크
        const specialCharsOnly = /^[^a-zA-Z0-9가-힣]+$/.test(text.trim());
        if (specialCharsOnly) {
            return false;
        }

        // 숫자만 있는지 체크
        const numbersOnly = /^\d+$/.test(text.trim());
        if (numbersOnly) {
            return false;
        }

        return true;
    };

    const uploadDescriptionFile = async (fileItem, description, ssid) => {
        try {
            // 세션 정보 가져오기
            const session = await fetch('/api/auth/session').then(res => res.json());
            
            // JSON 파일 생성
            // /날짜/ssid/임의문자/원본제목.확장자 -> /날짜/ssid/임의문자/원본제목.json
            const originalNameWithoutExt = fileItem.name.replace(/\.[^/.]+$/, '');
            const safeFileName = encodeURIComponent(originalNameWithoutExt + '.json');
            const pathParts = fileItem.uploadedFileName.split('/');
            const jsonFileName = `${pathParts[0]}/${pathParts[1]}/${pathParts[2]}/${safeFileName}`;
            
            // JSON 데이터 생성
            const metadata = {
                description: description,
                ssid: ssid,
                email: session?.user?.email || '',
                timestamp: new Date().toISOString(),
            };
            
            const jsonBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
            const jsonFile = new File([jsonBlob], 'description.json', { type: 'application/json' });

            const formData = new FormData();
            formData.append('file', jsonFile);
            formData.append('ssid', ssid);
            formData.append('fileName', jsonFileName);

            const response = await fetch('/api/upload/r2', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            if (!result.success) {
                throw new Error('Failed to upload description');
            }

            return result.data.publicUrl;
        } catch (error) {
            console.error('Description upload error:', error);
            throw error;
        }
    };

    const handleContinue = async () => {
        const completedFiles = files.filter(f => f.status === 'completed');
        if (completedFiles.length === 0) {
            alert(t('please_upload_files') || 'Please upload at least one file');
            return;
        }

        // 모든 파일에 대한 설명 검증
        for (const file of completedFiles) {
            const description = descriptions[file.id];
            if (!validateDescription(description)) {
                alert(t('invalid_description') || 'Please provide a valid description (at least 12 characters, not only numbers or special characters)');
                return;
            }
        }

        // 모든 설명이 업로드되었는지 확인
        for (const file of completedFiles) {
            if (descriptionUploadStatus[file.id] !== 'completed') {
                alert(t('description_not_uploaded') || 'Please wait for all descriptions to be uploaded');
                return;
            }
        }

        // 설명이 이미 업로드되어 있으므로 바로 다음 단계로
        onUploadComplete(completedFiles);
    };

    const allCompleted = files.length > 0 && files.every(f => f.status === 'completed');
    const allDescriptionsValid = allCompleted && files.every(f => validateDescription(descriptions[f.id]));
    const allDescriptionsUploaded = allCompleted && files.every(f => descriptionUploadStatus[f.id] === 'completed');
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
                    {t('supported_formats_extended') || 'MP3, WAV, AAC, MP4, MOV'}
                </p>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="audio/*,video/*"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                />
            </div>

            {/* File List */}
            {hasFiles && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-white mb-2">
                            {t('uploaded_files') || 'Uploaded Files'} ({files.length})
                        </h3>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            {t('description_guide') || 'Please provide detailed descriptions for each file. Include information about genre, mood, instruments, tempo, and intended use. This helps our team deliver the best possible results for your custom request.'}
                        </p>
                    </div>
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

                                {/* Description Input - 업로드 완료 후에만 표시 */}
                                {fileItem.status === 'completed' && (
                                    <div className="mt-3">
                                        <label className="text-xs text-zinc-400 mb-1 flex items-center justify-between">
                                            <span>
                                                {t('detailed_music_description') || 'Detailed Music Description'} *
                                                <span className="text-zinc-600 ml-1">
                                                    ({t('help_us_understand') || 'Help us deliver better results'})
                                                </span>
                                            </span>
                                            {descriptionUploadStatus[fileItem.id] === 'uploading' && (
                                                <span className="text-purple-400 flex items-center gap-1">
                                                    <IconLoader2 size={12} className="animate-spin" />
                                                    {t('saving') || 'Saving...'}
                                                </span>
                                            )}
                                            {descriptionUploadStatus[fileItem.id] === 'completed' && (
                                                <span className="text-green-400 flex items-center gap-1">
                                                    <IconCheck size={12} />
                                                    {t('saved') || 'Saved'}
                                                </span>
                                            )}
                                            {descriptionUploadStatus[fileItem.id] === 'error' && (
                                                <span className="text-red-400 flex items-center gap-1">
                                                    <IconX size={12} />
                                                    {t('upload_error') || 'Error'}
                                                </span>
                                            )}
                                        </label>
                                        <input
                                            type="text"
                                            value={descriptions[fileItem.id] || ''}
                                            onChange={(e) => handleDescriptionChange(fileItem.id, e.target.value)}
                                            onBlur={() => handleDescriptionBlur(fileItem.id)}
                                            placeholder={t('describe_music_details') || 'Describe genre, mood, instruments, tempo, purpose...'}
                                            disabled={descriptionUploadStatus[fileItem.id] === 'uploading'}
                                            className={`
                                                w-full bg-zinc-900 border rounded-lg p-2 text-sm text-white
                                                placeholder:text-zinc-600 focus:outline-none
                                                ${descriptionUploadStatus[fileItem.id] === 'completed'
                                                    ? 'border-green-500'
                                                    : validateDescription(descriptions[fileItem.id])
                                                        ? 'border-purple-500 focus:border-purple-400'
                                                        : 'border-zinc-700 focus:border-purple-500'
                                                }
                                                ${descriptionUploadStatus[fileItem.id] === 'uploading' ? 'opacity-50 cursor-not-allowed' : ''}
                                            `}
                                        />
                                        {descriptions[fileItem.id] && !validateDescription(descriptions[fileItem.id]) && (
                                            <div className="text-xs text-red-400 mt-1">
                                                {descriptions[fileItem.id].trim().length < 12
                                                    ? t('description_too_short') || 'Description is too short (min 12 characters)'
                                                    : t('description_invalid') || 'Description cannot contain only numbers or special characters'
                                                }
                                            </div>
                                        )}
                                    </div>
                                )}
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
                    disabled={!allDescriptionsUploaded}
                    className={`
                        flex-1 px-6 py-3 rounded-lg font-semibold transition-colors
                        ${allDescriptionsUploaded
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
