import { useState, useRef } from "react";
import { useTranslations } from 'next-intl';

import InputField from "@/components/ui/InputField";
import Divider from "@/components/ui/Divider";
import Button from "@/components/ui/Button2";

const SignUpPage = () => {
    const t = useTranslations('auth');
    
    const [email, setEmail] = useState("");
    const [emailCheckColor, setEmailCheckColor] = useState("");
    const [emailError, setEmailError] = useState(""); // 이메일 관련 에러 메시지

    const [verificationCode, setVerificationCode] = useState(""); // 인증 코드 입력값
    const [verificationClick, setVerificationClick] = useState(false);
    const [verificationError, setVerificationError] = useState(""); // 인증 코드 에러 메시지
    const [emailValid, setEmailValid] = useState(null); // null: 검증 안함, true/false: 결과

    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordMatch, setPasswordMatch] = useState(null);

    const [signUpSuccess, setSignUpSuccess] = useState(false);
    const [signUpError, setSignUpError] = useState("");

    const inputEmail = useRef();
    const inputCode = useRef();
    const inputPass = useRef();
    const inputPassConfirm = useRef();

    // 이메일 검증 + 상태 업데이트
    const handleEmailValidate = (value) => {
        setEmail(value);
        setEmailValid(null); // 이메일 변경 시 검증 상태 초기화
        setVerificationClick(false);
        setVerificationError("");
        setEmailError("");

        const regEmail = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,}$/i;

        const color =
            value === ""
                ? "red"
                : !regEmail.test(value)
                ? "orange"
                : "green";

        setEmailCheckColor(color);
        if (color === "red") setEmailError(t('email_required'));
        else if (color === "orange") setEmailError(t('email_invalid'));
        else setEmailError("");
    };

    // 인증코드 발송 요청
    const sendEmailVerificationCode = () => {
        if (emailCheckColor !== "green") {
            setVerificationClick(false);
            setVerificationError(t('email_valid_required'));
            return;
        }

        setVerificationClick(true);
        setVerificationError("");
        // TODO: 실제 인증 코드 발송 API 호출
    };

    // 인증코드 검증 요청
    const handleEmailVerifyRequest = () => {
        // TODO: 인증 코드 API 호출 후 성공/실패 여부에 따라 상태 변경
        if (verificationCode.trim() === "") {
            setVerificationError(t('verification_code_required'));
            inputCode.current?.focus();
            setEmailValid(false);
            return;
        }

        // 가정: 인증 코드가 "123456"일 때 성공 처리 (테스트용)
        if (verificationCode === "123456") {
            setEmailValid(true);
            setVerificationError("");
        } else {
            setEmailValid(false);
            setVerificationError(t('verification_code_invalid'));
            inputCode.current?.focus();
        }
    };

    // 비밀번호 일치 체크 및 유효성 검사
    const handlePasswordMatch = () => {
        setPasswordError("");
        setPasswordMatch(null);

        if (password === "") {
            inputPass.current?.focus();
            setPasswordError(t('password_required'));
            return false;
        }

        if (password.length < 8) {
            inputPass.current?.focus();
            setPasswordError(t('password_min_length'));
            return false;
        }

        if (passwordConfirm === "") {
            inputPassConfirm.current?.focus();
            setPasswordError(t('password_confirm_required'));
            return false;
        }

        const isMatch = password === passwordConfirm;
        setPasswordMatch(isMatch);

        if (!isMatch) {
            inputPassConfirm.current?.focus();
            setPasswordError(t('passwords_not_match'));
            return false;
        }

        return true;
    };

    // 회원가입 요청
    const handleSignUp = async () => {
        if (!handlePasswordMatch()) return;
 
        const result = { email, verificationCode, password }

        // TODO: 회원가입 API 호출 등 실제 처리
        console.log(result);

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(result)
        });

        const signupRes = await response.json();
        if(signupRes.success)
        {
            setSignUpSuccess(true);
        }
        else
        {
            setSignUpError(signupRes.message)
        }
        
    };

    return (
        <>
            {signUpError === "" ? (
                <>
                    {!signUpSuccess ? (
                        <div className="flex flex-col">
                            <div className="flex flex-row gap-10 p-10 relative">
                                <div className="flex-1 flex flex-col gap-3">
                                    <span className="text-3xl mb-10">{t('sign_up')}</span>

                                    <span>{t('email')}</span>
                                    <InputField
                                        ref={inputEmail}
                                        placeholder={t('email_placeholder')}
                                        value={email}
                                        border={emailCheckColor}
                                        onChange={(e) => handleEmailValidate(e.target.value)}
                                    />
                                    <span
                                        className={`text-sm ${
                                            emailCheckColor === "red"
                                                ? "text-red-400"
                                                : emailCheckColor === "orange"
                                                ? "text-orange-400"
                                                : emailCheckColor === "green"
                                                ? "text-green-500"
                                                : "text-foreground/50"
                                        }`}
                                    >
                                        {emailError}
                                    </span>

                                    <Button
                                        name={t('send_verification_code')}
                                        onClick={sendEmailVerificationCode}
                                        className={
                                            emailCheckColor !== "green"
                                                ? "!opacity-50 !cursor-not-allowed"
                                                : "opacity-100"
                                        }
                                    />

                                    {verificationClick && (
                                        <>
                                            <span>{t('verification_code')}</span>
                                            <InputField
                                                ref={inputCode}
                                                placeholder={t('verification_code_placeholder')}
                                                value={verificationCode}
                                                onChange={(e) => setVerificationCode(e.target.value)}
                                                border={verificationError ? "red" : ""}
                                            />
                                            {verificationError && (
                                                <span className="text-red-400 text-sm">{verificationError}</span>
                                            )}
                                            {emailValid === true && (
                                                <span className="text-green-500 text-sm">
                                                    {t('verification_code_valid')}
                                                </span>
                                            )}
                                            <Button name={t('verify')} onClick={handleEmailVerifyRequest} />
                                        </>
                                    )}

                                    {emailValid && (
                                        <>
                                            <span>{t('password')}</span>
                                            <InputField
                                                ref={inputPass}
                                                type="password"
                                                placeholder={t('password_placeholder')}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                border={passwordError ? "red" : ""}
                                            />
                                            <InputField
                                                ref={inputPassConfirm}
                                                type="password"
                                                placeholder={t('confirm_password_placeholder')}
                                                value={passwordConfirm}
                                                onChange={(e) => setPasswordConfirm(e.target.value)}
                                                border={passwordError ? "red" : ""}
                                            />
                                            {passwordError && (
                                                <span className="text-red-400 text-sm">{passwordError}</span>
                                            )}
                                            <Button name={t('sign_up')} onClick={handleSignUp} />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            <div className="flex flex-row gap-10 p-10 relative">
                                <div className="flex-1 flex flex-col gap-3 text-center">
                                    {t('signup_success')}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex flex-col">
                    <div className="flex flex-row gap-10 p-10 relative">
                        <div className="flex-1 flex flex-col gap-3 text-center">
                            {t('signup_error', { error: signUpError })}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SignUpPage;
