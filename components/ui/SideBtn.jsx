'use client';

import Link from 'next/link';
import Icon from '@/components/Icon'

const SideBtn = ({innerText, href, icon}) => {
    return (
        <Link href={href}>
            <div className="mt-3 border-1 border-zinc-700/50 p-3
                            flex gap-3 items-center rounded-sm
            ">
                <div className="">
                    <Icon name={icon} size="5" />
                </div>
                {innerText}
            </div>
        </Link>
    );
}

export default SideBtn;