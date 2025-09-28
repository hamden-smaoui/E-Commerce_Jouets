"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Attendre session chargée

    if (status === "unauthenticated" || !session?.userData) {
      router.push('/signIn');
      return;
    }

    if (requireAdmin && session.userData.role !== 'admin') {
      router.push('/dashboard'); // Rediriger vers dashboard normal
      return;
    }
  }, [session, status, router, requireAdmin]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session?.userData) {
    return null;
  }

  if (requireAdmin && session.userData.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;