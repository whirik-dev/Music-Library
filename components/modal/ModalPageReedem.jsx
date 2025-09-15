import { useState } from 'react';
import { useTranslations } from 'next-intl';
import useToggle from "@/utils/useToggle";
import modalStore from "@/stores/modalStore";

import ModalCard from "@/components/modal/ModalCard";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";

const ModalPageReedem = ({}) => {
    const t = useTranslations('modal');
    const [ inputRedeem, setInputRedeem ] = useState('');

    useToggle(() => {
        setDepth(2);
    });

    const { toggleExpand, path, depth, setDepth } = modalStore();

    const registerHandler = () => {
        console.log(inputRedeem);
    }

    return (
        <>
            <ModalCard title={`Redeem`} desc={`Enter your code to redeem`}/>
            <InputField
                className="mx-3 rounded-lg my-3"
                placeholder={`Tap here to redeem your coupon`}
                value={inputRedeem}
                onChange={(e) => { setInputRedeem(e.target.value) }}
            />
            <Button
                name={`register`}
                onClick={registerHandler}
            />
        </>
    )
}
export default ModalPageReedem;