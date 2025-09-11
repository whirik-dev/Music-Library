"use client"

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';

import useAuthStore from "@/stores/authStore";
import useUiStore from "@/stores/uiStore";

import SignInPage from "@/components/auth/SignInPage";
import SignUpPage from "@/components/auth/SignUpPage";
/**
 * 
 * @returns {React.ReactNode}
 */
const SignInModal = () => {
    const { authModal, isLogged, toggleAuthModal, modalPage } = useAuthStore();
    const { colorMode } = useUiStore();
    const t = useTranslations('auth');

    if (!authModal || isLogged) return null;

    const closeAuthModalHelper = () => {
        (modalPage === "signup" && window.confirm(t('modal_close_confirmation'))) || (modalPage === "signin")
        ? toggleAuthModal()
        : null;
    }

    return (
        <div className="flex items-center justify-center z-50 fixed top-0 left-0 w-full h-screen">
            <div className="absolute top-0 left-0 w-full h-full bg-zinc-900/50" onClick={()=>closeAuthModalHelper()} />
            <div className={`w-[813px] bg-background/50 backdrop-blur-md rounded-md shadow-md ${colorMode === 'dark' && 'border border-foreground/10'}`}>
                {modalPage === "signin" ? <SignInPage />
                :modalPage === "signup" ? <SignUpPage /> : ""}
            </div>
        </div>
    );
};

export default SignInModal;
