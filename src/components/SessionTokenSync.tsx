"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function SessionTokenSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.customToken) {
      const currentToken = sessionStorage.getItem('accessToken');
      
      // ✅ Synchronise le token pour TOUS les types de connexion
      if (!currentToken || currentToken !== session.customToken) {
        sessionStorage.setItem('accessToken', session.customToken);
        console.log("✅ Token synchronisé dans sessionStorage");
      }
    } else if (status === "unauthenticated") {
      // ✅ Nettoie le token lors de la déconnexion
      sessionStorage.removeItem('accessToken');
      console.log("🗑️ Token supprimé de sessionStorage");
    }
  }, [session, status]);

  return null;
}