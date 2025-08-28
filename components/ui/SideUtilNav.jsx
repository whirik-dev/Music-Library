"use client"
import Link from "next/link"

export function SideUtilNavItem({ href, name }){
    return (
        <Link href={href} className="capitalize">
            {name}
        </Link>
    )
}

export function SideUtilNavWrapper({ children }){
    return (
        <div className="mb-3">
            {children}
        </div>
    )
}

const SideUtilNav = ({}) => {
    return (
        <SideUtilNavWrapper>
            {/* <SideUtilNavItem href="/price" name="pricing" /> */}
        </SideUtilNavWrapper>
    )
}
export default SideUtilNav;