import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
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

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/", // 로그인 실패 시 이동할 페이지
  },
  session: {
    strategy: "jwt",
  },
  jwt: {
    encryption: true
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // 소셜 로그인
      if (account?.provider === 'google' && user) {
        try {
          const verify = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              provider: 'google',
              identifier: user.id,
            }),
          });

          const verifyData = await verify.json()

          // 가입된 유저인지 검사
          if(verifyData.success)
          {
            // 가입된 유저일경우
            // console.log(verifyData);
            token.ssid = verifyData.data.ssid;
          }
          else
          {
            // 가입이 안되어있어서 가입 진행 
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                provider: 'google',
                social_id: user.id,
                email: user.email,
                username: user.name,
              }),
            });
      
            const data = await response.json();
            console.log(data);
      
            if (data?.success && data?.data?.id) {

              //회원가입 후 첫 인증
              const verify2 = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/verify`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  provider: 'google',
                  identifier: user.id,
                }),
              });
    
              const verifyData2 = await verify2.json()
              if(verifyData2.success)
              {
                token.ssid = verifyData2.data.ssid;
              }

            } else {
              console.warn("소셜 회원가입 실패:", data?.message);
              token.ssid = null;
            }
          }
        } catch (err) {
          console.error("소셜 요청 실패:", err);
          token.ssid = null;
        }
        

        token.name = user.name || null;
        token.email = user.email;
        token.provider = 'google';
      }
    
      // credentials 로그인 (user.ssid 직접 전달됨)
      if (account?.provider === 'credentials' && user) {
        token.name = user.name || null;
        token.email = user.email;
        token.ssid = user.ssid || null;
        token.provider = 'credentials';
      }
    
      return token;
    },
    async session({ session, token }) {
      session.user.name = token.name || null;
      session.user.email = token.email;
      session.user.ssid = token.ssid || null;
      session.user.provider = token.provider || 'credentials';
      return session;
    },
  },
});

export { handler as GET, handler as POST };
