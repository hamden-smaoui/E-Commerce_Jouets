// app/auth/error/page.tsx (pour App Router)
// ou pages/auth/error.tsx (pour Pages Router)
"use client"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Erreur d'authentification</h2>
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error === "AccessDenied" && "Accès refusé lors de l'authentification Google"}
            {error === "Configuration" && "Erreur de configuration"}
            {!error && "Une erreur s'est produite"}
          </div>
          <p className="text-gray-600 mb-6">
            Veuillez réessayer ou utiliser une autre méthode de connexion
          </p>
          <Link 
            href="/signIn"
            className="bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 font-semibold transition-colors"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  )
}