import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
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

        // ✅ Utilise le proxy au lieu d'appeler directement le backend
        const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/login-proxy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
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
      // ---- GOOGLE AUTH SOCIAL LOGIN ----
      if (account?.provider === "google") {
        // Appelle ton backend direct pour installer le cookie refreshToken
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/google-auth`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include", // IMPORTANT pour les cookies !
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              googleId: user.id, // ou user.sub selon la structure NextAuth
              image: user.image
            })
          });
        } catch (err) {
          console.error("Erreur lors de l'appel backend Google auth:", err);
          return false;
        }
      }
     
      
      // Facebook authentication
      if (account?.provider === "facebook") {
        // ✅ Utilise le proxy
        const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/facebook-proxy`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
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
    async jwt({ token, user }) {
      if (user?.customToken) token.customToken = user.customToken;
      if (user?.userData) token.userData = user.userData;
      if (user?.id) token.userId = user.id;
      return token;
    },
    async session({ session, token }) {
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