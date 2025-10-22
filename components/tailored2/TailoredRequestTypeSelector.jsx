import { useTranslations } from 'next-intl';
import { IconMusic, IconUpload } from "@tabler/icons-react";

const TailoredRequestTypeSelector = ({ onSelect }) => {
    const t = useTranslations('tailored');

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                    {t('how_to_start') || '어떻게 시작하시겠어요?'}
                </h2>
                <p className="text-zinc-400">
                    {t('select_request_type_description') || '서비스 음악을 선택하거나 직접 업로드하세요'}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Service Music Option */}
                <button
                    onClick={() => onSelect('service')}
                    className="group relative bg-zinc-900 border-2 border-zinc-800 rounded-xl p-8 
                               hover:border-purple-500 transition-all duration-300 text-left
                               hover:shadow-lg hover:shadow-purple-500/20"
                >
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center
                                      group-hover:bg-purple-500/30 transition-colors">
                            <IconMusic size={32} className="text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">
                                {t('select_service_music') || '서비스 음악 선택'}
                            </h3>
                            <p className="text-zinc-400 text-sm">
                                {t('select_service_music_description') || '우리 서비스에서 제공하는 음악 중에서 선택하세요'}
                            </p>
                        </div>
                    </div>
                </button>

                {/* Upload Music Option - Disabled */}
                <button
                    disabled
                    className="group relative bg-zinc-900 border-2 border-zinc-800 rounded-xl p-8 
                               text-left opacity-50 cursor-not-allowed"
                >
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
                            <IconUpload size={32} className="text-zinc-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-zinc-500 mb-2">
                                {t('upload_my_music') || '내 음악 업로드'}
                            </h3>
                            <p className="text-zinc-600 text-sm">
                                {t('coming_soon') || 'Coming Soon'}
                            </p>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default TailoredRequestTypeSelector;
