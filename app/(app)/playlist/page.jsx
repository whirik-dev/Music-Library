import { useTranslations } from 'next-intl';
import Hero from "@/components/ui/Hero";
import Box from "@/components/ui/Box";

export default function Playlist() 
{
    const t = useTranslations('pages.playlist');
    
    return (
        <div className="min-h-screen relative">
            <Box
            title={t('title')}
            >
            {t('content')}
            </Box>
        </div>
    );
}
