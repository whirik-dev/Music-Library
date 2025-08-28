import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      ssid?: string | null
      provider?: string
      email?: string | null
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    ssid?: string | null
    provider?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    ssid?: string | null
    provider?: string
  }
}