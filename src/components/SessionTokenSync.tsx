"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

export default function SessionTokenSync() {
  const { data: session, status, update } = useSession();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.customToken) {
      const currentToken = sessionStorage.getItem('accessToken');
      
      if (!currentToken || currentToken !== session.customToken) {
        sessionStorage.setItem('accessToken', session.customToken);
        console.log("✅ Token synchronisé dans sessionStorage");
      }
    } else if (status === "unauthenticated") {
      sessionStorage.removeItem('accessToken');
      console.log("🗑️ Token supprimé de sessionStorage");
    }
  }, [session, status]);

  // ✅ NOUVEAU: Refresh la session NextAuth toutes les 10 minutes
  useEffect(() => {
    if (status === "authenticated") {
      console.log("🔄 Mise en place du refresh automatique NextAuth");
      
      // Refresh toutes les 10 minutes
      intervalRef.current = setInterval(() => {
        console.log("🔄 Refresh session NextAuth...");
        update(); // Force NextAuth à refresh la session
      }, 10 * 60 * 1000); // 10 minutes

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          console.log("🛑 Arrêt du refresh automatique NextAuth");
        }
      };
    }
  }, [status, update]);

  return null;
}