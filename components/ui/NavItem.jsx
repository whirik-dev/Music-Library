'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/Icon'
import { IconHome, IconPlaylist, IconSearch, IconSquareRounded } from '@tabler/icons-react';

const NavItem = ({ pagename, pagenameKey, path, icon, onClick}) => {
    const pathname = usePathname();
    const iconKey = pagenameKey || pagename;
  
    return (
      <Link key={pagenameKey || pagename} href={path} onClick={onClick}>
        <li className={`px-3 py-2 flex flex-row gap-3 items-center duration-300
                       rounded-sm  hover:text-foreground
                       ${pathname === path ? 'bg-zinc-700/40 text-foreground' : 'text-zinc-300/70'}`}
        >
          {/* <Icon name={icon} /> */}
          {iconKey === 'explorer' ? (<IconHome />) 
          :iconKey === 'playlist' ? (<IconPlaylist />) 
          :iconKey === 'search' ? (<IconSearch />) 
          :(<IconSquareRounded />)}
          <div className="capitalize">
            {pagename}
          </div>
        </li>
      </Link>
    );
  };
  
  export default NavItem;