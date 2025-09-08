// types/next-auth.d.ts
import "next-auth"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    userId?: string
    customToken?: string
    userData?: {
      idUtilisateur: number
      prenom: string
      nom: string
      email?: string
      telephone: string
      role: 'admin' | 'client' | null
      profileImage?: string
      isGoogleUser?: boolean
    }
  }

  interface User {
    id: string
    email?: string | null
    name?: string | null
    image?: string | null
    role?: string | null  // Change this to allow string | null
    customToken?: string
    userData?: any
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    userId?: string
    customToken?: string
    userData?: any
    role?: string | null
  }
}