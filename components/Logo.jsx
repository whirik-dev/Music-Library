'use client'

import Link from 'next/link';
import useUiStore from "@/stores/uiStore";
import useMusicListStore  from '@/stores/useMusicListStore';

/**
 * 
 * @component
 * @example
 * const logoType = 'image'
 * return(
 *  <div>logoelem</div>
 * )
 */
const Logo = ({ onClick, className, subBrand="bgm", isActive=true }) => {
    const { colorMode } = useUiStore();
    const { setQuery, fetchMusicList, listMode } = useMusicListStore();

    const logoImageHref = "/whirik_logo.webp"
    const logoImageAlt = "WhiRik"

    const handleLogoClick = () => {
        if(isActive)
        {
            initSearch();
            onClick();
        }
    }

    const initSearch = () => {
        if(listMode != 'fetch' )
        {
            setQuery('');
            fetchMusicList();
        }
    }

    return (
        <Link href="/" onClick={()=>handleLogoClick()} className={`hover:opacity-50 transition-opacity duration-300 ${className}`}>
            <div className="lg:mt-0 flex flex-row gap-4 select-none">
                <img className={`h-6 ${colorMode === 'light' && 'brightness-0'}`} src={logoImageHref} /> 
                <div className="relative font-black">
                    {subBrand != "" && (
                        <>
                            <div className="absolute top-[6px] -left-2 w-[1px] h-[12px] bg-foreground/70"></div>
                            <span className="text-foreground">
                                {subBrand.toUpperCase()}
                            </span>
                        </>
                    )}
                </div>
            </div>
        </Link>
    );
}

export default Logo;