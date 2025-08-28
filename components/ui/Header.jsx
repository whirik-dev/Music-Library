'use client';

import Link from 'next/link';
import { useState } from 'react';
import Icon from "@/components/Icon";

const Header = ({ children }) => {
    const [search, setSearch] = useState(null);

    return (
        <div className="z-20 sticky top-0 w-full px-2 lg:px-10 py-5 hidden lg:flex flex-row items-center bg-zinc-900">
            <div className="">
                <div className="bg-zinc-800 rounded-4xl px-4 py-2">
                    <div className="flex flex-row items-center gap-5">
                        <input type="text" placeholder="Search" className="focus:outline-0"></input>
                        <Icon name="MagnifyingGlassIcon"></Icon>
                    </div>
                </div>
            </div>
            {/* <div className="flex flex-row ml-auto gap-7 text-lg text-white/80">
                <Link href="/price">
                    <div className="">Pricing</div>
                </Link>
                <Link href="/user/signin">
                    <div className="">Sign In</div>
                </Link>
            </div> */}
        </div>
    );
}

export default Header;