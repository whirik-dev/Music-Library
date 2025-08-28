"use client";

import { useEffect, useState } from "react";
import { getUserFromToken } from "@/utils/jwtHelpers";
import useAuthStore from "@/stores/authStore";

export default function SessionDebug() {
  const [tokenUser, setTokenUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isLogged } = useAuthStore();

  useEffect(() => {
    const fetchTokenUser = async () => {
      try {
        const user = await getUserFromToken();
        setTokenUser(user);
      } catch (error) {
        console.error('Failed to fetch token user:', error);
        setTokenUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenUser();
  }, []);

  // 개발 환경에서만 표시
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h4 className="font-bold mb-2">JWT Auth Debug</h4>
      <div>
        <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}
      </div>
      <div>
        <strong>Store Logged:</strong> {isLogged ? 'Yes' : 'No'}
      </div>
      <div>
        <strong>JWT Token:</strong> {tokenUser ? 'Active' : 'None'}
      </div>
      {tokenUser && (
        <div className="mt-2">
          <div><strong>Email:</strong> {tokenUser.email}</div>
          <div><strong>Name:</strong> {tokenUser.name}</div>
          <div><strong>Provider:</strong> {tokenUser.provider}</div>
          <div><strong>Auth Status:</strong> {tokenUser.hasAuth ? 'Authenticated' : 'Not Authenticated'}</div>
        </div>
      )}
    </div>
  );
}