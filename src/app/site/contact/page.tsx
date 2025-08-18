"use client";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/ui/Footer";
import { useState } from "react";
import { 
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  PaperAirplaneIcon,
  UserIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/solid';

export default function Contact() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    sujet: '',
    message: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }

    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Le téléphone est requis';
    }

    if (!formData.sujet.trim()) {
      newErrors.sujet = 'Le sujet est requis';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Le message est requis';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Le message doit contenir au moins 10 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Ici vous pouvez traiter l'envoi du message
      console.log('Message envoyé:', formData);
      setIsSubmitted(true);
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          nom: '',
          prenom: '',
          email: '',
          telephone: '',
          sujet: '',
          message: ''
        });
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6">
      {/* Header */}
      <div className="flex justify-center items-center mb-4">
        <h2 className="text-3xl font-serif italic text-purple-500">
          Contactez-nous
        </h2>
      </div>
      <hr className="mb-6 border-purple-300" />

      {/* Grid responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
        
        {/* Colonne gauche : Formulaire de contact */}
        <div className="lg:col-span-2 space-y-4">
          {/* Card du formulaire */}
          <div className="bg-white shadow-md rounded p-6 h-[600px] flex flex-col border-2 border-black">
            <h2 className="text-xl font-bold mb-4 flex-shrink-0">ENVOYEZ-NOUS UN MESSAGE</h2>
            
            {/* Message de succès */}
            {isSubmitted && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <PaperAirplaneIcon className="w-5 h-5 text-green-600" />
                  <p className="text-green-800 font-medium">
                    Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.
                  </p>
                </div>
              </div>
            )}
            
            {/* Container avec scroll pour le formulaire */}
            <div className="flex-1 overflow-y-auto pr-2">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nom et Prénom */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nom *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="nom"
                        value={formData.nom}
                        onChange={handleInputChange}
                        className={`w-full pl-9 pr-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          errors.nom ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Votre nom"
                      />
                    </div>
                    {errors.nom && (
                      <p className="mt-1 text-xs text-red-600">{errors.nom}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Prénom *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleInputChange}
                        className={`w-full pl-9 pr-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          errors.prenom ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Votre prénom"
                      />
                    </div>
                    {errors.prenom && (
                      <p className="mt-1 text-xs text-red-600">{errors.prenom}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-9 pr-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="votre.email@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-sm font-medium mb-1">Téléphone *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PhoneIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      className={`w-full pl-9 pr-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.telephone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="12 345 678"
                    />
                  </div>
                  {errors.telephone && (
                    <p className="mt-1 text-xs text-red-600">{errors.telephone}</p>
                  )}
                </div>

                {/* Sujet */}
                <div>
                  <label className="block text-sm font-medium mb-1">Sujet *</label>
                  <select
                    name="sujet"
                    value={formData.sujet}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.sujet ? 'border-red-500' : 'border-gray-300'
                    }`}
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
                  <label className="block text-sm font-medium mb-1">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                      errors.message ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Décrivez votre demande en détail..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-red-600">{errors.message}</p>
                  )}
                </div>

                {/* Bouton d'envoi */}
                <button
                  type="submit"
                  disabled={isSubmitted}
                  className="w-full bg-purple-600 text-white py-3 rounded hover:bg-purple-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                  {isSubmitted ? 'Message envoyé !' : 'Envoyer le message'}
                </button>
              </form>
            </div>
          </div>

          {/* Bouton Retour */}
          <Link href="/site" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline transition-colors">
            ← Retour à l'accueil
          </Link>
        </div>

        {/* Colonne droite : Informations de contact */}
        {/* Colonne droite : Informations de contact */}
<div className="space-y-4">
  {/* Card des coordonnées - hauteur flexible */}
  <div className="bg-gray-50 shadow-md rounded p-6">
    <h2 className="text-lg font-bold mb-4">
      NOS COORDONNÉES
    </h2>
    
    <div className="space-y-6">
      {/* Informations de contact */}
      <div className="space-y-4">
        

        <div className="flex items-start gap-3">
          <PhoneIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-semibold text-gray-800">Téléphone</h4>
            <p className="text-sm text-gray-600">
              +216 71 123 456<br />
              +216 98 765 432
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <EnvelopeIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-semibold text-gray-800">Email</h4>
            <p className="text-sm text-gray-600">
              contact@toyuniverse.tn<br />
              support@toyuniverse.tn
            </p>
          </div>
        </div>

        
      </div>
    </div>
  </div>

  {/* Card FAQ rapide - séparée */}
  <div className="bg-white shadow-md rounded p-4">
    <h3 className="font-bold mb-3 flex items-center gap-2">
      <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-500" />
      Questions fréquentes
    </h3>
    <div className="space-y-3 text-sm">
      <div>
        <p className="font-medium text-gray-800">Délai de livraison ?</p>
        <p className="text-gray-600">2-5 jours ouvrables en Tunisie</p>
      </div>
      <div>
        <p className="font-medium text-gray-800">Retours possibles ?</p>
        <p className="text-gray-600">14 jours pour échanger/retourner</p>
      </div>
      <div>
        <p className="font-medium text-gray-800">Paiement sécurisé ?</p>
        <p className="text-gray-600">Carte bancaire ou à la livraison</p>
      </div>
      <Link href="/site/faq" className="text-purple-600 hover:text-purple-800 font-medium">
        Voir toutes les FAQ →
      </Link>
    </div>
  </div>
</div>
      </div>

      <Footer />
    </div>
  );
}