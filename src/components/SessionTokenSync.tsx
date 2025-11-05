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
      }
    } else if (status === "unauthenticated") {
      sessionStorage.removeItem('accessToken');
    }
  }, [session, status]);

  // ✅ NOUVEAU: Refresh la session NextAuth toutes les 10 minutes
  useEffect(() => {
    if (status === "authenticated") {
      
      // Refresh toutes les 10 minutes
      intervalRef.current = setInterval(() => {
        update(); // Force NextAuth à refresh la session
      }, 10 * 60 * 1000); // 10 minutes

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [status, update]);

  return null;
}