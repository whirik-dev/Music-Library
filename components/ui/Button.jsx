import { useTranslations } from 'next-intl';

const Button = ({ name, translationKey, namespace = 'ui', onClick, className}) => {
    const t = useTranslations(namespace);
    
    // Use translation key if provided, otherwise use name prop directly
    const displayText = translationKey ? t(translationKey) : name;

    return (
        <div className={`mx-3 my-3 px-4 py-3 bg-zinc-800 rounded-lg text-left cursor-pointer 
                        hover:opacity-70 active:opacity-50 select-none ${className}
                        `}
             onClick={onClick}
        >
            <span className="text-lg capitalize text-foreground">
                {displayText}
            </span>
        </div>
    )
}
export default Button;