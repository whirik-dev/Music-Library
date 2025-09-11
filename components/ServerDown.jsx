import Logo from "@/components/Logo";
import { useTranslations } from 'next-intl';

const ServerDown = () => {
    const t = useTranslations('ui');
    return(
        <div className="w-screen h-screen flex flex-col items-center justify-center">
            <Logo subBrand="" isActive={false} className="hover:!opacity-100 !cursor-default"/>
            <br/>
            <div className="text-center w-2xl text-sm">
                <h3 className="text-3xl mb-5">{t('server_maintenance_title')}</h3>
                <p>{t('server_maintenance_description')}</p>
                <p>{t('server_maintenance_apology')}</p>
                <p>{t('server_maintenance_notification')}</p>
                <p className="font-bold mt-5">{t('server_maintenance_thanks')}</p>
            </div>
            
        </div>
    )
}
export default ServerDown;