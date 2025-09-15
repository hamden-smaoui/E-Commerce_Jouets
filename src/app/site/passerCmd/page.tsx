"use client";
import Image from "next/image";
import Footer from "@/components/ui/Footer";
import Link from 'next/link';
import { useState, useEffect, useMemo } from "react";
import { 
  ShieldCheckIcon, 
  TruckIcon, 
  ArrowUturnLeftIcon,
  ArrowLeftIcon,
  BanknotesIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/solid';
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import CommandesService from "@/services/commandes-service";
import { CartPromotionProvider, useCartPromotionContext } from '@/contexts/CartPromotionContext';
import CartItemPromotion from '@/components/ui/CartItemPromotion';
import CodePromoInput from "@/components/layout/CodePromo";
import KidsCornerLoader from '@/components/ui/KidsCornerLoader';
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

// Composant pour afficher le total par item
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
          <div className="text-base font-bold text-gray-900">
            {(itemData.final * quantite).toFixed(2)} <span className="text-xs">TND</span>
          </div>
        </div>
      ) : (
        <span className="text-base font-bold text-gray-900">
          {(itemData.original * quantite).toFixed(2)} <span className="text-xs">TND</span>
        </span>
      )}
    </div>
  );
};

function Checkout() {
  const { cartItems, totalPrice, loading: cartLoading, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [codePromo, setCodePromo] = useState<{ code: string; promotion: any } | null>(null);

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

  // Remplir le formulaire avec les données utilisateur si connecté
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        clientPrenom: user.prenom || '',
        clientNom: user.nom || '',
        clientEmail: user.email || '',
        clientTelephone: user.telephone || '',
        clientAdresseRue: user.adresseRue || '',
        clientAdresseVille: user.adresseVille || '',
        clientAdresseCodePostal: user.adresseCodePostal || '',
        clientAdressePays: user.adressePays || 'Tunisie',
      }));
      console.log("User data pre-filled in form:", user);
    }
    setMounted(true);
  }, [user, isAuthenticated]);

  // Rediriger si le panier est vide
  useEffect(() => {
    if (mounted && !cartLoading && cartItems.length === 0 && !loading) {
      router.push('/site/cart');
    }
  }, [mounted, cartLoading, cartItems.length, router, loading]);

  const totalArticles = cartItems.reduce((sum, item) => sum + item.quantite, 0);

  // Calculer les totaux avec les promotions des produits
  const { totalOriginal, totalFinal, totalSavings } = getTotals();

  // Appliquer le code promo sur le total final des produits
  const totalPriceWithPromotions = useMemo(() => {
    if (!mounted) return 0;
    
    let total = totalFinal;

    if (codePromo?.promotion) {
      const { typePromotion, valeurPromotion } = codePromo.promotion;
      const valeur = typeof valeurPromotion === 'string' ? parseFloat(valeurPromotion) : valeurPromotion;
      
      if (typePromotion === 'pourcentage' || typePromotion === 'POURCENTAGE') {
        total *= (1 - valeur / 100);
      } else if (typePromotion === 'montant_fixe' || typePromotion === 'FIXE') {
        total = Math.max(0, total - valeur);
      }
    }

    return total;
  }, [mounted, totalFinal, codePromo]);

  const livraison = useMemo(() => {
    return totalPriceWithPromotions >= 100 ? 0 : 7.9;
  }, [totalPriceWithPromotions]);

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
  };

  const validateForm = (): boolean => {
    const requiredFields = [
      'clientPrenom', 'clientNom', 'clientTelephone',
      'clientAdresseRue', 'clientAdresseVille', 'clientAdresseCodePostal'
    ];
    
    for (const field of requiredFields) {
      if (!formData[field as keyof FormData].trim()) {
        alert(`Le champ ${field.replace('client', '').replace('Adresse', '')} est requis`);
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const lignesCommandes = cartItems.map(item => ({
        idProduit: item.idProduit,
        quantite: item.quantite,
        prixUnitaire: item.produit.prix,
        sousTotal: item.quantite * item.produit.prix
      }));

      const montantOriginal = lignesCommandes.reduce((sum, ligne) => sum + ligne.sousTotal, 0);

      const commandeData = {
        ...formData,
        idClient: isAuthenticated ? user?.idUtilisateur : null,
        montantTotal: montantOriginal,
        statut: 'en attente' as const,
        lignesCommandes,
        codePromo: codePromo?.code || null,
        fraisLivraison: livraison
      };

      const nouvelleCommande = await CommandesService.createCommande(commandeData);
      
      router.push(`/site/confirmCmd/${nouvelleCommande.idCommande}`);
      
    } catch (error: any) {
      console.error('Erreur complète:', error);
      let errorMessage = 'Une erreur est survenue lors de la création de votre commande.';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      alert(`Erreur: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeApplique = (promotionData: { code: string; promotion: any }) => {
    setCodePromo(promotionData);
  };

  const handleCodeSupprime = () => {
    setCodePromo(null);
  };


  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <KidsCornerLoader 
          message="Chargement des produits..."
          size="lg"
          showMessage={true}
        />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return null; // Le useEffect va rediriger
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
       <div className="flex items-center justify-between mb-8 w-full">
  <div className="flex items-center gap-2 sm:gap-3">
    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
      <ShoppingCartIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
    </div>
    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
      Finaliser la Commande
    </h1>
  </div>
</div>

        {/* Grid responsive */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Colonne gauche : Formulaire de commande */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="p-6 bg-gray-50 border-b">
                <h2 className="text-xl font-bold text-gray-900">Informations personnelles</h2>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Informations personnelles */}
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                        <input
                          type="text"
                          name="clientPrenom"
                          value={formData.clientPrenom}
                          onChange={handleInputChange}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                        <input
                          type="text"
                          name="clientNom"
                          value={formData.clientNom}
                          onChange={handleInputChange}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          name="clientEmail"
                          value={formData.clientEmail}
                          onChange={handleInputChange}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                        <input
                          type="tel"
                          name="clientTelephone"
                          value={formData.clientTelephone}
                          onChange={handleInputChange}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Adresse de livraison */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Adresse de livraison</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Adresse complète *</label>
                        <input
                          type="text"
                          name="clientAdresseRue"
                          value={formData.clientAdresseRue}
                          onChange={handleInputChange}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          placeholder="Rue, numéro, appartement..."
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                          <input
                            type="text"
                            name="clientAdresseVille"
                            value={formData.clientAdresseVille}
                            onChange={handleInputChange}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Code postal *</label>
                          <input
                            type="text"
                            name="clientAdresseCodePostal"
                            value={formData.clientAdresseCodePostal}
                            onChange={handleInputChange}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pays *</label>
                        <select
                          name="clientAdressePays"
                          value={formData.clientAdressePays}
                          onChange={handleInputChange}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          required
                        >
                          <option value="Tunisie">Tunisie</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Mode de paiement */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Mode de paiement</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <BanknotesIcon className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Paiement à la livraison</p>
                          <p className="text-sm text-gray-600">Payez en espèces lors de la réception de votre commande</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes additionnelles */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Notes de livraison</h3>
                    <textarea
                      name="notesLivraison"
                      value={formData.notesLivraison}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      rows={3}
                      placeholder="Instructions de livraison, commentaires..."
                    />
                  </div>
                </form>
              </div>
            </div>

            {/* Bouton Retour au panier */}
            <div className="mt-6">
              <Link href="/site/cart" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors font-medium">
                <ArrowLeftIcon className="w-5 h-5" />
                Retour au panier
              </Link>
            </div>
          </div>

          {/* Colonne droite : Résumé panier avec promotions */}
          <div className="xl:col-span-1">
            <div className="sticky top-6 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border overflow-hidden min-w-[350px] md:min-w-[400px]">
                <div className="p-6 bg-gray-50 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Résumé de la commande</h2>
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                      {totalArticles} article{totalArticles > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <div className={`p-4 ${cartItems.length > 4 ? 'max-h-[300px] overflow-y-auto' : ''}`}>
                  {cartItems.map((item, index) => {
                    const imageUrl = item.produit.images && item.produit.images.length > 0
                      ? `http://localhost:3001${item.produit.images.sort((a:any, b:any) => a.rang - b.rang)[0].url}`
                      : '/images/placeholder.jpg';

                    return (
                      <div
                        key={item.idProduit}
                        className={`flex items-start gap-3 py-3 border-b border-gray-100 last:border-b-0 ${
                          index !== 0 ? 'border-t-0' : ''
                        }`}
                      >
                        <Image
                          src={imageUrl}
                          alt={item.produit.nom}
                          width={60}
                          height={60}
                          className="rounded-lg object-cover border"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 line-clamp-2 mb-1">{item.produit.nom}</p>
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
                <div className="p-6 border-t border-gray-100">
                  <div className="space-y-4 text-sm">
                    {totalSavings > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Prix original</span>
                        <span className="line-through">{totalOriginal.toFixed(2)} <span className="text-xs">TND</span></span>
                      </div>
                    )}
                    {totalSavings > 0 && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Promotions produits</span>
                        <span>-{totalSavings.toFixed(2)} <span className="text-xs">TND</span></span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Sous-total</span>
                      <span className="font-medium">{totalFinal.toFixed(2)} <span className="text-xs">TND</span></span>
                    </div>
                    {codePromo && totalEconomiesCodePromo > 0 && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Code promo ({codePromo.code})</span>
                        <span>-{totalEconomiesCodePromo.toFixed(2)} <span className="text-xs">TND</span></span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Livraison</span>
                      <span className={`font-medium ${livraison === 0 ? "text-green-600" : ""}`}>
                        {livraison === 0 ? "Gratuite" : `${livraison.toFixed(2)} TND`}
                      </span>
                    </div>
                    {totalPriceWithPromotions < 100 && totalPriceWithPromotions > 0 && (
                      <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded-lg">
                        Plus que {(100 - totalPriceWithPromotions).toFixed(2)} <span className="text-xs">TND</span> pour la livraison gratuite !
                      </div>
                    )}
                    <div className="border-t pt-4">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total TTC</span>
                        <span className="text-purple-600">{totalTTC.toFixed(2)} <span className="text-xs">TND</span></span>
                      </div>
                    </div>
                    {totalEconomiesGlobal > 0 && (
                      <div className="text-center text-green-600 font-medium bg-green-50 p-3 rounded-lg">
                        Vous économisez {totalEconomiesGlobal.toFixed(2)} <span className="text-xs">TND</span> au total !
                      </div>
                    )}
                  </div>
                  <div className="mt-6">
                    <CodePromoInput
                      montantPanier={totalFinal}
                      idUtilisateur={isAuthenticated ? user?.idUtilisateur : undefined}
                      onCodeApplique={handleCodeApplique}
                      onCodeSupprime={handleCodeSupprime}
                      codeActuel={codePromo?.code}
                    />
                  </div>
                  <button 
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 font-semibold transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-6"
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

              {/* Section des garanties */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h4 className="font-bold text-gray-900 mb-4">Nos garanties</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Paiement sécurisé</div>
                      <div className="text-sm text-gray-600">SSL et cryptage des données</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <TruckIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Livraison rapide</div>
                      <div className="text-sm text-gray-600">24-48h en Tunisie</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <ArrowUturnLeftIcon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Retour gratuit</div>
                      <div className="text-sm text-gray-600">14 jours satisfait ou remboursé</div>
                    </div>
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

// Wrapper avec le Provider comme dans Cart
const CheckoutWithProvider = () => {
  return (
    <CartPromotionProvider>
      <Checkout />
    </CartPromotionProvider>
  );
};
export default CheckoutWithProvider;