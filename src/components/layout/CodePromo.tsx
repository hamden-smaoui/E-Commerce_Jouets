import React, { useState } from 'react';
import codesPromoService from '@/services/codes-promo-service';
import { useSession } from "next-auth/react";
import Link from 'next/link';

interface CodePromoInputProps {
  montantPanier: number;
  idUtilisateur?: number;
  onCodeApplique: (data: { code: string; valeurPourcentage: number }) => void;
  onCodeSupprime: () => void;
  codeActuel?: string;
}

const CodePromoInput: React.FC<CodePromoInputProps> = ({
  montantPanier,
  idUtilisateur,
  onCodeApplique,
  onCodeSupprime,
  codeActuel,
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string; montantMinimum?: number } | null>(null);
  const { data: session, status } = useSession();
  const token = session?.customToken;
  
  // ✅ Vérifier si l'utilisateur est connecté
  const isAuthenticated = status === "authenticated";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    // ✅ Bloquer si non connecté
    if (!isAuthenticated) {
      setMessage({ 
        type: 'error', 
        text: 'Vous devez être connecté pour utiliser un code promo' 
      });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const resultat = await codesPromoService.validerCodePromo(
        code.trim().toUpperCase(),
        token
      );

      if (resultat.valide && resultat.valeurPourcentage) {
        onCodeApplique({
          code: code.trim().toUpperCase(),
          valeurPourcentage: resultat.valeurPourcentage
        });
        setMessage({ type: 'success', text: resultat.message });
        setCode('');
      } else {
        setMessage({
          type: 'error',
          text: resultat.message
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la validation du code' });
    } finally {
      setLoading(false);
    }
  };

  const handleSupprimer = () => {
    onCodeSupprime();
    setMessage(null);
  };

  return (
    <div className="space-y-3 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="font-medium text-gray-900 text-sm sm:text-base">Code promo</h3>
        {codeActuel && (
          <button
            onClick={handleSupprimer}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Supprimer le code
          </button>
        )}
      </div>

      {/* ✅ NOUVEAU : Message si non connecté */}
      {!isAuthenticated ? (
        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg w-full">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-800 mb-1">
                Codes promo réservés aux membres
              </p>
              <p className="text-xs text-blue-700 mb-2">
                Connectez-vous pour bénéficier de nos codes promo exclusifs et profiter de réductions supplémentaires !
              </p>
              <Link 
                href="/signIn"
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 underline"
              >
                <span>Se connecter</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      ) : codeActuel ? (
        // Code promo appliqué
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="font-medium text-green-800 text-sm sm:text-base">
                Code appliqué: {codeActuel}
              </div>
              <div className="text-xs sm:text-sm text-green-600">
                Réduction code promo appliquée
              </div>
            </div>
            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      ) : (
        // Formulaire de saisie (uniquement si connecté)
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full">
          <input
            type="text"
            placeholder="Entrez votre code promo"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base whitespace-nowrap"
          >
            {loading ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              'Appliquer'
            )}
          </button>
        </form>
      )}

      {/* Messages de succès/erreur */}
      {message && (
        <div className={`p-3 rounded-lg w-full ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="text-xs sm:text-sm">{message.text}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodePromoInput;