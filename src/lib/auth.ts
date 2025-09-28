import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

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

        // Appel direct à ton backend (PAS via authService)
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            motDePasse: credentials.password
          })
        });
        const data = await res.json();

        if (res.ok && data.token && data.user) {
          return {
            id: data.user.idUtilisateur.toString(),
            email: data.user.email,
            name: `${data.user.prenom} ${data.user.nom}`,
            role: data.user.role,
            customToken: data.token,
            userData: data.user,
          };
        } else {
          return null;
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Google: récupère le token et user de ton backend
      if (account?.provider === "google") {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google-auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
            googleId: user.id,
            image: user.image
          }),
        });
        if (!response.ok) return false;
        const data = await response.json();
        user.customToken = data.token;
        user.userData = data.user;
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // Ajoute customToken et userData pour tous les providers
      if (user?.customToken) token.customToken = user.customToken;
      if (user?.userData) token.userData = user.userData;
      if (user?.id) token.userId = user.id;
      if (account?.access_token) token.accessToken = account.access_token;
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.userId = token.userId as string;
      session.customToken = token.customToken as string;
      session.userData = token.userData as any;
      return session;
    }
  },
  pages: {
    signIn: '/signIn',
    error: '/auth/error',
  },
  session: { strategy: "jwt" }
}