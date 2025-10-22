import Button from "@/components/ui/Button2";

/**
 * 페이지 상단 Hero 섹션 컴포넌트
 * @param {string} title - 메인 타이틀
 * @param {string} description - 설명 텍스트
 * @param {string} buttonText - 버튼 텍스트 (선택사항)
 * @param {function} onButtonClick - 버튼 클릭 핸들러 (선택사항)
 * @param {string} buttonBg - 버튼 배경 클래스 (선택사항)
 * @param {React.ReactNode} children - 추가 컨텐츠 (선택사항)
 */
const PageHero = ({ 
    title, 
    description, 
    buttonText, 
    onButtonClick, 
    buttonBg = "bg-gradient-to-r from-purple-500 to-blue-400",
    children 
}) => {
    return (
        <div className="relative bg-gradient-to-br from-zinc-900 via-purple-900/20 to-zinc-900 py-16">
            <div className="absolute inset-0 bg-[url('/bg_price.png')] bg-cover bg-center opacity-10"></div>
            <div className="relative z-10 max-w-7xl mx-auto px-4">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent mb-4">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-zinc-400 text-lg">
                                {description}
                            </p>
                        )}
                    </div>
                    {buttonText && onButtonClick && (
                        <Button
                            name={buttonText}
                            onClick={onButtonClick}
                            size="lg"
                            bg={buttonBg}
                            color="text-white"
                            className="flex items-center gap-2 whitespace-nowrap"
                        />
                    )}
                    {children}
                </div>
            </div>
        </div>
    );
};

export default PageHero;
