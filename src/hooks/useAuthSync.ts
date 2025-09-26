"use client"
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

export const useAuthSync = () => {
  const { data: session, status } = useSession()

  useEffect(() => {
    // Ajoute un flag pour éviter la boucle infinie
    let alreadySynced = false;

    if (status === 'authenticated' && session?.customToken && session?.userData) {
      // Vérifie si déjà dans localStorage
      const currentToken = localStorage.getItem('token');
      if (currentToken !== session.customToken) {
        localStorage.setItem('token', session.customToken);
        localStorage.setItem('user', JSON.stringify(session.userData));
        alreadySynced = true;
        console.log('Synced NextAuth session to localStorage');
      }
    } else if (status === 'unauthenticated') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      alreadySynced = false;
      console.log('Cleared localStorage on sign out');
    }
  }, [session, status]);
}