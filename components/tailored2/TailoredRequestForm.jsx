"use client";

import { useState } from "react";
import { useTranslations } from 'next-intl';
import Button from "@/components/ui/Button2";
import InputTextarea from "@/components/ui/InputTextarea";
import TailoredPlayer from "@/components/tailored/TailoredPlayer";

const TailoredRequestForm = ({ music, file, onSubmit, onBack }) => {
    const t = useTranslations('tailored');
    const [selectedItems, setSelectedItems] = useState([]);
    const [comment1, setComment1] = useState('');
    const [comment2, setComment2] = useState('');

    // 요청 가능한 항목들
    const availableItems = [
        { id: 'tempo', label: t('item_tempo') || '템포 조정' },
        { id: 'instrument', label: t('item_instrument') || '악기 변경' },
        { id: 'mood', label: t('item_mood') || '분위기 변경' },
        { id: 'length', label: t('item_length') || '길이 조정' },
        { id: 'volume', label: t('item_volume') || '볼륨 조정' },
        { id: 'effect', label: t('item_effect') || '효과 추가' },
    ];

    const toggleItem = (itemId) => {
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleSubmit = () => {
        if (selectedItems.length === 0) {
            alert(t('please_select_items') || '최소 1개 이상의 항목을 선택해주세요');
            return;
        }
        if (!comment1.trim()) {
            alert(t('please_enter_comment') || '요청사항을 입력해주세요');
            return;
        }

        onSubmit({
            items: selectedItems.map(id => 
                availableItems.find(item => item.id === id)?.label
            ).filter(Boolean), // null/undefined 제거
            comment1: comment1.trim(),
            comment2: comment2.trim()
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

            {/* Music Preview */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-sm font-semibold text-zinc-400 mb-4">
                    {t('selected_music') || '선택한 음악'}
                </h3>
                {music && <TailoredPlayer id={music.id} />}
                {file && (
                    <div className="p-4 bg-zinc-800 rounded-lg">
                        <p className="text-white font-semibold">{file.name}</p>
                        <p className="text-sm text-zinc-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                    </div>
                )}
            </div>

            {/* Request Items */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-sm font-semibold text-white mb-4">
                    {t('select_modification_items') || '수정 항목 선택'} *
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => toggleItem(item.id)}
                            className={`p-4 rounded-lg border-2 transition-all ${
                                selectedItems.includes(item.id)
                                    ? 'border-purple-500 bg-purple-500/20 text-white'
                                    : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600'
                            }`}
                        >
                            {item.label}
                        </button>
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

export default TailoredRequestForm;
