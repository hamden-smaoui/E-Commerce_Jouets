import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

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
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account?.provider) return false;

      try {
        const endpoint = account.provider === "google" ? "google-auth" : "facebook-auth";
        
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/${endpoint}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              [`${account.provider}Id`]: account.providerAccountId,
              image: user.image,
            }),
          }
        );

        const data = await res.json();

       if (!res.ok || !data.token || !data.user) {
          console.error('Backend error:', data);
          return false;
        }

        // Stocke les données dans l'objet user
        user.customToken = data.token;
        user.userData = data.user;
        user.id = data.user.idUtilisateur.toString();

        return true;
      } catch (err) {
        console.error(`Erreur ${account.provider} auth:`, err);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.customToken = user.customToken;
        token.userData = user.userData;
        token.userId = user.id;
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

  secret: process.env.NEXTAUTH_SECRET,
};