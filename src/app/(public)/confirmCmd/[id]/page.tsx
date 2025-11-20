"use client";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/ui/Footer";
import CountdownTimer from "@/components/ui/CountdownTimer";
import CommandeItemPromotion from "@/components/ui/CommandeItemPromotion";
import ConfirmCancelOrderModal from "@/components/layout/ConfirmCancelOrderModal";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import CommandesService from "@/services/commandes-service";
import { useCart } from "@/hooks/useCart";
import { toast } from "react-hot-toast";
import type { CommandeResponse } from "@/services/commandes-service";
import KidsCornerLoader from "@/components/ui/KidsCornerLoader";
import { CartPromotionProvider } from '@/contexts/CartPromotionContext';
import {
  CheckCircleIcon,
  EnvelopeIcon,
  ClockIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/solid';
import { useSession } from "next-auth/react";
import { Suspense } from "react";
// Composant pour le total d'article
const CommandeItemTotalDisplay = ({ idProduit, quantite, prixUnitaire, prixOriginal }: { idProduit: number, quantite: number, prixUnitaire: number, prixOriginal: number }) => {
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

const CommandeItem = ({ ligne, index }: { ligne: any, index: number }) => {
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
          {/* Variation affichée */}
          {ligne.variation && (
            <div className="mb-2 text-xs italic text-gray-600">
              {formatVariation(ligne.variation)}
            </div>
          )}
          <CommandeItemPromotion
            idProduit={ligne.idProduit}
            prixOriginal={ligne.produit?.prix || ligne.prixUnitaire}
            quantite={ligne.quantite}
            prixFacture={ligne.prixUnitaire}
            ligne={ligne}
          />
        </div>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="text-center">
          <p className="text-xs sm:text-sm text-gray-600">Quantité</p>
          <p className="font-bold text-base sm:text-lg">{ligne.quantite}</p>
        </div>
        <CommandeItemTotalDisplay
          idProduit={ligne.idProduit}
          quantite={ligne.quantite}
          prixUnitaire={ligne.prixUnitaire}
          prixOriginal={ligne.produit?.prix || ligne.prixUnitaire}
        />
      </div>
    </div>
  );
};

function CommandeConfirmation() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { clearCartWithoutToast, cartItems } = useCart();
  const [commande, setCommande] = useState<CommandeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [canCancel, setCanCancel] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const { data: session, status } = useSession();
  const token = session?.customToken;
  const userId = session?.userData?.idUtilisateur;

  const getCancellationDeadline = (dateCommande: string) => {
    const commandeDate = new Date(dateCommande);
    return new Date(commandeDate.getTime() + 2 * 60 * 60 * 1000);
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/signIn");
    }
  }, [status, router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !id || !token || !userId) return;
    const fetchCommande = async () => {
      try {
        setLoading(true);
        setError(null);
        const commandeData = await CommandesService.getCommandeById(parseInt(id), token);

        // SECURE: Vérifier que l'utilisateur courant est bien celui qui a fait la commande
        if (commandeData.idClient !== userId) {
          router.replace("/403");
          return;
        }

        setCommande(commandeData);

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
  }, [mounted, id, token, userId]);

  useEffect(() => {
    if (!mounted || !commande) return;

    const clearCartIfNeeded = async () => {
      if (cartItems.length > 0) {
        try {
          await clearCartWithoutToast();
        } catch (error) {
        }
      }
    };

    clearCartIfNeeded();
  }, [mounted, commande, cartItems.length, clearCartWithoutToast]);
