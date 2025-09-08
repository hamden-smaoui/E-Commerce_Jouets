// hooks/useAuthSync.ts
"use client" // Add this directive

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

export const useAuthSync = () => {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'authenticated' && session?.customToken && session?.userData) {
      // Store in localStorage like your AuthService does
      localStorage.setItem('token', session.customToken)
      localStorage.setItem('user', JSON.stringify(session.userData))
      console.log('Synced NextAuth session to localStorage')
    } else if (status === 'unauthenticated') {
      // Clear localStorage when signed out
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      console.log('Cleared localStorage on sign out')
    }
  }, [session, status])

  return { session, status }
}