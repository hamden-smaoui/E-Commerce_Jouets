"use client";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/ui/Footer";

import { 
  CheckCircleIcon,
  EnvelopeIcon,
  CreditCardIcon,
  TruckIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/solid';

const mockCommande = {
  numeroCommande: "CMD-2025-001234",
  dateCommande: "30 Juillet 2025",
  heureCommande: "14:30",
  email: "client@example.com",
  modePaiement: "À la livraison",
  produits: [
    {
      idProduit: 1,
      nom: "SMOBY - PREMIER GARAGE 140202",
      image: "/images/hero1.jpeg",
      prixOriginal: 219.8,
      prixReduit: 131.88,
      quantite: 1,
    },
    {
      idProduit: 2,
      nom: "EDUCA - BABY BODIES 16222",
      image: "/images/hero2.jpeg",
      prixOriginal: 39.7,
      prixReduit: 23.82,
      quantite: 3,
    },
    {
      idProduit: 3,
      nom: "LEGO - CONSTRUCTION SET 12345",
      image: "/images/hero1.jpeg",
      prixOriginal: 159.9,
      prixReduit: 95.94,
      quantite: 2,
    },
  ]
};

export default function CommandeConfirmee() {
  const totalArticles = mockCommande.produits.reduce((sum, item) => sum + item.quantite, 0);
  const sousTotal = mockCommande.produits.reduce(
    (sum, item) => sum + item.quantite * item.prixReduit,
    0
  );
  const livraison = 7.9;
  const totalTTC = (sousTotal + livraison).toFixed(2);

  return (
    <div className="min-h-screen bg-white px-4 py-6">
      {/* Header */}
      <div className="flex justify-center items-center mb-4">
        <h2 className="text-3xl font-serif italic text-purple-500">
          Commande Confirmée
        </h2>
      </div>
      <hr className="mb-6 border-purple-300" />

      {/* Contenu principal centré */}
      <div className="max-w-4xl mx-auto space-y-6 pb-8">
        
        {/* Card de confirmation */}
        <div className="bg-white shadow-md rounded p-6 border-2 border-green-400">
          <div className="text-center mb-6">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Commande Confirmée !
            </h2>
            <p className="text-gray-600">
              Commande N° <span className="font-bold text-purple-600">{mockCommande.numeroCommande}</span>
            </p>
            <p className="text-sm text-gray-500">
              {mockCommande.dateCommande} à {mockCommande.heureCommande}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Colonne gauche */}
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded">
                <EnvelopeIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-800">Email de confirmation</h4>
                  <p className="text-sm text-blue-700">
                    Un email a été envoyé à votre adresse <strong>{mockCommande.email}</strong> avec tous les détails de votre commande.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded">
                <CheckCircleIcon className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-purple-800">Commande enregistrée</h4>
                  <p className="text-sm text-purple-700">
                    Votre commande à <strong>Toy Universe</strong> a bien été enregistrée et sera traitée dans les plus brefs délais.
                  </p>
                </div>
              </div>
            </div>

            {/* Colonne droite */}
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded">
                <CreditCardIcon className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-orange-800">Mode de paiement</h4>
                  <p className="text-sm text-orange-700">
                    Vous avez choisi le <strong>{mockCommande.modePaiement}</strong>. Le montant sera à régler lors de la réception de votre commande.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-green-50 rounded">
                <TruckIcon className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-green-800">Expédition</h4>
                  <p className="text-sm text-green-700">
                    Votre commande sera envoyée très prochainement. Vous recevrez un email de suivi avec le numéro de tracking.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Avertissement annulation */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-start gap-3">
              <ClockIcon className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-yellow-800">Délai d'annulation</h4>
                <p className="text-sm text-yellow-700">
                  Vous pouvez annuler votre commande dans un délai de <strong>2 heures</strong> après la confirmation. 
                  Passé ce délai, la commande sera automatiquement préparée pour l'expédition.
                </p>
                <button className="mt-2 flex items-center gap-2 text-red-600 hover:text-red-800 font-medium text-sm transition-colors">
                  <XCircleIcon className="w-4 h-4" />
                  Annuler cette commande
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card des produits commandés */}
        <div className="bg-white shadow-md rounded p-6 border-2 border-black">
          <h2 className="text-xl font-bold mb-4">
            Produits Commandés ({totalArticles} article{totalArticles > 1 ? "s" : ""})
          </h2>
          
          <div className="space-y-4">
            {mockCommande.produits.map((item, index) => (
              <div
                key={item.idProduit}
                className={`flex flex-col sm:flex-row items-center sm:items-start justify-between py-4 gap-4 ${
                  index !== mockCommande.produits.length - 1 ? 'border-b' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={item.image}
                    alt={item.nom}
                    width={100}
                    height={100}
                    className="rounded flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base">{item.nom}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="line-through text-gray-400 text-sm">
                        {item.prixOriginal.toFixed(2)} TND
                      </span>
                      <span className="bg-pink-200 text-pink-800 px-2 py-0.5 text-xs rounded">
                        -40%
                      </span>
                    </div>
                    <div className="text-orange-500 text-lg font-bold">
                      {item.prixReduit.toFixed(2)} TND
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Quantité</p>
                    <p className="font-bold text-lg">{item.quantite}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total</p>
                    <div className="text-lg font-bold text-purple-600">
                      {(item.quantite * item.prixReduit).toFixed(2)} TND
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Récapitulatif des totaux */}
          <div className="mt-6 pt-4 border-t">
            <div className="max-w-sm ml-auto space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Sous-total</span>
                <span>{sousTotal.toFixed(2)} TND</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Livraison</span>
                <span>{livraison.toFixed(2)} TND</span>
              </div>
              <div className="flex justify-between font-bold text-black text-xl border-t pt-2">
                <span>Total TTC</span>
                <span className="text-purple-600">{totalTTC} TND</span>
              </div>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/site" className="bg-purple-600 text-white px-8 py-3 rounded hover:bg-purple-700 font-semibold transition-colors text-center">
            Continuer vos achats
          </Link>
          <Link href="/site/mes-commandes" className="bg-gray-200 text-gray-800 px-8 py-3 rounded hover:bg-gray-300 font-semibold transition-colors text-center">
            Voir mes commandes
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}