useEffect(() => {
  window.scrollTo(0, 0);
}, [id]);
  if (!mounted || loading || !id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <KidsCornerLoader
          message="Chargement de votre commande..."
          size="lg"
          showMessage={true}
        />
      </div>
    );
  }

  if (!commande) {
    return (
      <div className="min-h-screen bg-white px-4 py-6 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <ExclamationTriangleIcon className="w-12 sm:w-16 h-12 sm:h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-orange-600 mb-2">Commande introuvable</h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">La commande demandée n'existe pas ou a été supprimée.</p>
          <Link href="/" className="bg-pink-600 text-white px-4 sm:px-6 py-2 rounded hover:bg-pink-700 text-sm sm:text-base">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const totalArticles = commande.lignesCommandes?.reduce((sum, ligne) => sum + ligne.quantite, 0) || 0;
  const dateCommande = new Date(commande.dateCommande);
  const cancellationDeadline = getCancellationDeadline(commande.dateCommande);
  const orderNumber = `CMD-${commande.idCommande.toString().padStart(6, '0')}`;

  const totalTTC = commande.montantTotal;
  const totalTTCWithoutLivraison = totalTTC - (commande.fraisLivraison || 0);

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'en attente': return 'text-orange-600 bg-orange-100';
      case 'en traitement': return 'text-blue-600 bg-blue-100';
      case 'expédiée': return 'text-purple-600 bg-purple-100';
      case 'livrée': return 'text-green-600 bg-green-100';
      case 'annulée': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (statut: string) => {
    switch (statut) {
      case 'en attente': return 'En attente';
      case 'en traitement': return 'En traitement';
      case 'expédiée': return 'Expédiée';
      case 'livrée': return 'Livrée';
      case 'annulée': return 'Annulée';
      default: return statut;
    }
  };

  const handleOpenCancelModal = () => {
    if (!commande || cancelling || !canCancel) return;
    setShowCancelModal(true);
  };

  const handleCloseCancelModal = () => {
    if (!cancelling) {
      setShowCancelModal(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!commande) return;

    try {
      setCancelling(true);

      toast.loading('Annulation de votre commande en cours...', {
        id: 'cancel-order-toast'
      });

      await CommandesService.updateCommande(commande.idCommande, {
        statut: 'annulée'
      }, token);
      
      const updatedCommande = await CommandesService.getCommandeById(commande.idCommande, token);
      setCommande(updatedCommande);
      setCanCancel(false);
      setShowCancelModal(false);

      toast.dismiss('cancel-order-toast');
      toast.success('Votre commande a été annulée avec succès', {
        duration: 5000,
        position: 'top-center',
      });

    } catch (err: any) {
      toast.dismiss('cancel-order-toast');
      toast.error(`Erreur lors de l'annulation: ${err.message}`, {
        duration: 6000,
        position: 'top-center',
      });
    } finally {
      setCancelling(false);
    }
  };

  const handleTimerExpired = () => {
    setCanCancel(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-white font-[Comic_Sans_MS,sans-serif] px-2 sm:px-4 py-4 sm:py-6">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-8">
        <div className={`bg-white shadow-md rounded-lg p-4 sm:p-6 border-2 ${
          commande.statut === 'annulée' ? 'border-red-400' : 'border-green-400'
        }`}>
          <div className="text-center mb-4 sm:mb-6">
            {commande.statut === 'annulée' ? (
              <XCircleIcon className="w-12 sm:w-16 h-12 sm:h-16 text-red-500 mx-auto mb-4" />
            ) : (
              <CheckCircleIcon className="w-12 sm:w-16 h-12 sm:h-16 text-green-500 mx-auto mb-4" />
            )}
            <h2 className={`text-xl sm:text-2xl font-extrabold mb-2 ${
              commande.statut === 'annulée' ? 'text-red-600' : 'text-green-600'
            }`}>
              {commande.statut === 'annulée' ? 'Commande Annulée !' : 'Commande Confirmée !'}
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
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
              <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(commande.statut)}`}>
                {getStatusText(commande.statut)}
              </span>
            </div>
          </div>

          <div className="grid  gap-4 sm:gap-6">
            
            {commande.statut !== 'annulée' && (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <CheckCircleIcon className="w-5 sm:w-6 h-5 sm:h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-purple-800 text-sm sm:text-base">Commande enregistrée</h4>
                    <p className="text-xs sm:text-sm text-purple-700">
                      Votre commande a bien été enregistrée et sera traitée dans les plus brefs délais.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

        {/*  {commande.statut !== 'annulée' && (
            <div className="mt-4 sm:mt-6">
              <CountdownTimer
                endTime={cancellationDeadline}
                onExpired={handleTimerExpired}
              />
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 mt-3">
                <ClockIcon className="w-5 sm:w-6 h-5 sm:h-6 text-yellow-600 flex-shrink-0 mt-1 hidden" />
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
          )} */}
        </div>

        {/* Card des produits commandés */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-pink-200 overflow-hidden">
          <div className="p-6 bg-pink-50 border-b-2 border-pink-100">
            <h2 className="text-lg sm:text-xl font-extrabold text-pink-600">Produits Commandés</h2>
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
                <span className={commande.fraisLivraison === 0 ? "text-green-600 font-medium" : ""}>
                  {commande.fraisLivraison === 0 ? "Gratuite" : (
                    <>
                      {commande.fraisLivraison} <span className="text-xs">TND</span>
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

        <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 border border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold mb-4 dark:text-gray-700">Informations de livraison</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">Destinataire</h3>
              <div className="space-y-1 text-sm sm:text-base">
                <p className="text-gray-600">{commande.clientPrenom} {commande.clientNom}</p>
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
            <div className="mt-4">
              <h3 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">Notes de livraison</h3>
              <p className="text-gray-600 bg-gray-50 p-3 rounded text-sm sm:text-base">{commande.notesLivraison}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link
            href="/products"
            className="bg-pink-600 text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-pink-700 font-semibold transition-colors text-center text-sm sm:text-base"
          >
            Continuer vos achats
          </Link>
          <Link
            href="/profile?tab=orders"
            className="bg-gray-200 text-gray-800 px-6 sm:px-8 py-3 rounded-lg hover:bg-gray-300 font-semibold transition-colors text-center text-sm sm:text-base"
          >
            Voir mes commandes
          </Link>
        </div>
      </div>

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

export default function CommandeConfirmationWithProvider() {
  return (
    <CartPromotionProvider>
      <Suspense fallback={<KidsCornerLoader
    message="Chargement du votre commande..."
    size="lg"
    showMessage={true}
  />}>
      <CommandeConfirmation />
      </Suspense>
    </CartPromotionProvider>
  );
}