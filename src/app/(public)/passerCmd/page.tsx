"use client";
import Image from "next/image";
import Footer from "@/components/ui/Footer";
import Link from 'next/link';
import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import { User } from "@/services/users-service";
import UsersService from "@/services/users-service";
import { 
  ArrowLeftIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/solid';
import { useCart } from "@/hooks/useCart";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CommandesService from "@/services/commandes-service";
import { CommandeFormData } from "@/services/commandes-service";
import { CartPromotionProvider, useCartPromotionContext } from '@/contexts/CartPromotionContext';
import CartItemPromotion from '@/components/ui/CartItemPromotion';
import CodePromoInput from "@/components/layout/CodePromo";
import KidsCornerLoader from '@/components/ui/KidsCornerLoader';
import { Suspense } from "react";

interface FormData {
  clientPrenom: string;
  clientNom: string;
  clientEmail: string;
  clientTelephone: string;
  clientAdresseRue: string;
  clientAdresseVille: string;
  clientAdresseCodePostal: string;
  clientAdressePays: string;
  notesLivraison: string;
}

interface FormErrors {
  [key: string]: boolean;
}

const CheckoutItemTotalDisplay = ({ idProduit, quantite }: { idProduit: number, quantite: number }) => {
  const { itemTotals } = useCartPromotionContext();
  const itemData = itemTotals[idProduit];
  
  if (!itemData) {
    return <div className="text-base font-bold min-w-[80px] text-right text-gray-500">-</div>;
  }
  
  const hasPromotion = itemData.final < itemData.original;
  
  return (
    <div className="text-right min-w-[80px]">
      {hasPromotion ? (
        <div>
          <div className="text-base font-bold text-pink-600">
            {(itemData.final * quantite).toFixed(2)} <span className="text-xs">TND</span>
          </div>
        </div>
      ) : (
        <span className="text-base font-bold text-pink-600">
          {(itemData.original * quantite).toFixed(2)} <span className="text-xs">TND</span>
        </span>
      )}
    </div>
  );
};

function Checkout() {
  const { cartItems, totalPrice, loading: cartLoading, clearCart } = useCart();
  const { data: session, status } = useSession();
  const user = session?.userData;
  const isAuthenticated = status === "authenticated";
  const [fullUser, setFullUser] = useState<User | null>(null);
  const token = session?.customToken;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [codePromo, setCodePromo] = useState<{ code: string; valeurPourcentage: number } | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const { storeInfo, loading: storeLoading } = useStoreInfo();
  const { getTotals, clearTotals, itemTotals } = useCartPromotionContext();

  const [formData, setFormData] = useState<FormData>({
    clientPrenom: '',
    clientNom: '',
    clientEmail: '',
    clientTelephone: '',
    clientAdresseRue: '',
    clientAdresseVille: '',
    clientAdresseCodePostal: '',
    clientAdressePays: 'Tunisie',
    notesLivraison: ''
  });

  // Récupérer les infos complètes de l'utilisateur si connecté
  useEffect(() => {
    async function fetchFullUser() {
      if (isAuthenticated && user?.idUtilisateur) {
        try {
          const fetchedUser = await UsersService.getUserById(user.idUtilisateur, token);
          setFullUser(fetchedUser);
        } catch (err) {
          setFullUser(null);
        }
      }
    }
    fetchFullUser();
    setMounted(true);
  }, [user, isAuthenticated, token]);

  // Pré-remplir le formulaire si utilisateur connecté
  useEffect(() => {
    if (isAuthenticated && fullUser) {
      setFormData(prev => ({
        ...prev,
        clientPrenom: fullUser.prenom || '',
        clientNom: fullUser.nom || '',
        clientEmail: fullUser.email || '',
        clientTelephone: fullUser.telephone || '',
        clientAdresseRue: fullUser.adresseRue || '',
        clientAdresseVille: fullUser.adresseVille || '',
        clientAdresseCodePostal: fullUser.adresseCodePostal || '',
        clientAdressePays: fullUser.adressePays || 'Tunisie',
      }));
    }
  }, [fullUser, isAuthenticated]);

  // Rediriger vers le panier si vide
  useEffect(() => {
    if (mounted && !cartLoading && cartItems.length === 0 && !loading) {
      router.push('/cart');
    }
  }, [mounted, cartLoading, cartItems.length, router, loading]);

  const totalArticles = cartItems.reduce((sum, item) => sum + item.quantite, 0);

  const { totalOriginal, totalFinal, totalSavings } = getTotals();

  const totalPriceWithPromotions = useMemo(() => {
    if (!mounted) return 0;
    let total = totalFinal;
    if (codePromo?.valeurPourcentage) {
      total *= (1 - codePromo.valeurPourcentage / 100);
    }
    return total;
  }, [mounted, totalFinal, codePromo]);

  const fraisLivraison = storeInfo?.fraisLivraison ?? 7;
  const seuilLivraisonGratuite = storeInfo?.seuilLivraisonGratuite ?? 100;

 const tousProduitsLivraisonGratuite = useMemo(() => {
    return cartItems.length > 0 && cartItems.every(
      item => item.produit.livraisonGratuite === true
    );
  }, [cartItems]);

  // ✅ Calcul de la livraison avec la nouvelle logique
  const livraison = useMemo(() => {
    
    if (tousProduitsLivraisonGratuite || totalPriceWithPromotions >= seuilLivraisonGratuite) {
      return 0;
    }
    return fraisLivraison;
  }, [tousProduitsLivraisonGratuite, totalPriceWithPromotions, seuilLivraisonGratuite, fraisLivraison]);

  const totalTTC = useMemo(() => {
    return totalPriceWithPromotions + livraison;
  }, [totalPriceWithPromotions, livraison]);

  const totalEconomiesCodePromo = totalFinal - totalPriceWithPromotions;
  const totalEconomiesGlobal = totalOriginal - totalPriceWithPromotions;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (value.trim() && errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };

  const validateForm = (): boolean => {
    const requiredFields = [
      { key: 'clientPrenom', label: 'Prénom' },
      { key: 'clientNom', label: 'Nom' },
      { key: 'clientTelephone', label: 'Téléphone' },
      { key: 'clientAdresseRue', label: 'Adresse' },
      { key: 'clientAdresseVille', label: 'Ville' },
      { key: 'clientAdresseCodePostal', label: 'Code postal' }
    ];

    const newErrors: FormErrors = {};
    const missingFields: string[] = [];

    for (const field of requiredFields) {
      if (!formData[field.key as keyof FormData].trim()) {
        newErrors[field.key] = true;
        missingFields.push(field.label);
      }
    }

    if (formData.clientEmail && !isValidEmail(formData.clientEmail)) {
      newErrors.clientEmail = true;
      toast.error("L'adresse email n'est pas valide");
      setErrors(newErrors);
      return false;
    }

    if (formData.clientTelephone && !isValidPhone(formData.clientTelephone)) {
      newErrors.clientTelephone = true;
      toast.error("Le numéro de téléphone n'est pas valide");
      setErrors(newErrors);
      return false;
    }

    if (missingFields.length > 0) {
      setErrors(newErrors);
      toast.error(`Veuillez remplir les champs obligatoires: ${missingFields.join(', ')}`);
      return false;
    }

    setErrors({});
    return true;
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateField = (name: any, value: any) => {
    switch (name) {
      case 'clientPrenom':
      case 'clientNom':
        return value.trim().length < 2;
      case 'clientTelephone':
        return value.trim().length < 6;
      case 'clientEmail':
        return value && !isValidEmail(value);
      case 'clientAdresseRue':
        return value.trim().length < 4;
      case 'clientAdresseVille':
        return value.trim().length < 2;
      case 'clientAdresseCodePostal':
        return value.trim().length < 2;
      case 'notesLivraison':
        return value.length > 300;
      default:
        return false;
    }
  };

  const handleBlur = (e: any) => {
    const { name, value } = e.target;
    setErrors(prev => ({
      ...prev,
      [name]: validateField(name, value)
    }));
  };

  const formatVariation = (variation: any) => {
    if (!variation) return '';
    const { couleur, taille, age } = variation;
    const parts = [];
    if (couleur) parts.push(couleur.nom);
    if (taille) parts.push(taille.nom);
    if (age) parts.push(age.label);
    return parts.length > 0 ? parts.join(' / ') : '';
  };

  const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^[0-9\s\-\+\(\)]{8,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  // 🆕 MODIFICATION PRINCIPALE : Gérer les deux cas (connecté/non-connecté)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (cartItems.some(item => !item.idProduitVariation)) {
      toast.error("Merci de choisir la couleur/taille pour tous les produits du panier.");
      return;
    }
    
    setLoading(true);
    const toastId = toast.loading('Création de votre commande en cours...');
    let success = false;
    
    try {
      const lignesCommandes = cartItems.map(item => ({
        idProduit: item.idProduit,
        idProduitVariation: item.idProduitVariation as number,
        quantite: item.quantite,
        prixUnitaire: item.produit.prix,
        sousTotal: item.quantite * item.produit.prix
      }));

      const montantOriginal = lignesCommandes.reduce((sum, ligne) => sum + ligne.sousTotal, 0);

      const commandeData: CommandeFormData & { codePromo?: string; fraisLivraison?: number; } = {
        ...formData,
        idClient: isAuthenticated ? user?.idUtilisateur : null, // null si non connecté
        montantTotal: montantOriginal,
        statut: 'en attente' as const,
        lignesCommandes,
        codePromo: codePromo?.code,
        fraisLivraison: livraison
      };
      console.log("commmm",commandeData);
      // 🆕 Utiliser la méthode unifiée qui gère les deux cas
      const response = await CommandesService.createCommandeUnified(
        commandeData,
        token // undefined si non connecté
      );

      toast.success('Commande créée avec succès!', {
        id: toastId,
        duration: 4000
      });

      const commandeId = response.data.idCommande;
      success = true;

      // 🆕 Redirection selon le type de commande
      if ('guestToken' in response.data && response.data.guestToken) {
        // Commande guest (non connecté)
        router.push(`/order-confirmation-guest/${commandeId}?token=${response.data.guestToken}`);
      } else {
        // Commande authentifiée (connecté)
        router.push(`/confirmCmd/${commandeId}`);
      }
      
      return;
    } catch (error: any) {
      let errorMessage = 'Une erreur est survenue lors de la création de votre commande.';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, {
        id: toastId,
        duration: 6000
      });
    } finally {
      if (!success) setLoading(false);
    }
  };

  const getInputClassName = (fieldName: string) => {
    const baseClass = "w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 text-sm transition-colors";
    const errorClass = errors[fieldName] 
      ? "border-red-500 focus:ring-red-500 bg-red-50" 
      : "border-gray-200 focus:ring-pink-500";
    return `${baseClass} ${errorClass}`;
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <KidsCornerLoader 
          message="Création de votre commande..."
          size="lg"
          showMessage={true}
        />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-white font-[Comic_Sans_MS,sans-serif]">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 w-full">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 shadow">
              <ShoppingCartIcon className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-purple-600 drop-shadow-lg font-[Comic_Sans_MS,sans-serif]">
              Finaliser la Commande
            </h1>
          </div>
        </div>

        {/* 🆕 Message pour utilisateurs non connectés */}
        {!isAuthenticated && (
          <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-blue-800 mb-1">Commande sans compte</h3>
                <p className="text-sm text-blue-700">
                  Vous commandez en tant qu'invité. Vous recevrez un lien pour suivre votre commande.
                  <Link href="/login" className="ml-2 underline font-semibold hover:text-blue-900">
                    Se connecter
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Grid responsive */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Colonne gauche : Formulaire de commande */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl border-2 border-pink-200 overflow-hidden">
              <div className="p-6 bg-pink-50 border-b-2 border-pink-100">
                <h2 className="text-xl font-extrabold text-pink-600">Informations personnelles</h2>
                <p className="text-sm text-gray-600 mt-1">Les champs marqués d'un * sont obligatoires</p>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  {/* Informations personnelles */}
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prénom *
                          {errors.clientPrenom && <span className="text-red-500 ml-1">- Au moins 2 caractères</span>}
                        </label>
                        <input
                          type="text"
                          name="clientPrenom"
                          value={formData.clientPrenom}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={getInputClassName('clientPrenom')}
                          maxLength={50}
                        />
                        {errors.clientPrenom && (
                          <p className="text-red-500 text-xs mt-1">Le prénom doit contenir au moins 2 caractères.</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom *
                          {errors.clientNom && <span className="text-red-500 ml-1">- Au moins 2 caractères</span>}
                        </label>
                        <input
                          type="text"
                          name="clientNom"
                          value={formData.clientNom}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={getInputClassName('clientNom')}
                          maxLength={50}
                        />
                        {errors.clientNom && (
                          <p className="text-red-500 text-xs mt-1">Le nom doit contenir au moins 2 caractères.</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email {!isAuthenticated && "(optionnel)"}
                          {errors.clientEmail && <span className="text-red-500 ml-1">- Format invalide</span>}
                        </label>
                        <input
                          type="email"
                          name="clientEmail"
                          value={formData.clientEmail}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={getInputClassName('clientEmail')}
                          maxLength={80}
                          placeholder={!isAuthenticated ? "votre@email.com (optionnel)" : ""}
                        />
                        {errors.clientEmail && (
                          <p className="text-red-500 text-xs mt-1">Format d'email invalide.</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Téléphone *
                          {errors.clientTelephone && <span className="text-red-500 ml-1">- Au moins 6 chiffres</span>}
                        </label>
                        <input
                          type="tel"
                          name="clientTelephone"
                          value={formData.clientTelephone}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={getInputClassName('clientTelephone')}
                          maxLength={20}
                        />
                        {errors.clientTelephone && (
                          <p className="text-red-500 text-xs mt-1">Le téléphone doit contenir au moins 6 chiffres.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Adresse de livraison */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-pink-600">Adresse de livraison</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Adresse complète *
                          {errors.clientAdresseRue && <span className="text-red-500 ml-1">- Au moins 4 caractères</span>}
                        </label>
                        <input
                          type="text"
                          name="clientAdresseRue"
                          value={formData.clientAdresseRue}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={getInputClassName('clientAdresseRue')}
                          placeholder="Rue, numéro, appartement..."
                          maxLength={100}
                        />
                        {errors.clientAdresseRue && (
                          <p className="text-red-500 text-xs mt-1">L'adresse doit contenir au moins 4 caractères.</p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ville *
                            {errors.clientAdresseVille && <span className="text-red-500 ml-1">- Au moins 2 caractères</span>}
                          </label>
                          <input
                            type="text"
                            name="clientAdresseVille"
                            value={formData.clientAdresseVille}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={getInputClassName('clientAdresseVille')}
                            maxLength={50}
                          />
                          {errors.clientAdresseVille && (
                            <p className="text-red-500 text-xs mt-1">La ville doit contenir au moins 2 caractères.</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Code postal *
                            {errors.clientAdresseCodePostal && <span className="text-red-500 ml-1">- Au moins 2 caractères</span>}
                          </label>
                          <input
                            type="text"
                            name="clientAdresseCodePostal"
                            value={formData.clientAdresseCodePostal}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={getInputClassName('clientAdresseCodePostal')}
                            maxLength={12}
                          />
                          {errors.clientAdresseCodePostal && (
                            <p className="text-red-500 text-xs mt-1">Le code postal doit contenir au moins 2 caractères.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes additionnelles */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-pink-600">Notes de livraison</h3>
                    <textarea
                      name="notesLivraison"
                      value={formData.notesLivraison}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={getInputClassName('notesLivraison')}
                      rows={3}
                      placeholder="Instructions de livraison, commentaires..."
                      maxLength={300}
                    />
                    {errors.notesLivraison && (
                      <p className="text-red-500 text-xs mt-1">Trop long ou invalide.</p>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Retour au panier (desktop only) */}
            <div className="mt-6 hidden xl:block">
              <Link href="/cart" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors font-extrabold font-[Comic_Sans_MS,sans-serif]">
                <ArrowLeftIcon className="w-5 h-5" />
                Retour au panier
              </Link>
            </div>
          </div>

          {/* Colonne droite : Résumé panier avec promotions */}
          <div className="xl:col-span-1">
            <div className="sticky top-6 space-y-6">
              <div className="bg-white rounded-2xl shadow-xl border-2 border-pink-200 overflow-hidden min-w-[350px] md:min-w-[400px]">
                <div className="p-6 bg-pink-50 border-b-2 border-pink-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-extrabold text-pink-600">Résumé de la commande</h2>
                    <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm font-medium">
                      {totalArticles} article{totalArticles > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <div className={`p-4 ${cartItems.length > 4 ? 'max-h-[300px] overflow-y-auto' : ''}`}>
                  {cartItems.map((item, index) => {
                    const imageUrl = item.produit.images && item.produit.images.length > 0
                      ? `${item.produit.images.sort((a: any, b: any) => a.rang - b.rang)[0].url}`
                      : '/images/placeholder.jpg';
                    return (
                      <div
                        key={`${item.idProduit}-${item.idProduitVariation || 'no-var'}`}
                        className={`flex items-start gap-3 py-3 border-b border-pink-50 last:border-b-0 ${
                          index !== 0 ? 'border-t-0' : ''
                        }`}
                      >
                        <Image
                          src={imageUrl}
                          alt={item.produit.nom}
                          width={60}
                          height={60}
                          className="rounded-lg object-cover border border-pink-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-pink-600 line-clamp-2 mb-1">{item.produit.nom}</p>
                          {item.variation && (
                            <div className="mb-2 space-y-1 text-xs">
                              {formatVariation(item.variation) && (
                                <div className="flex items-center gap-1 italic text-gray-600">
                                  {formatVariation(item.variation)}
                                </div>
                              )}
                            </div>
                          )}
                          <CartItemPromotion
                            idProduit={item.idProduit}
                            prixOriginal={item.produit.prix}
                            quantite={item.quantite}
                          />
                          <p className="text-xs text-gray-500 mt-1">Qté: {item.quantite}</p>
                        </div>
                        <CheckoutItemTotalDisplay 
                          idProduit={item.idProduit}
                          quantite={item.quantite}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="p-6 border-t-2 border-pink-100">
                  <div className="space-y-4 text-base">
                    {totalSavings > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Prix original</span>
                        <span className="line-through">{totalOriginal.toFixed(2)} <span className="text-xs">TND</span></span>
                      </div>
                    )}
                    {totalSavings > 0 && (
                      <div className="flex justify-between text-pink-500 font-bold">
                        <span>Promotions produits</span>
                        <span>-{totalSavings.toFixed(2)} <span className="text-xs">TND</span></span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Sous-total</span>
                      <span className="font-bold">{totalFinal.toFixed(2)} <span className="text-xs">TND</span></span>
                    </div>
                    {codePromo && totalEconomiesCodePromo > 0 && (
                      <div className="flex justify-between text-pink-500 font-bold">
                        <span>Code promo ({codePromo.code})</span>
                        <span>-{totalEconomiesCodePromo.toFixed(2)} <span className="text-xs">TND</span></span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Livraison</span>
                      <span className={`font-bold ${livraison === 0 ? "text-pink-600" : ""}`}>
                        {livraison === 0 ? "Gratuite" : `${livraison.toFixed(2)} TND`}
                      </span>
                    </div>
                    {totalPriceWithPromotions < 100 && totalPriceWithPromotions > 0 && (
                      <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded-lg">
                        Plus que {(100 - totalPriceWithPromotions).toFixed(2)} <span className="text-xs">TND</span> pour la livraison gratuite !
                      </div>
                    )}
                    <div className="border-t pt-4">
                      <div className="flex justify-between font-extrabold text-lg">
                        <span>Total TTC</span>
                        <span className="text-pink-600">{totalTTC.toFixed(2)} <span className="text-xs">TND</span></span>
                      </div>
                    </div>
                    {totalEconomiesGlobal > 0 && (
                      <div className="text-center text-pink-600 font-bold bg-pink-50 p-3 rounded-lg">
                        Vous économisez {totalEconomiesGlobal.toFixed(2)} <span className="text-xs">TND</span> au total !
                      </div>
                    )}
                  </div>
                  <div className="mt-6">
                    <CodePromoInput
                      montantPanier={totalFinal}
                      idUtilisateur={isAuthenticated ? user?.idUtilisateur : undefined}
                      onCodeApplique={({ code, valeurPourcentage }) => {
                        setCodePromo({ code, valeurPourcentage });
                        toast.success(`Code promo "${code}" appliqué avec succès!`);
                      }}
                      onCodeSupprime={() => {
                        setCodePromo(null);
                        toast.success('Code promo supprimé');
                      }}
                      codeActuel={codePromo?.code}
                    />
                  </div>
                  <button 
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-pink-500 text-white py-4 rounded-xl hover:from-pink-500 hover:to-blue-500 font-extrabold transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                        Traitement...
                      </div>
                    ) : (
                      `Confirmer la commande`
                    )}
                  </button>
                </div>
              </div>

              {/* Retour au panier (mobile only) */}
              <div className="mt-4 xl:hidden">
                <Link href="/cart" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors font-extrabold font-[Comic_Sans_MS,sans-serif]">
                  <ArrowLeftIcon className="w-5 h-5" />
                  Retour au panier
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

const CheckoutWithProvider = () => {
  return (
    <CartPromotionProvider>
      <Suspense fallback={
        <KidsCornerLoader
          message="Chargement..."
          size="lg"
          showMessage={true}
        />
      }>
        <Checkout />
      </Suspense>
    </CartPromotionProvider>
  );
};

export default CheckoutWithProvider;