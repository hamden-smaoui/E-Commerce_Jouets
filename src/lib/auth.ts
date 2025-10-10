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
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // ✅ GOOGLE AUTH
      if (account?.provider === "google") {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google-auth`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              googleId: account.providerAccountId, // ✅ Utilise providerAccountId
              image: user.image
            })
          });

          const data = await res.json();
          
          // ✅ IMPORTANT : Stocker les données dans l'objet user
          if (res.ok && data.token && data.user) {
            user.customToken = data.token;
            user.userData = data.user;
            user.id = data.user.idUtilisateur.toString();
            return true;
          }
          
          return false;
        } catch (err) {
          console.error("Erreur Google auth:", err);
          return false;
        }
      }
     
      // ✅ FACEBOOK AUTH
      if (account?.provider === "facebook") {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/facebook-auth`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              facebookId: account.providerAccountId,
              image: user.image
            })
          });

          const data = await res.json();
          
          if (res.ok && data.token && data.user) {
            user.customToken = data.token;
            user.userData = data.user;
            user.id = data.user.idUtilisateur.toString();
            return true;
          }
          
          return false;
        } catch (err) {
          console.error("Erreur Facebook auth:", err);
          return false;
        }
      }
      
      return true;
    },
    
    async jwt({ token, user, account }) {
      // ✅ Lors de la première connexion
      if (user) {
        token.customToken = user.customToken;
        token.userData = user.userData;
        token.userId = user.id;
      }
      
      return token;
    },
    
    async session({ session, token }) {
      // ✅ Injecter les données dans la session
      session.customToken = token.customToken as string;
      session.userData = token.userData as any;
      session.userId = token.userId as string;
      
      return session;
    }
  },
  pages: {
    signIn: '/signIn',
    error: '/auth/error',
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
}