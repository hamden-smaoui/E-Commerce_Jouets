import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook" // Ajout
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // NOUVEAU: Provider Facebook
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        emailOrPhone: { label: "Email ou Téléphone", type: "text" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.emailOrPhone || !credentials?.password) {
          return null
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emailOrPhone: credentials.emailOrPhone,
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
      // Google authentication
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
      
      // NOUVEAU: Facebook authentication
      if (account?.provider === "facebook") {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/facebook-auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
            facebookId: user.id,
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