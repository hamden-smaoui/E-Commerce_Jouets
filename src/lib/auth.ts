import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";

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
          return null;
        }

        try {
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
              customToken: data.token,
              userData: data.user,
            };
          }
          
          return null;
        } catch (error) {
          console.error("Erreur authorize:", error);
          return null;
        }
      }
    })
  ],

  callbacks: {
    async signIn({ user, account }) {
      // ✅ Google/Facebook: NextAuth gère tout automatiquement
      if (account?.provider === "google" || account?.provider === "facebook") {
        // On laisse NextAuth gérer, pas besoin de faire plus
        return true;
      }

      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.customToken = user.customToken;
        token.userData = user.userData;
        token.userId = user.id;
      }
      
      // ✅ Pour Google/Facebook, récupère les infos du backend
      if (account?.provider === "google" || account?.provider === "facebook") {
        try {
          const endpoint = account.provider === "google" ? "google-auth" : "facebook-auth";
          const idKey = account.provider === "google" ? "googleId" : "facebookId";
          
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/${endpoint}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: user.email,
                name: user.name,
                [idKey]: account.providerAccountId,
                image: user.image,
              }),
            }
          );

          const data = await res.json();
          if (res.ok && data.token && data.user) {
            token.customToken = data.token;
            token.userData = data.user;
            token.userId = data.user.idUtilisateur.toString();
          }
        } catch (err) {
        }
      }
      
      return token;
    },

    async session({ session, token }) {
      session.customToken = token.customToken as string;
      session.userData = token.userData as any;
      session.userId = token.userId as string;
      return session;
    },
  },

  pages: {
    signIn: '/signIn',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 jours
  },
jwt: {
    maxAge: 7 * 24 * 60 * 60, // ✅ 7 jours aussi
  },
  secret: process.env.NEXTAUTH_SECRET,
};