"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getUserFromToken } from "@/utils/jwtHelpers";
import { startTokenRefresh, stopTokenRefresh } from "@/utils/tokenRefresh";

const JWTAuthContext = createContext();

export function JWTAuthProvider({ children }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  const fetchUser = useCallback(async () => {
    try {
      setStatus("loading");
      const user = await getUserFromToken();
      
      if (user && user.hasAuth) {
        setData({ 
          user: {
            email: user.email,
            name: user.name,
            provider: user.provider,
            hasAuth: user.hasAuth
          }
        });
        setStatus("authenticated");
      } else {
        setData(null);
        setStatus("unauthenticated");
      }
    } catch (error) {
      console.error("JWT auth error:", error);
      setData(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // 주기적으로 토큰 상태 체크 및 갱신
  useEffect(() => {
    if (status === "authenticated") {
      const interval = setInterval(() => {
        // 토큰 상태 재확인으로 NextAuth 자동 갱신 트리거
        fetchUser();
      }, 5 * 60 * 1000); // 5분마다 체크

      return () => clearInterval(interval);
    }
  }, [status, fetchUser]);

  const refresh = useCallback(() => {
    fetchUser();
  }, [fetchUser]);

  const value = {
    data,
    status,
    refresh
  };

  return (
    <JWTAuthContext.Provider value={value}>
      {children}
    </JWTAuthContext.Provider>
  );
}

export function useJWTAuth() {
  const context = useContext(JWTAuthContext);
  
  if (context === undefined) {
    throw new Error('useJWTAuth must be used within a JWTAuthProvider');
  }
  
  return context;
}