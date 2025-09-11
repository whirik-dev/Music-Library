import NavItem from '@/components/ui/NavItem'
import ListOfNavigation from "@/app/config.nav"
import { useTranslations } from 'next-intl'

/**
 * 
 * @component
 * @example
 * reutnr (
 *  <div> {children} </div>
 * )
 */
const Navigation = ({ onItemClick }) => {

    const nav = ListOfNavigation;
    const t = useTranslations('navigation');

    return (
        <div className="mt-7">
            <ul className="flex flex-col gap-1 gap-y-2">
                {nav.map(item => (
                    <NavItem key={item.key}
                             pagename={t(item.pagename)}
                             pagenameKey={item.pagename}
                             path={item.path}
                             icon={item.icon}
                             onClick={onItemClick}
                    />
                ))}
            </ul>
        </div>
    );
}

export default Navigation