'use client'
import { useState } from 'react';

/**
 * 
 * @param {string} type 
 * @returns {React.reactNode}
 */
const InputTextarea = ({ type="text", placeholder, onChange, value="" }) => {
    const [ focus, setFocus ] = useState(false);

    return (
        <div className={`p-0 border-1 rounded-sm 
                        ${focus ? "border-zinc-400" : "border-zinc-800"}
                         transition-all duration-300`}
        >
            <textarea type={type} placeholder={placeholder}
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