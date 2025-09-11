"use client";
import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';

export function ModalItem({}){
    return (
        <div className="">
            
        </div>
    )
}

const PriceModal = ({}) => {
    const t = useTranslations('pricing');
    
    return (
        <div className="">
            <div className="">
                {/* Price modal content will use translation keys when implemented */}
                {/* Example: {t('select_plan')} */}
            </div>
        </div>
    )
}
export default PriceModal;