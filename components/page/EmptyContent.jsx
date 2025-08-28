import { IconFileSad } from "@tabler/icons-react";

const EmptyContent = ({children, content}) => {
    return(
        <div className="w-full h-screen">
            <div className="flex flex-col gap-5 items-center justify-center w-full min-h-[418px]">
                <IconFileSad size="78" className="opacity-30" />
                <div className="text-foreground/30 text-3xl font-bold">
                    {content ? content : "No results found. Try a different search term."}
                </div>
                <div className="">
                    {children}
                </div>
            </div>
        </div>
    )
}
export default EmptyContent;