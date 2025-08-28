import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'

export const authConfig = {
  trustHost: true, // 로컬 개발 환경에서 localhost 허용
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              identifier: credentials.email,
              credential: credentials.password,
              provider: 'local'
            })
          });
          const result = await response.json();

          if (response.ok && result?.success && result.data) {
            return result.data;
          } else {
            return null;
          }
        } catch (err) {
          console.error('Auth error:', err);
          return null;
        }
      },
    }),

    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/", // 로그인 실패 시 이동할 페이지
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24시간
  },
  callbacks: {
    async jwt({ token, user, account, profile, trigger }) {
      // JWT 갱신 시 백엔드 세션 유효성 재확인
      if (trigger === 'update' && token.ssid) {
        try {
          const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/isLogged`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token.ssid}`
            }
          });

          if (!verifyResponse.ok) {
            // 백엔드 세션이 만료되었으면 기존 정보로 재인증 시도
            console.log('Backend session expired, attempting re-authentication');
            
            if (token.provider === 'google' && token.socialId) {
              const reAuthResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/verify`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  provider: 'google',
                  identifier: token.socialId,
                }),
              });

              const reAuthData = await reAuthResponse.json();
              if (reAuthData.success) {
                token.ssid = reAuthData.data.ssid;
                console.log('Re-authentication successful');
              } else {
                console.log('Re-authentication failed, invalidating JWT');
                return null;
              }
            } else {
              return null;
            }
          }
        } catch (error) {
          console.error('Session verification failed:', error);
          return null;
        }
      }
      // 소셜 로그인 (Google)
      if (account?.provider === 'google' && user) {
        try {
          // ✅ Google의 고유하고 일관된 사용자 ID 사용 (account.providerAccountId)
          const socialId = account.providerAccountId;
          
          // 1단계: 기존 사용자 확인
          const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              provider: 'google',
              identifier: socialId, // ✅ 일관된 식별자 사용
            }),
          });

          const verifyData = await verifyResponse.json();

          // 기존 사용자인지 확인
          if (verifyData.success) {
            // 기존 사용자 로그인 성공
            token.ssid = verifyData.data.ssid;
          } else {
            // 2단계: 신규 사용자 등록
            const registerResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                provider: 'google',
                social_id: socialId, // ✅ 일관된 식별자 사용
                email: user.email,
                username: user.name,
              }),
            });
      
            const registerData = await registerResponse.json();
      
            if (registerData?.success && registerData?.data?.id) {
              // 회원가입 후 첫 인증
              const verify2Response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/verify`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  provider: 'google',
                  identifier: socialId, // ✅ 일관된 식별자 사용
                }),
              });
    
              const verifyData2 = await verify2Response.json();
              if (verifyData2.success) {
                token.ssid = verifyData2.data.ssid;
              } else {
                console.error('New user verification failed:', verifyData2?.message);
                token.ssid = null;
              }
            } else {
              console.error('User registration failed:', registerData?.message);
              token.ssid = null;
            }
          }
        } catch (err) {
          const error = err as Error;
          console.error('Google login error:', error.message);
          token.ssid = null;
        }

        // JWT 토큰에 필요한 정보 추가
        token.name = user.name || null;
        token.email = user.email;
        token.provider = 'google';
        token.socialId = account.providerAccountId; // ✅ 일관된 식별자 저장
      }
    
      // credentials 로그인 (로컬 계정)
      if (account?.provider === 'credentials' && user) {
        token.name = user.name || null;
        token.email = user.email;
        token.ssid = (user as any).ssid || null;
        token.provider = 'credentials';
      }
    
      return token;
    },
    async session({ session, token, req }: any) {
      // Base session data (always available)
      (session.user as any).name = token.name || null;
      (session.user as any).email = token.email || null;
      (session.user as any).provider = token.provider || 'credentials';
      
      // 🔒 Security: SSID는 절대 클라이언트에 노출하지 않음
      // API 라우트에서만 getServerSession()을 통해 접근 가능
      
      // 인증 상태만 클라이언트에 제공 (SSID 없이)
      (session.user as any).hasAuth = !!token?.ssid;
      
      // Debug logging in development (SSID 값은 로그하지 않음)
      if (process.env.NODE_ENV === 'development') {
        console.log('[SESSION CALLBACK]', {
          hasReq: !!req,
          hasAuth: !!token?.ssid,
          provider: token?.provider,
          email: token?.email
        });
      }
      
      // SSID는 절대 세션에 포함하지 않음 - 보안 규칙 준수
      // API 라우트에서는 getToken()을 직접 사용하여 SSID 접근
      
      return session;
    },
  },
} satisfies NextAuthConfig