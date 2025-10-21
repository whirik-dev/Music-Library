import orgs from "@/data/organization";
import Image from "next/image";

const OrganizationBox = ({ email }) => {

    const userOrg = email.split('@')[1];
    const orgData = orgs[userOrg];

    return (
        <>
            {orgData && (
                <div className={`rounded-sm text-black px-2 py-1 group ${orgData.tailwind}`}>
                    <div className="flex flex-row gap-1 items-center">
                        {orgData.logo && (
                            <div className={`size-10 flex items-center justify-center p-0.5 ${orgData.logo_tailwind}`}>
                                <Image src={`${orgData.logo}`} alt={orgData.name} width={42} height={42} />
                            </div>
                        )}
                        <div className="flex flex-col">
                            <div className="pointer-events-none text-sm font-bold">{orgData.name}</div>
                            <div className="flex flex-row gap-2  relative">
                                <div className="pointer-events-none text-xs capitalize font-medium transition-opacity duration-300 group-hover:opacity-0">{orgData.name_en}</div>
                                <div className="pointer-events-none text-xs font-medium absolute left-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">{email}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
export default OrganizationBox;