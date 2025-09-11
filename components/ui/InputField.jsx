
'use client';
import { useState, forwardRef } from 'react';
import { useTranslations } from 'next-intl';

const InputField = forwardRef(({ type="text", placeholder, translationKey, namespace = 'forms', className, onChange, border='', onKeyDown }, ref) => {
    const [focus, setFocus] = useState(false);
    const t = useTranslations(namespace);
    
    // Use translation key if provided, otherwise use placeholder prop directly
    const displayPlaceholder = translationKey ? t(translationKey) : placeholder;

    return (
        <div className={`p-0 border rounded-sm 
            ${focus ? "border-zinc-400" : "border-zinc-800"}
            transition-all duration-300 ${className}
            ${border === 'red' ? '!border-red-400' : border === 'orange' ? '!border-orange-400' : border === 'green' ? '!border-green-400' : ''}`}
        >
            <input
                type={type}
                placeholder={displayPlaceholder}
                ref={ref}
                className="focus:outline-0 w-full p-3 rounded-sm bg-transparent"
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
                onChange={onChange}
                onKeyDown={onKeyDown}
            />
        </div>
    );
});

export default InputField;
