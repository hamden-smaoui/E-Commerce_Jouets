// types/next-auth.d.ts
import "next-auth"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    customToken?: string
    userId?: string
    userData?: {
      idUtilisateur: number
      prenom: string
      nom: string
      email: string
      telephone: string
      role: 'admin' | 'client'
      profileImage?: string
      isGoogleUser?: boolean
      isFacebookUser?: boolean
      adresseRue?: string
      adresseVille?: string
      adresseCodePostal?: string
      adressePays?: string
    }
  }

  interface User {
    id: string
    email?: string | null
    name?: string | null
    image?: string | null
    customToken?: string
    userData?: {
      idUtilisateur: number
      prenom: string
      nom: string
      email: string
      telephone: string
      role: 'admin' | 'client'
      profileImage?: string
      isGoogleUser?: boolean
      isFacebookUser?: boolean
      adresseRue?: string
      adresseVille?: string
      adresseCodePostal?: string
      adressePays?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    customToken?: string
    userId?: string
    userData?: {
      idUtilisateur: number
      prenom: string
      nom: string
      email: string
      telephone: string
      role: 'admin' | 'client'
      profileImage?: string
      isGoogleUser?: boolean
      isFacebookUser?: boolean
      adresseRue?: string
      adresseVille?: string
      adresseCodePostal?: string
      adressePays?: string
    }
  }
}