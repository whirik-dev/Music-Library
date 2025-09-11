'use client'
import { useState } from 'react';
import { useTranslations } from 'next-intl';

/**
 * 
 * @param {string} type 
 * @returns {React.reactNode}
 */
const InputTextarea = ({ type="text", placeholder, translationKey, namespace = 'forms', onChange, value="" }) => {
    const [ focus, setFocus ] = useState(false);
    const t = useTranslations(namespace);
    
    // Use translation key if provided, otherwise use placeholder prop directly
    const displayPlaceholder = translationKey ? t(translationKey) : placeholder;

    return (
        <div className={`p-0 border-1 rounded-sm 
                        ${focus ? "border-zinc-400" : "border-zinc-800"}
                         transition-all duration-300`}
        >
            <textarea type={type} placeholder={displayPlaceholder}
                   className="focus:outline-0 w-full p-3 min-h-58 rounded-sm text-sm"
                   onFocus={()=>setFocus(true)}
                   onBlur={()=>setFocus(false)}
                   onChange={onChange}       
                   value={value}
            />
        </div>
    )
}
export default InputTextarea;