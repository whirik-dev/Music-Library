"use client";

import { SessionProvider } from "next-auth/react";
import { JWTAuthProvider } from "@/contexts/JWTAuthContext";
import AuthProvider from "./auth/AuthProvider";
import SessionDebug from "./debug/SessionDebug";

export default function Provider({ children }) {
  return (
    <SessionProvider
      refetchInterval={10 * 60} // 10분마다 자동 갱신 (15분 만료 전에)
      refetchOnWindowFocus={true}
      refetchWhenOffline={false}
    >
      <JWTAuthProvider>
        <AuthProvider />
        {children}
        <SessionDebug />
      </JWTAuthProvider>
    </SessionProvider>
  );
}