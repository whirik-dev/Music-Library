import { useTranslations } from 'next-intl';
import PageWrapper from "@/components/page/PageWrapper";
import PriceCard from "@/components/page/PriceCard";
import Heading from "@/components/ui/Heading";
import HeadingSub from "@/components/ui/HeadingSub";
import PriceDiffTable from "@/components/page/PriceDiffTable"
import Footer from "@/components/ui/Footer";

import Checkout from "@/components/payment/CheckoutModal";

export default function Price() 
{
    const t = useTranslations('pages.pricing');
    
    return (
        <>
            <PageWrapper className="relative bg-[url('/bg_price.png')] bg-cover bg-bottom bg-no-repeat min-h-[920px]">
                <div className="flex flex-col">
                    <div className="flex flex-col gap-5 mt-20">
                        <Heading align="lg:text-center">
                            {t('hero_title')}
                        </Heading>
                        <HeadingSub>
                            {t('hero_subtitle')}
                        </HeadingSub>
                    </div>
                    <PriceCard />
                </div>
                <div className="absolute bottom-0 left-0 w-full h-50 bg-linear-to-t from-zinc-900 to-zinc-900/0"></div>
            </PageWrapper>
            <PageWrapper className="min-h-screen">
                <PriceDiffTable />
            </PageWrapper>
            
            <Checkout />
            <Footer />
        </>
    );
}
