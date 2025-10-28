"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { EnvelopeIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import newsletterService from '../../services/newsletter-service';

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');
  
  const [email, setEmail] = useState(emailParam || "");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'notfound' | 'error'>('idle');
  const [message, setMessage] = useState("");

  // Si l'email vient de l'URL, désinscription automatique
  useEffect(() => {
    if (emailParam) {
      handleUnsubscribe(emailParam);
    }
  }, [emailParam]);

  const handleUnsubscribe = async (emailToUnsubscribe?: string) => {
    const targetEmail = emailToUnsubscribe || email;
    
    if (!targetEmail.trim()) {
      setMessage("L'email est requis");
      setStatus('error');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(targetEmail)) {
      setMessage("Format d'email invalide");
      setStatus('error');
      return;
    }

    setLoading(true);
    setMessage("");
    
    try {
      await newsletterService.unsubscribe(targetEmail);
      setStatus('success');
      setMessage("Vous avez été désinscrit avec succès de notre newsletter");
    } catch (error: any) {
      if (error.response?.status === 404) {
        setStatus('notfound');
        setMessage("Cet email n'est pas inscrit à notre newsletter");
      } else {
        setStatus('error');
        setMessage(error.response?.data?.message || "Une erreur s'est produite. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleUnsubscribe();
  };

  // État de chargement initial (quand email vient de l'URL)
  if (emailParam && loading && status === 'idle') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Image src="/images/logoBamby.png" alt="Bamby Joy Logo" width={120} height={120} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Désinscription</h2>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Désinscription en cours...</p>
          </div>
        </div>
      </div>
    );
  }

  // État de succès
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Image src="/images/logoBamby.png" alt="Bamby Joy Logo" width={120} height={120} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Désinscription réussie</h2>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircleIcon className="w-10 h-10 text-green-600" />
              </div>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">
                Nous sommes tristes de vous voir partir ! 😢
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Vous pouvez vous réinscrire à tout moment sur notre site.
              </p>
            </div>

            <Link 
              href="" 
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold transition-colors inline-block text-center"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // État email non trouvé
  if (status === 'notfound') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Image src="/images/logoBamby.png" alt="Bamby Joy Logo" width={120} height={120} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Email non trouvé</h2>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <EnvelopeIcon className="w-10 h-10 text-yellow-600" />
              </div>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">
                Peut-être êtes-vous déjà désinscrit ?
              </p>
            </div>

            <div className="space-y-3">
              <Link 
                href="" 
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold transition-colors inline-block text-center"
              >
                Retour à l'accueil
              </Link>
              
              <button
                onClick={() => {setStatus('idle'); setEmail(""); setMessage("");}}
                className="w-full text-purple-600 hover:text-purple-800 text-sm font-medium py-2"
              >
                Essayer avec un autre email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Formulaire de désinscription manuelle
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Image src="/images/logoBamby.png" alt="Bamby Joy Logo" width={120} height={120} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Se désabonner</h2>
          <p className="text-gray-600">
            Entrez votre email pour vous désabonner de notre newsletter
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {status === 'error' && message && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-start">
                <XCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{message}</span>
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
                    setMessage("");
                    setStatus('idle');
                  }}
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    status === 'error' ? "border-red-500" : "border-gray-300"
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
              {loading ? "Désinscription en cours..." : "Se désabonner"}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Vous ne recevrez plus nos emails après cette action.
            </p>
          </form>
        </div>

        <div className="text-center">
          <Link href="" className="text-purple-600 hover:text-purple-800 font-medium">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}