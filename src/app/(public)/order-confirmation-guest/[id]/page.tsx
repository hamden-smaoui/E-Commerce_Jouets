"use client";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/ui/Footer";
import CountdownTimer from "@/components/ui/CountdownTimer";
import ConfirmCancelOrderModal from "@/components/layout/ConfirmCancelOrderModal";
import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import CommandesService from "@/services/commandes-service";
import { toast } from "react-hot-toast";
import type { CommandeResponse } from "@/services/commandes-service";
import KidsCornerLoader from "@/components/ui/KidsCornerLoader";
import { Suspense } from "react";
import {
  CheckCircleIcon,
  ShoppingBagIcon,
  TruckIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/solid';

const CommandeItemTotalDisplay = ({ 
  prixUnitaire, 
  prixOriginal, 
  quantite 
}: { 
  prixUnitaire: number; 
  prixOriginal: number; 
  quantite: number;
}) => {
  const hasPromotion = prixUnitaire < prixOriginal;
  return (
    <div className="text-right min-w-[100px]">
      {hasPromotion ? (
        <div>
          <div className="text-lg font-bold text-pink-600">
            {(prixUnitaire * quantite).toFixed(2)} <span className="text-xs">TND</span>
          </div>
          <div className="text-xs text-gray-400 line-through">
            {(prixOriginal * quantite).toFixed(2)} <span className="text-xs">TND</span>
          </div>
        </div>
      ) : (
        <span className="text-lg font-bold text-pink-600">
          {(prixUnitaire * quantite).toFixed(2)} <span className="text-xs">TND</span>
        </span>
      )}
    </div>
  );
};

const CommandeItem = ({ ligne, index }: { ligne: any; index: number }) => {
  const imageUrl = ligne.produit?.images && ligne.produit.images.length > 0
    ? `${ligne.produit.images.sort((a: any, b: any) => a.rang - b.rang)[0].url}`
    : '/images/placeholder.jpg';
    
  const formatVariation = (variation: any) => {
    if (!variation) return '';
    const { couleur, taille, age } = variation;
    const parts = [];
    if (couleur) parts.push(couleur.nom);
    if (taille) parts.push(taille.nom);
    if (age) parts.push(age.label);
    return parts.length > 0 ? parts.join(' / ') : '';
  };
  
  return (
    <div className={`flex flex-col sm:flex-row items-start justify-between p-4 gap-4 bg-white rounded-lg hover:shadow-md transition-shadow ${
      index !== 0 ? 'border-t-0 rounded-t-none' : ''
    }`}>
      <div className="flex items-start gap-4 flex-1">
        <div className="relative">
          <Image
            src={imageUrl}
            alt={ligne.produit?.nom || 'Produit'}
            width={80}
            height={80}
            className="rounded-lg object-cover border border-pink-100"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-pink-600 text-sm sm:text-base line-clamp-2 mb-2">
            {ligne.produit?.nom}
          </h3>
          {ligne.variation && (
            <div className="mb-2 text-xs italic text-gray-600">
              {formatVariation(ligne.variation)}
            </div>
          )}
          <div className="text-sm text-gray-600">
            Prix unitaire: {ligne.prixUnitaire.toFixed(2)} TND
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="text-center">
          <p className="text-xs sm:text-sm text-gray-600">Quantité</p>
          <p className="font-bold text-base sm:text-lg">{ligne.quantite}</p>
        </div>
        <CommandeItemTotalDisplay
          prixUnitaire={ligne.prixUnitaire}
          prixOriginal={ligne.produit?.prix || ligne.prixUnitaire}
          quantite={ligne.quantite}
        />
      </div>
    </div>
  );
};

function GuestOrderConfirmation() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const id = params?.id as string;
  const guestToken = searchParams?.get('token');
  
  const [commande, setCommande] = useState<CommandeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [canCancel, setCanCancel] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Calcul de la date limite d'annulation (2 heures après la commande)
  const getCancellationDeadline = (dateCommande: string) => {
    const commandeDate = new Date(dateCommande);
    return new Date(commandeDate.getTime() + 2 * 60 * 60 * 1000);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !id || !guestToken) return;
    
    const fetchCommande = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Call API to get order with guest token
        const commandeData = await CommandesService.getCommandeByIdGuest(parseInt(id), guestToken);
        
        setCommande(commandeData);

        // Vérifier si la commande peut encore être annulée
        const deadline = getCancellationDeadline(commandeData.dateCommande);
        const now = new Date();
        setCanCancel(now < deadline && commandeData.statut === 'en attente');
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement de la commande');
        toast.error('Erreur lors du chargement de la commande');
      } finally {
        setLoading(false);
      }
    };

    fetchCommande();
  }, [mounted, id, guestToken]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Handlers pour le modal d'annulation
  const handleOpenCancelModal = () => {
    setShowCancelModal(true);
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
  };

  const handleConfirmCancel = async () => {
    if (!commande || !guestToken) return;

    try {
      setCancelling(true);
      
      // Appel API pour annuler la commande en tant qu'invité
      await CommandesService.cancelCommandeGuest(commande.idCommande, guestToken);
      
      toast.success('Commande annulée avec succès');
      
      // Mettre à jour l'état local
      setCommande({
        ...commande,
        statut: 'annulée'
      });
      
      setCanCancel(false);
      setShowCancelModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'annulation de la commande');
    } finally {
      setCancelling(false);
    }
  };

  const handleTimerExpired = () => {
    setCanCancel(false);
    toast.error('Le délai d\'annulation est expiré');
  };

  if (!mounted || loading || !id || !guestToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-yellow-50 to-blue-50">
        <KidsCornerLoader
          message="Chargement de votre commande..."
          size="lg"
          showMessage={true}
        />
      </div>
    );
  }

  if (error || !commande) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-yellow-50 to-blue-50 flex items-center justify-center font-[Comic_Sans_MS,sans-serif]">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-red-200 p-8 max-w-md text-center">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-red-600 mb-4">Erreur</h2>
          <p className="text-gray-600 mb-6">
            {error || 'Commande introuvable ou lien invalide'}
          </p>
          <Link href="/products">
            <button className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 font-bold transition-colors">
              Retour à la boutique
            </button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const dateCommande = new Date(commande.dateCommande);
  const orderNumber = `${String(commande.idCommande).padStart(6, '0')}`;
  const cancellationDeadline = getCancellationDeadline(commande.dateCommande);
  
  const totalArticles = commande.lignesCommandes?.reduce((sum, ligne) => sum + ligne.quantite, 0) || 0;
  
  const totalTTC = commande.montantTotal;
  const fraisLivraison = commande.fraisLivraison || 0;
  const totalTTCWithoutLivraison = totalTTC - fraisLivraison;

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'en attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmée':
        return 'bg-blue-100 text-blue-800';
      case 'en préparation':
        return 'bg-purple-100 text-purple-800';
      case 'expédiée':
        return 'bg-indigo-100 text-indigo-800';
      case 'livrée':
        return 'bg-green-100 text-green-800';
      case 'annulée':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (statut: string) => {
    switch (statut) {
      case 'en attente':
        return 'En attente de confirmation';
      case 'confirmée':
        return 'Confirmée';
      case 'en préparation':
        return 'En préparation';
      case 'expédiée':
        return 'Expédiée';
      case 'livrée':
        return 'Livrée';
      case 'annulée':
        return 'Annulée';
      default:
        return statut;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-yellow-50 to-blue-50 font-[Comic_Sans_MS,sans-serif]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-green-200 p-6 sm:p-8 text-center">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
            commande.statut === 'annulée' ? 'bg-red-100' : 'bg-green-100'
          }`}>
            {commande.statut === 'annulée' ? (
              <XCircleIcon className="w-12 h-12 text-red-600" />
            ) : (
              <CheckCircleIcon className="w-12 h-12 text-green-600" />
            )}
          </div>
          
          <h1 className={`text-2xl sm:text-3xl font-extrabold mb-2 ${
            commande.statut === 'annulée' ? 'text-red-600' : 'text-green-600'
          }`}>
            {commande.statut === 'annulée' ? 'Commande Annulée !' : 'Commande Confirmée !'}
          </h1>
          
          <p className="text-gray-600 text-sm sm:text-base mb-2">
            Commande N° <span className="font-bold text-purple-600">{orderNumber}</span>
          </p>
          
          <p className="text-xs sm:text-sm text-gray-500">
            {dateCommande.toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })} à {dateCommande.toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          
          <div className="mt-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(commande.statut)}`}>
              {getStatusText(commande.statut)}
            </span>
          </div>

          {/* Guest Info Notice */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              📧 <strong>Important :</strong> Sauvegardez ce lien pour suivre votre commande. 
            </p>
          </div>

          {/* Countdown Timer et bouton d'annulation 
          {commande.statut !== 'annulée' && (
            <div className="mt-6">
              <CountdownTimer
                endTime={cancellationDeadline}
                onExpired={handleTimerExpired}
              />
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 mt-3">
                <div className="flex justify-center items-center w-full">
                  {canCancel ? (
                    <button
                      onClick={handleOpenCancelModal}
                      disabled={cancelling}
                      className="flex items-center gap-2 bg-red-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-red-700 font-medium text-xs sm:text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                    >
                      {cancelling ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      ) : (
                        <XCircleIcon className="w-4 h-4" />
                      )}
                      {cancelling ? 'Annulation...' : 'Annuler cette commande'}
                    </button>
                  ) : (
                    <div className="text-gray-600 font-medium text-xs sm:text-sm flex items-center gap-1 justify-center">
                      <XCircleIcon className="w-4 h-4" />
                      Délai d'annulation expiré
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}*/}
        </div>

        {/* Order Success Message */}
        {commande.statut !== 'annulée' && (
          <div className="bg-white rounded-2xl shadow-xl border-2 border-pink-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <TruckIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-purple-800 text-lg mb-2">
                  Votre commande a été enregistrée
                </h3>
                <p className="text-gray-600 text-sm">
                  Nous allons préparer votre commande et vous contacter pour confirmer la livraison. 
                  Vous serez informé par téléphone au <strong>{commande.clientTelephone}</strong>.
                </p>
                <div className="mt-4 bg-purple-50 rounded-lg p-3">
                  <p className="text-sm text-purple-700 font-medium">
                    💳 Paiement à la livraison - Vous payez lors de la réception de votre colis
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Card */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-pink-200 overflow-hidden">
          <div className="p-6 bg-pink-50 border-b-2 border-pink-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-extrabold text-pink-600">
                Produits commandés
              </h2>
              <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm font-medium">
                {totalArticles} article{totalArticles > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className={`divide-y divide-pink-50 ${totalArticles > 4 ? 'max-h-[400px] overflow-y-auto' : ''}`}>
            {commande.lignesCommandes?.map((ligne, index) => (
              <CommandeItem
                key={ligne.idLigneCommande}
                ligne={ligne}
                index={index}
              />
            ))}
          </div>
          
          <div className="p-6 border-t-2 border-pink-100">
            <div className="max-w-full sm:max-w-sm ml-auto space-y-2">
              <div className="flex justify-between text-gray-700 text-sm sm:text-base">
                <span>Sous-total</span>
                <span>{totalTTCWithoutLivraison.toFixed(2)} <span className="text-xs">TND</span></span>
              </div>
              
              <div className="flex justify-between text-gray-700 text-sm sm:text-base">
                <span>Livraison</span>
                <span className={fraisLivraison === 0 ? "text-green-600 font-medium" : ""}>
                  {fraisLivraison === 0 ? "Gratuite" : (
                    <>
                      {fraisLivraison.toFixed(2)} <span className="text-xs">TND</span>
                    </>
                  )}
                </span>
              </div>
              
              {(commande.reductionCodePromo || 0) > 0 && commande.codePromoGlobal && (
                <div className="flex justify-between text-pink-500 text-sm sm:text-base">
                  <span>Code promo <span className="font-mono bg-pink-100 px-2 rounded ml-2">{commande.codePromoGlobal}</span></span>
                  <span>-{commande.reductionCodePromo?.toFixed(2)} <span className="text-xs">TND</span></span>
                </div>
              )}
              
              <div className="flex justify-between font-extrabold text-black text-lg sm:text-xl border-t pt-2">
                <span>Total TTC</span>
                <span className="text-pink-600">{totalTTC.toFixed(2)} <span className="text-xs">TND</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Information */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-pink-200 p-6">
          <h2 className="text-lg sm:text-xl font-extrabold text-pink-600 mb-4">
            Informations de livraison
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">Destinataire</h3>
              <div className="space-y-1 text-sm sm:text-base">
                <p className="text-gray-600 font-medium">{commande.clientPrenom} {commande.clientNom}</p>
                <p className="text-gray-600">{commande.clientTelephone}</p>
                {commande.clientEmail && (
                  <p className="text-gray-600 break-all">{commande.clientEmail}</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">Adresse de livraison</h3>
              <div className="space-y-1 text-sm sm:text-base">
                <p className="text-gray-600">{commande.clientAdresseRue}</p>
                <p className="text-gray-600">{commande.clientAdresseCodePostal} {commande.clientAdresseVille}</p>
                <p className="text-gray-600">{commande.clientAdressePays}</p>
              </div>
            </div>
          </div>
          
          {commande.notesLivraison && (
            <div className="mt-4 pt-4 border-t border-pink-100">
              <h3 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">Notes de livraison</h3>
              <p className="text-gray-600 bg-gray-50 p-3 rounded text-sm sm:text-base">
                {commande.notesLivraison}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/products"
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-3 rounded-lg hover:from-pink-600 hover:to-purple-600 font-extrabold transition-all transform hover:scale-105 shadow-lg text-center"
          >
            Continuer vos achats
          </Link>
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-pink-200 p-6">
          <h3 className="font-extrabold text-pink-600 mb-4 text-lg">Besoin d'aide ?</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Pour toute question concernant votre commande, contactez-nous</p>
            <p>• Gardez ce lien pour suivre l'état de votre commande</p>
            <p>• Vous serez contacté par téléphone pour la livraison</p>
            {/*<p>• Vous avez 2 heures pour annuler votre commande après sa création</p> */}
          </div>
        </div>
      </div>

      {/* Modal de confirmation d'annulation */}
      <ConfirmCancelOrderModal
        isOpen={showCancelModal}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancel}
        orderNumber={orderNumber}
        isLoading={cancelling}
      />

      <Footer />
    </div>
  );
}

export default function GuestOrderConfirmationWithSuspense() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-yellow-50 to-blue-50">
        <KidsCornerLoader
          message="Chargement..."
          size="lg"
          showMessage={true}
        />
      </div>
    }>
      <GuestOrderConfirmation />
    </Suspense>
  );
}