import { useRouter, usePathname } from  "next/navigation";
import Button from "@/components/ui/Button2";

const Top = ({ children, className }) => {
    const router = useRouter();
    const pathname = usePathname();

    const pricingLinkClickHandler = () => {
        router.push("/price");
    }

    // 가격표 보기 버튼 숨길 페이지
    const pricingLinkHidePage = ['/price', '/terms']

    return (
        <div className="hidden lg:block z-30 sticky top-0 lg:ml-[280px] bg-zinc-900/30 backdrop-blur-xl">
            <div className="flex flex-row items-center">
                <div className={`px-6 py-5 flex flex-row gap-3 items-center ${className}`}>
                    {children}
                </div>
                <div className="flex-1 text-right pr-5 flex flex-row justify-end gap-3">
                    {!pricingLinkHidePage.includes(pathname) && (
                        <Button name="pricing" size="top" className="w-auto" onClick={pricingLinkClickHandler} />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Top