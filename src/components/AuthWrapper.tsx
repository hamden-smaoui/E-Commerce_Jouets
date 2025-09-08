// components/AuthWrapper.tsx
"use client"

import { useAuthSync } from '@/hooks/useAuthSync'

interface AuthWrapperProps {
  children: React.ReactNode
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  useAuthSync() // This will sync NextAuth session to localStorage
  return <>{children}</>
}