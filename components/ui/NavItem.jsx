'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/Icon'
import { IconHome, IconPlaylist, IconSearch, IconSquareRounded } from '@tabler/icons-react';

const NavItem = ({ pagename, path, icon, onClick}) => {
    const pathname = usePathname();
  
    return (
      <Link key={pagename} href={path} onClick={onClick}>
        <li className={`px-3 py-2 flex flex-row gap-3 items-center duration-300
                       rounded-sm  hover:text-foreground
                       ${pathname === path ? 'bg-zinc-700/40 text-foreground' : 'text-zinc-300/70'}`}
        >
          {/* <Icon name={icon} /> */}
          {pagename === 'explorer' ? (<IconHome />) 
          :pagename === 'playlist' ? (<IconPlaylist />) 
          :pagename === 'search' ? (<IconSearch />) 
          :(<IconSquareRounded />)}
          <div className="capitalize">
            {pagename}
          </div>
        </li>
      </Link>
    );
  };
  
  export default NavItem;