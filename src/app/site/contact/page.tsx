"use client";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/ui/Footer";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import ReclamationService, { ReclamationFormData } from "@/services/reclamations-service";
import KidsCornerLoader from '@/components/ui/KidsCornerLoader';
import { toast } from "react-hot-toast";
import { 
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  PaperAirplaneIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  ArrowLeftIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/solid';

// Type for form fields
type ContactFormFields = {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  sujet: string;
  message: string;
};

export default function Contact() {
  const { data: session, status } = useSession();
  const user = session?.userData;
  const token = session?.customToken;
  const isAuthenticated = status === "authenticated";
  const { storeInfo } = useStoreInfo();

  // Loader de page
  const [pageLoading, setPageLoading] = useState(true);

  const [formData, setFormData] = useState<ContactFormFields>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    sujet: '',
    message: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormFields, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Loader initial page
  useEffect(() => {
    setPageLoading(true);
    const timer = setTimeout(() => setPageLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        telephone: user.telephone || ''
      }));
    }
  }, [isAuthenticated, user]);

  // Validation per field for instant UX
  const validateField = (name: keyof ContactFormFields, value: string) => {
    switch (name) {
      case 'nom':
      case 'prenom':
        return value.trim().length < 2 ? 'Ce champ doit contenir au moins 2 caractères.' : '';
      case 'email':
        return !value.trim()
          ? "L'email est requis"
          : !/\S+@\S+\.\S+/.test(value)
          ? "Format d'email invalide"
          : '';
      case 'telephone':
        return value.trim().length < 6 ? 'Le téléphone doit contenir au moins 6 chiffres.' : '';
      case 'sujet':
        return !value.trim() ? 'Le sujet est requis.' : '';
      case 'message':
        return !value.trim()
          ? 'Le message est requis.'
          : value.trim().length < 10
          ? 'Le message doit contenir au moins 10 caractères.'
          : '';
      default:
        return '';
    }
  };

  // Validate single field on blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setErrors(prev => ({
      ...prev,
      [name as keyof ContactFormFields]: validateField(name as keyof ContactFormFields, value)
    }));
  };

  // Clear error if user fixes the field
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as keyof ContactFormFields]: value
    }));
    if (errors[name as keyof ContactFormFields]) {
      setErrors(prev => ({
        ...prev,
        [name as keyof ContactFormFields]: ''
      }));
    }
  };

  // Validate all fields before submit
  const validateForm = () => {
    const fields: (keyof ContactFormFields)[] = Object.keys(formData) as (keyof ContactFormFields)[];
    const newErrors: Partial<Record<keyof ContactFormFields, string>> = {};
    for (const field of fields) {
      const errorMsg = validateField(field, formData[field]);
      if (errorMsg) newErrors[field] = errorMsg;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }
    setIsSubmitting(true);

    try {
      const reclamationData: ReclamationFormData = {
        sujet: formData.sujet,
        message: formData.message,
      };
      if (isAuthenticated && user) {
        reclamationData.idUtilisateur = user.idUtilisateur;
      } else {
        reclamationData.nom = formData.nom;
        reclamationData.prenom = formData.prenom;
        reclamationData.email = formData.email;
        reclamationData.telephone = formData.telephone;
      }
      await ReclamationService.createReclamation(reclamationData, token);
      setIsSubmitted(true);
      toast.success("Message envoyé avec succès !");
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          sujet: '',
          message: ''
        }));
        setIsSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      toast.error(message);
      setErrors({});
    } finally {
      setIsSubmitting(false);
    }
  };

  // Affiche le loader uniquement lors du chargement de la page
  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <KidsCornerLoader message="Chargement de la page contact..." size="lg" showMessage={true} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 w-full">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <ChatBubbleLeftRightIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                Contactez-nous
              </h1>
              {isAuthenticated && user && (
                <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
                  Connecté en tant que {user.prenom} {user.nom}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Grid responsive */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Colonne gauche : Formulaire de contact */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="p-6 bg-gray-50 border-b">
                <h2 className="text-xl font-bold text-gray-900">
                  {isAuthenticated ? 'Envoyez-nous votre réclamation' : 'Envoyez-nous un message'}
                </h2>
              </div>
              <div className="p-6">
                {isSubmitted ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Message envoyé !</h3>
                    <p className="text-gray-600 text-center">
                      Merci pour votre message. Nous vous répondrons dans les plus brefs délais.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    {/* Informations personnelles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Nom */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="nom"
                            value={formData.nom}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-colors ${
                              errors.nom ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-purple-500'
                            }`}
                            placeholder="Votre nom"
                            maxLength={50}
                          />
                        </div>
                        {errors.nom && (
                          <p className="mt-1 text-xs text-red-600">{errors.nom}</p>
                        )}
                      </div>
                      {/* Prénom */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prénom *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="prenom"
                            value={formData.prenom}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-colors ${
                              errors.prenom ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-purple-500'
                            }`}
                            placeholder="Votre prénom"
                            maxLength={50}
                          />
                        </div>
                        {errors.prenom && (
                          <p className="mt-1 text-xs text-red-600">{errors.prenom}</p>
                        )}
                      </div>
                    </div>
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-colors ${
                            errors.email ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-purple-500'
                          }`}
                          placeholder="votre.email@example.com"
                          maxLength={80}
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                      )}
                    </div>
                    {/* Téléphone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <PhoneIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          name="telephone"
                          value={formData.telephone}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-colors ${
                            errors.telephone ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-purple-500'
                          }`}
                          placeholder="12 345 678"
                          maxLength={20}
                        />
                      </div>
                      {errors.telephone && (
                        <p className="mt-1 text-xs text-red-600">{errors.telephone}</p>
                      )}
                    </div>
                    {/* Sujet */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sujet *</label>
                      <select
                        name="sujet"
                        value={formData.sujet}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-colors ${
                          errors.sujet ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-purple-500'
                        }`}
                        required={false}
                      >
                        <option value="">Sélectionnez un sujet</option>
                        <option value="commande">Question sur une commande</option>
                        <option value="produit">Question sur un produit</option>
                        <option value="livraison">Problème de livraison</option>
                        <option value="retour">Retour/Échange</option>
                        <option value="technique">Problème technique</option>
                        <option value="partenariat">Partenariat</option>
                        <option value="autre">Autre</option>
                      </select>
                      {errors.sujet && (
                        <p className="mt-1 text-xs text-red-600">{errors.sujet}</p>
                      )}
                    </div>
                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                      <textarea 
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        rows={6}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm resize-none transition-colors ${
                          errors.message ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-purple-500'
                        }`}
                        placeholder="Décrivez votre demande en détail..."
                        maxLength={1000}
                      />
                      {errors.message && (
                        <p className="mt-1 text-xs text-red-600">{errors.message}</p>
                      )}
                    </div>
                    {/* Bouton d'envoi */}
                   <button
                           type="submit"
                           disabled={isSubmitting || Object.values(errors).some(v => v)}
                           className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 font-semibold transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                         >
                           {isSubmitting ? (
                             <>
                               <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                               </svg>
                               <span>Envoi en cours...</span>
                             </>
                           ) : (
                             <>
                               <PaperAirplaneIcon className="w-5 h-5" />
                               Envoyer le message
                             </>
                           )}
                         </button>
                  </form>
                )}
              </div>
            </div>
            {/* Bouton Retour */}
            <div className="mt-6">
              <Link href="/site" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors font-medium">
                <ArrowLeftIcon className="w-5 h-5" />
                Retour à l'accueil
              </Link>
            </div>
          </div>
          {/* ...right column unchanged... */}
          <div className="xl:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Card des coordonnées */}
              <div className="bg-white rounded-2xl shadow-sm border overflow-hidden min-w-[350px] md:min-w-[400px]">
                <div className="p-6 bg-gray-50 border-b">
                  <h2 className="text-xl font-bold text-gray-900">Nos coordonnées</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <PhoneIcon className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Téléphone</h4>
                        <p className="text-sm text-gray-600">
                          {storeInfo?.telephonePrincipal || '+216 71 123 456'}
                          {storeInfo?.telephoneSecondaire && (
                            <>
                              <br />
                              {storeInfo.telephoneSecondaire}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <EnvelopeIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Email</h4>
                        <p className="text-sm text-gray-600">
                          {storeInfo?.emailPrincipal || 'contact@toyuniverse.tn'}
                          {storeInfo?.emailSecondaire && (
                            <>
                              <br />
                              {storeInfo.emailSecondaire}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPinIcon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Adresse</h4>
                        <p className="text-sm text-gray-600">
                          {storeInfo?.adresse || '123 Rue des Jouets'}
                          <br />
                          {storeInfo?.ville && storeInfo?.codePostal 
                            ? `${storeInfo.ville}, ${storeInfo.codePostal}`
                            : 'Tunis, 1001'
                          }
                          {storeInfo?.pays && (
                            <>
                              <br />
                              {storeInfo.pays}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <ClockIcon className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Heures d'ouverture</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-line">
                          {storeInfo?.heuresOuverture || 'Lun-Sam: 9h-19h\nDim: Fermé'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Card FAQ rapide */}
              <div className="bg-white rounded-2xl shadow-sm border overflow-hidden min-w-[350px] md:min-w-[400px]">
                <div className="p-6 bg-gray-50 border-b">
                  <h2 className="text-xl font-bold text-gray-900">Questions fréquentes</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Délai de livraison ?</p>
                      <p className="text-gray-600 text-xs">2-5 jours ouvrables en Tunisie</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Retours possibles ?</p>
                      <p className="text-gray-600 text-xs">14 jours pour échanger/retourner</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Paiement sécurisé ?</p>
                      <p className="text-gray-600 text-xs">Carte bancaire ou à la livraison</p>
                    </div>
                    <Link href="/site/faq" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium text-sm transition-colors">
                      <QuestionMarkCircleIcon className="w-5 h-5" />
                      Voir toutes les FAQ
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}