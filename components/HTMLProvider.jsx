"use client"
import useUiStore from "@/stores/uiStore";
import { Noto_Sans_KR, Lato } from "next/font/google";

// Noto Sans KR - 한글용
const notoSansKR = Noto_Sans_KR({
    subsets: ["latin"], // korean subset은 지원되지 않음
    variable: "--font-noto-sans-kr",
});

// Lato - 영문용
const lato = Lato({
    subsets: ["latin"],
    weight: ["400", "700"], // 필요한 weight 명시
    variable: "--font-lato",
});

const HTMLProvider = ({ children, locale = 'en' }) => {
    const { colorMode } = useUiStore();

    return (
        <html
            lang={locale}
            className={`scroll-smooth ${colorMode} ${lato.variable} ${notoSansKR.variable}`}
        >
            {children}
        </html>
    )
}
export default HTMLProvider;