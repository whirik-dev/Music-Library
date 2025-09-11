"use client";

import { IconLogout } from "@tabler/icons-react";
import { signOut, useSession } from "next-auth/react";
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';

import useAuthStore from "@/stores/authStore";

const SignOutButton = () => {
    const { toggleIsLogged, clearUserInfo, initializing } = useAuthStore();
    const { data: session } = useSession();
    const t = useTranslations('errors');

  const handleSignOut = async () => {

    try {
      const session_id = session.user.ssid; // 세션에서 ssid 추출
      if (!session_id) {
        alert(t('no_login_info'));
        console.log(JSON.stringify(session.user));
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/signout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.ssid}`
        },
      });

      const result = await response.json();

      if (result.success) {
        toggleIsLogged(false);
        clearUserInfo();
        initializing();
        await signOut({ redirect: false }); // 리다이렉트 없이 로그아웃 처리
        toast.success('Signout Success');
        // window.location.reload(); // 필요시
      } else {
        // alert(result.message || '로그아웃 실패');
        toast.error(t('signout_failed'));
      }
    } catch (error) {
      // toast.error('Server Error');
      alert(t('server_error_with_message', { message: error.message }));
    }
  };

  return (
    <div className="cursor-pointer hover:opacity-50" onClick={handleSignOut}>
      <IconLogout size={18} />
    </div>
  );
};

export default SignOutButton;