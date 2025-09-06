// pages/forgot-password.tsx
"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { EnvelopeIcon } from "@heroicons/react/24/solid";
import authService from '../../services/auth-service';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("L'email est requis");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Format d'email invalide");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      await authService.forgotPassword(email);
      setMessage("Un code de vérification a été envoyé à votre email");
      setIsEmailSent(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Image src="/images/logo2.png" alt="Toy Universe Logo" width={120} height={120} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Email envoyé !</h2>
            <p className="text-gray-600">Vérifiez votre boîte email</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <EnvelopeIcon className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">
                Si vous ne voyez pas l'email, vérifiez votre dossier spam.
              </p>
            </div>

            <Link 
              href="/reset-password" 
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold transition-colors inline-block text-center"
            >
              J'ai reçu le code
            </Link>

            <div className="mt-4">
              <button
                onClick={() => {setIsEmailSent(false); setEmail(""); setMessage(""); setError("");}}
                className="text-purple-600 hover:text-purple-800 text-sm font-medium"
              >
                Essayer avec un autre email
              </button>
            </div>
          </div>

          <div className="text-center">
            <Link href="/signIn" className="text-purple-600 hover:text-purple-800 font-medium">
              ← Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Image src="/images/logo2.png" alt="Toy Universe Logo" width={120} height={120} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Mot de passe oublié</h2>
          <p className="text-gray-600">
            Entrez votre email pour recevoir un code de récupération
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
                {message}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    error ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="votre.email@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Envoi en cours..." : "Envoyer le code"}
            </button>
          </form>
        </div>

        <div className="text-center">
          <Link href="/signIn" className="text-purple-600 hover:text-purple-800 font-medium">
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}