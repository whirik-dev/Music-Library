"use client";

import { IconLogout } from "@tabler/icons-react";
import { signOut } from "next-auth/react";
import { toast } from 'react-toastify';
import { useJWTAuth } from "@/hooks/useJWTAuth";
import { clearTokenCache } from "@/utils/jwtHelpers";

import useAuthStore from "@/stores/authStore";

const SignOutButton = () => {
    const { toggleIsLogged, clearUserInfo, initializing } = useAuthStore();
    const { data: session } = useJWTAuth();

  const handleSignOut = async () => {

    try {
      // 인증 상태 확인 (ssid는 서버에서만 확인)
      if (!session?.user?.hasAuth) {
        alert('로그인 정보가 없습니다.');
        console.log('No authentication found');
        return;
      }

      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      const result = await response.json();

      if (result.success || response.status === 401) {
        // 성공하거나 이미 로그아웃된 상태(401)면 정상 처리
        clearTokenCache(); // JWT 캐시 클리어
        toggleIsLogged(false);
        clearUserInfo();
        initializing();
        await signOut({ redirect: false }); // 리다이렉트 없이 로그아웃 처리
        toast.success('Signout Success');
        // window.location.reload(); // 필요시
      } else {
        // alert(result.message || '로그아웃 실패');
        toast.error('Signout Fail');
      }
    } catch (error) {
      console.error('Signout error:', error);
      // 네트워크 오류나 기타 오류가 발생해도 로그아웃 처리
      clearTokenCache(); // JWT 캐시 클리어
      toggleIsLogged(false);
      clearUserInfo();
      initializing();
      await signOut({ redirect: false });
      toast.success('Signout Success');
    }
  };

  return (
    <div className="cursor-pointer hover:opacity-50" onClick={handleSignOut}>
      <IconLogout size={18} />
    </div>
  );
};

export default SignOutButton;