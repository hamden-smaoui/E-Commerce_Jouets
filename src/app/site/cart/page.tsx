"use client";
import React from "react";
import Image from "next/image";
import Footer from "@/components/ui/Footer";
import Link from 'next/link';
import { useCart } from "@/hooks/useCart";
import { CartPromotionProvider, useCartPromotionContext } from '@/contexts/CartPromotionContext';
import CartItemPromotion from '@/components/ui/CartItemPromotion';
import KidsCornerLoader from "@/components/ui/KidsCornerLoader";
import { 
  TrashIcon, 
  ShieldCheckIcon, 
  TruckIcon, 
  ArrowUturnLeftIcon,
  ArrowLeftIcon,
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
  XMarkIcon
} from '@heroicons/react/24/solid';
import { useState } from "react";

const CartItemWithPromotion = ({ item, index, onIncrement, onDecrement, onQuantityChange, onRemove }: any) => {
  const imageUrl = item.produit.images && item.produit.images.length > 0
    ? `http://localhost:3001${item.produit.images.sort((a:any, b:any) => a.rang - b.rang)[0].url}`
    : '/images/placeholder.jpg';

  return (
    <div className={`flex flex-col sm:flex-row items-start justify-between p-4 gap-4 bg-white rounded-xl hover:shadow-lg transition-shadow border-b-2 border-pink-50 ${
      index !== 0 ? 'border-t-0 rounded-t-none' : ''
    }`}>
      <div className="flex items-start gap-4 flex-1">
        <div className="relative">
          <Image
            src={imageUrl}
            alt={item.produit.nom}
            width={80}
            height={80}
            className="rounded-lg object-cover border-2 border-pink-100"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-pink-600 text-sm sm:text-base line-clamp-2 mb-2 font-[Comic_Sans_MS,sans-serif]">
            {item.produit.nom}
          </h3>
          
          <CartItemPromotion
            idProduit={item.idProduit}
            prixOriginal={item.produit.prix}
            quantite={item.quantite}
          />
          
          <div className="flex items-center gap-2 text-xs mt-2">
            <span className={`px-2 py-1 rounded-full text-xs font-bold font-[Comic_Sans_MS,sans-serif] ${
              item.produit.quantiteStock > 10 
                ? 'bg-green-100 text-green-700'
                : item.produit.quantiteStock > 0
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-red-100 text-red-700'
            }`}>
              {item.produit.quantiteStock > 10 
                ? 'En stock'
                : item.produit.quantiteStock > 0
                  ? `Stock limité`
                  : 'Rupture'
              }
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        {/* Sélecteur de quantité */}
        <div className="flex items-center gap-1 bg-pink-50 rounded-lg p-1">
          <button
            onClick={() => onDecrement(item.idProduit, item.quantite)}
            disabled={item.quantite <= 1}
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold"
          >
            <MinusIcon className="w-4 h-4 text-pink-600" />
          </button>
          <input
            type="number"
            value={item.quantite}
            onChange={(e) => onQuantityChange(item.idProduit, e)}
            className="w-12 h-8 text-center border-0 bg-transparent focus:outline-none focus:ring-0 text-sm font-medium"
            min="1"
            max={item.produit.quantiteStock}
          />
          <button
            onClick={() => onIncrement(item.idProduit, item.quantite, item.produit.quantiteStock)}
            disabled={item.quantite >= item.produit.quantiteStock}
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold"
          >
            <PlusIcon className="w-4 h-4 text-pink-600" />
          </button>
        </div>

        <CartItemTotalDisplay 
          idProduit={item.idProduit}
          quantite={item.quantite}
        />
        
        <button
          onClick={() => onRemove(item.idProduit)}
          className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
          title="Supprimer"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const CartItemTotalDisplay = ({ idProduit, quantite }: { idProduit: number, quantite: number }) => {
  const { itemTotals } = useCartPromotionContext();
  const itemData = itemTotals[idProduit];

  if (!itemData) {
    return <div className="text-lg font-bold min-w-[100px] text-right text-gray-500">-</div>;
  }

  const hasPromotion = itemData.final < itemData.original;

  return (
    <div className="text-right min-w-[100px]">
      {hasPromotion ? (
        <div>
          <div className="text-lg font-extrabold text-pink-600 font-[Comic_Sans_MS,sans-serif]">
            {(itemData.final * quantite).toFixed(2)} <span className="text-xs">TND</span>
          </div>
          <div className="text-xs text-gray-400 line-through">
            {(itemData.original * quantite).toFixed(2)} <span className="text-xs">TND</span>
          </div>
        </div>
      ) : (
        <span className="text-lg font-extrabold text-gray-900 font-[Comic_Sans_MS,sans-serif]">
          {(itemData.original * quantite).toFixed(2)} <span className="text-xs text-gray-600">TND</span>
        </span>
      )}
    </div>
  );
};

function Cart() {
  const { 
    cartItems, 
    totalItems, 
    loading, 
    updateQuantity, 
    removeFromCart,
    clearCart 
  } = useCart();
  
  const [mounted, setMounted] = useState(false);

  const { getTotals, clearTotals, itemTotals, removeItemTotal } = useCartPromotionContext();

  React.useEffect(() => {
    const currentProductIds = cartItems.map(item => item.idProduit);
    const contextProductIds = Object.keys(itemTotals).map(id => parseInt(id));
    const toRemove = contextProductIds.filter(id => !currentProductIds.includes(id));
    if (toRemove.length > 0) {
      toRemove.forEach(id => removeItemTotal(id));
    }
    setMounted(true);
  }, [cartItems, itemTotals, removeItemTotal]);

  const { totalOriginal, totalFinal, totalSavings } = getTotals();
  const livraison = totalFinal >= 100 ? 0 : 7.9;
  const totalTTC = totalFinal + livraison;

  const handleIncrement = async (idProduit: number, currentQuantity: number, stock: number) => {
    if (currentQuantity < stock) {
      try {
        await updateQuantity(idProduit, currentQuantity + 1);
      } catch (error) {}
    }
  };

  const handleDecrement = async (idProduit: number, currentQuantity: number) => {
    if (currentQuantity > 1) {
      try {
        await updateQuantity(idProduit, currentQuantity - 1);
      } catch (error) {}
    }
  };

  const handleQuantityChange = async (idProduit: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) return;
    try {
      await updateQuantity(idProduit, value);
    } catch (error) {}
  };

  const handleRemove = async (idProduit: number) => {
    try {
      await removeFromCart(idProduit);
      removeItemTotal(idProduit);
    } catch (error) {}
  };

  const handleClearCart = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
      try {
        await clearCart();
      } catch (error) {}
    }
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <KidsCornerLoader 
          message="Chargement du panier..."
          size="lg"
          showMessage={true}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-yellow-50 to-blue-50 font-[Comic_Sans_MS,sans-serif]">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 w-full">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-200 rounded-full flex items-center justify-center flex-shrink-0 shadow">
              <ShoppingCartIcon className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-pink-600 drop-shadow-lg font-[Comic_Sans_MS,sans-serif]">
              Votre Panier
            </h1>
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="flex items-center gap-1 sm:gap-2 text-red-500 hover:text-red-700 transition-colors px-3 py-1 sm:px-4 sm:py-2 rounded-lg hover:bg-red-50 text-sm sm:text-base font-bold"
            >
              <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Vider</span>
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCartIcon className="h-12 w-12 text-pink-400" />
              </div>
              <h3 className="text-2xl font-extrabold text-pink-600 drop-shadow-lg mb-3 font-[Comic_Sans_MS,sans-serif]">Votre panier est vide</h3>
              <p className="text-gray-600 mb-8">Découvrez notre sélection de produits et commencez vos achats</p>
              <Link href="/site">
                <button className="bg-gradient-to-r from-pink-400 to-blue-400 text-white px-8 py-3 rounded-xl hover:from-pink-500 hover:to-blue-500 transition-all transform hover:scale-105 font-bold shadow-lg">
                  Découvrir nos produits
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Liste des produits */}
            <div className="xl:col-span-3">
              <div className="bg-white rounded-2xl shadow-xl border-2 border-pink-200 overflow-hidden">
                <div className="p-6 bg-pink-50 border-b-2 border-pink-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-extrabold text-pink-600 font-[Comic_Sans_MS,sans-serif]">Articles dans votre panier</h3>
                  </div>
                </div>
                <div className={`divide-y divide-pink-50 ${cartItems.length > 4 ? 'max-h-[400px] overflow-y-auto' : ''}`}>
                  {cartItems.map((item, index) => (
                    <CartItemWithPromotion
                      key={item.idProduit}
                      item={item}
                      index={index}
                      onIncrement={handleIncrement}
                      onDecrement={handleDecrement}
                      onQuantityChange={handleQuantityChange}
                      onRemove={handleRemove}
                    />
                  ))}
                </div>
              </div>
              {/* Continuer vos achats */}
              <div className="mt-6">
                <Link href="/site" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors font-extrabold font-[Comic_Sans_MS,sans-serif]">
                  <ArrowLeftIcon className="w-5 h-5" />
                  Continuer vos achats
                </Link>
              </div>
            </div>

            {/* Résumé de la commande */}
            <div className="xl:col-span-1">
              <div className="sticky top-6 space-y-6">
                {/* Résumé des prix */}
                <div className="bg-white rounded-2xl shadow-xl border-2 border-pink-200 p-6">
                  <h4 className="text-xl font-extrabold text-pink-600 mb-6 font-[Comic_Sans_MS,sans-serif]">Résumé</h4>
                  <div className="space-y-4 text-base">
                    {totalSavings > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Prix original</span>
                        <span className="line-through">{totalOriginal.toFixed(2)} <span className="text-xs">TND</span></span>
                      </div>
                    )}
                    {totalSavings > 0 && (
                      <div className="flex justify-between text-green-600 font-bold">
                        <span>Promotions</span>
                        <span>-{totalSavings.toFixed(2)} <span className="text-xs">TND</span></span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Sous-total</span>
                      <span className="font-bold">{totalFinal.toFixed(2)} <span className="text-xs">TND</span></span>
                    </div>
                    <div className="flex justify-between">
                      <span>Livraison</span>
                      <span className={`font-bold ${livraison === 0 ? "text-green-600" : ""}`}>
                        {livraison === 0 ? "Gratuite" : (<>{livraison.toFixed(2)} <span className="text-xs">TND</span></>)}
                      </span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between font-extrabold text-lg">
                        <span>Total TTC</span>
                        <span className="text-purple-600">{totalTTC.toFixed(2)} <span className="text-xs">TND</span></span>
                      </div>
                    </div>
                    {totalSavings > 0 && (
                      <div className="text-center text-green-600 font-bold bg-green-50 p-3 rounded-lg">
                        Vous économisez {totalSavings.toFixed(2)} <span className="text-xs">TND</span> !
                      </div>
                    )}
                  </div>
                  <Link href="/site/passerCmd" className="block mt-6">
                    <button className="w-full bg-gradient-to-r from-pink-400 to-blue-400 text-white py-4 rounded-xl hover:from-pink-500 hover:to-blue-500 font-extrabold transition-all transform hover:scale-105 shadow">
                      Finaliser la commande
                    </button>
                  </Link>
                </div>

                {/* Garanties */}
                <div className="bg-white rounded-2xl shadow-xl border-2 border-pink-200 p-6">
                  <h4 className="font-extrabold text-pink-600 mb-4 font-[Comic_Sans_MS,sans-serif]">Nos garanties</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">Paiement sécurisé</div>
                        <div className="text-sm text-gray-600">SSL et cryptage des données</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <TruckIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">Livraison rapide</div>
                        <div className="text-sm text-gray-600">24-48h en Tunisie</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <ArrowUturnLeftIcon className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">Retour gratuit</div>
                        <div className="text-sm text-gray-600">14 jours satisfait ou remboursé</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

const CartWithProvider = () => {
  return (
    <CartPromotionProvider>
      <Cart />
    </CartPromotionProvider>
  );
};

export default CartWithProvider;