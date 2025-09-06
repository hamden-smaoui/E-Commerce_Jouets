// lib/auth.ts
import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import authService from "../services/auth-service"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const response = await authService.login({
            email: credentials.email,
            motDePasse: credentials.password
          })
          
          return {
            id: response.user.idUtilisateur.toString(),
            email: response.user.email,
            name: `${response.user.prenom} ${response.user.nom}`,
            token: response.token
          }
        } catch (error) {
          return null
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Vérifier si l'utilisateur existe déjà
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/google-signin`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              googleId: user.id,
              image: user.image
            }),
          })
          
          if (!response.ok) {
            return false
          }
          
          return true
        } catch (error) {
          console.error('Erreur lors de la connexion Google:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = account.access_token
        token.userId = user.id
      }
      return token
    },
    async session({ session, token }) {
      token.accessToken = token.accessToken as string
      token.userId = token.userId as string
      return session
    }
  },
  pages: {
    signIn: '/signIn',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt"
  }
}

export default NextAuth(authOptions)