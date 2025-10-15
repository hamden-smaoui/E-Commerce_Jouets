import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    customToken: string;
    userData: {
      idUtilisateur: number;
      prenom: string;
      nom: string;
      email: string;
      role: string;
      telephone?: string;
      profileImage?: string;
      isGoogleUser?: boolean;
      isFacebookUser?: boolean;
      adresseRue?: string;
      adresseVille?: string;
      adresseCodePostal?: string;
      adressePays?: string;
    };
    userId: string;
  }

  interface User {
    customToken?: string;
    userData?: any;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    customToken?: string;
    userData?: any;
    userId?: string;
  }
}