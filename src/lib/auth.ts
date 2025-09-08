// lib/auth.ts
import { NextAuthOptions } from "next-auth"
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
            role: response.user.role
          }
        } catch (error) {
          return null
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
  console.log('SignIn callback:', { user, account, profile });
  
  if (account?.provider === "google") {
    try {
      console.log('Calling Google API directly...');
      
      // Call your backend API directly but with the same data structure
      const response = await fetch(`${process.env.API_BASE_URL || 'http://localhost:3001/api'}/auth/google-auth`, {
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
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        return false;
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      // Store the response data
      user.customToken = data.token;
      user.userData = data.user;
      
      return true;
    } catch (error) {
      console.error('Error during Google signIn:', error);
      return false;
    }
  }
  return true;
},
    
    async jwt({ token, user, account }) {
      // If this is a Google sign-in, store the custom token and user data
      if (account?.provider === "google" && user) {
        token.customToken = (user as any).customToken;
        token.userData = (user as any).userData;
        token.accessToken = account.access_token;
      } else if (user) {
        token.accessToken = account?.access_token;
        token.userId = user.id;
      }
      return token;
    },
    
    async session({ session, token }) {
      // Add the custom data to the session
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
  session: {
    strategy: "jwt"
  }
}