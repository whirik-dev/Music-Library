import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useTranslations } from 'next-intl';

import useAuthStore from "@/stores/authStore";
import SocialLoginButton from "@/components/ui/SocialLoginButton";
import InputField from "@/components/ui/InputField";
import Divider from "@/components/ui/Divider";
import Button from "@/components/ui/Button2";

const SignInPage = () => {
    const { toggleIsLoading, toggleIsLogged, setUserInfo, toggleAuthModal, setModalPage} = useAuthStore();
    const t = useTranslations('auth');

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");


    // Login with Credential
    const handleLogin = async () => {
        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        // 로그인 success or fail?
        if (res.ok) {

            // 여기서 세션 정보 불러오기
            const session = await getSession();
            if (session?.user) {
                // 예: { id, email, name, ... }
                setUserInfo(session.user);
            }

            // init error
            setError("");
        } else {
            setError(t('invalid_credentials'));
        }
        window.location.reload();
    };

    // Sign Up
    const handleSignUp = async () => {

    };

    return (
        <div className="flex flex-col">
            <div className="flex flex-row gap-10 p-10 relative">
                {/* Sign Up Area */}
                <div className="flex-1 flex flex-col gap-3">
                    <span className="text-3xl mb-10">{t('sign_up')}</span>
                    {/* <span>회원가입 독려 메시지, ex)지금 바로 고퀄리티 라이브러리의 접근권한을 얻으세요! 등...</span> */}

                    <Button name={t('sign_up')} onClick={()=>setModalPage('signup')} className="mt-auto"/>
                </div>

                {/* Sign In Area */}
                <div className="flex-1 flex flex-col gap-3">
                    <span className="text-3xl mb-10">{t('sign_in')}</span>
                    <SocialLoginButton method="google" onClick={() => signIn('google')}/>
                    <SocialLoginButton method="x" />
                    <Divider name={t('divider_or')} />
                    <InputField
                        placeholder={t('username_email_placeholder')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <InputField
                        type="password"
                        placeholder={t('password_placeholder')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button name={t('sign_in')} onClick={handleLogin} />
                    {error && <p className="text-sm text-red-500">{error}</p>}
                </div>

                {/* divider */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-zinc-300/10" />
            </div>
            <div className="flex text-xs border-t-1 border-zinc-800 p-3 text-zinc-600">
                {t('terms_agreement')}
            </div>
        </div>
    )
}

export default SignInPage;