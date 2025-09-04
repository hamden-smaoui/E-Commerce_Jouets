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
import { useState, useMemo } from "react";

const CartItemWithPromotion = ({ item, index, onIncrement, onDecrement, onQuantityChange, onRemove }: any) => {
  const imageUrl = item.produit.images && item.produit.images.length > 0
    ? `http://localhost:3001${item.produit.images.sort((a:any, b:any) => a.rang - b.rang)[0].url}`
    : '/images/placeholder.jpg';

  return (
    <div className={`flex flex-col sm:flex-row items-start justify-between p-4 gap-4 bg-white rounded-lg border hover:shadow-md transition-shadow ${
      index !== 0 ? 'border-t-0 rounded-t-none' : ''
    }`}>
      <div className="flex items-start gap-4 flex-1">
        <div className="relative">
          <Image
            src={imageUrl}
            alt={item.produit.nom}
            width={80}
            height={80}
            className="rounded-lg object-cover border"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2 mb-2">
            {item.produit.nom}
          </h3>
          
          <CartItemPromotion
            idProduit={item.idProduit}
            prixOriginal={item.produit.prix}
            quantite={item.quantite}
          />
          
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
            <span className={`px-2 py-1 rounded-full text-xs ${
              item.produit.quantiteStock > 10 
                ? 'bg-green-100 text-green-700'
                : item.produit.quantiteStock > 0
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-red-100 text-red-700'
            }`}>
              {item.produit.quantiteStock > 10 
                ? 'En stock'
                : item.produit.quantiteStock > 0
                  ? `Stock limité (${item.produit.quantiteStock})`
                  : 'Rupture'
              }
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        {/* Sélecteur de quantité */}
        <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
          <button
            onClick={() => onDecrement(item.idProduit, item.quantite)}
            disabled={item.quantite <= 1}
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <MinusIcon className="w-4 h-4" />
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
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <PlusIcon className="w-4 h-4" />
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
          <div className="text-lg font-bold text-red-600">
            {(itemData.final * quantite).toFixed(2)} TND
          </div>
          <div className="text-xs text-gray-400 line-through">
            {(itemData.original * quantite).toFixed(2)} TND
          </div>
        </div>
      ) : (
        <span className="text-lg font-bold text-gray-900">
          {(itemData.original * quantite).toFixed(2)} TND
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
      } catch (error) {
        // L'erreur est gérée dans useCart
      }
    }
  };

  const handleDecrement = async (idProduit: number, currentQuantity: number) => {
    if (currentQuantity > 1) {
      try {
        await updateQuantity(idProduit, currentQuantity - 1);
      } catch (error) {
        // L'erreur est gérée dans useCart
      }
    }
  };

  const handleQuantityChange = async (idProduit: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) return;
    
    try {
      await updateQuantity(idProduit, value);
    } catch (error) {
      // L'erreur est gérée dans useCart
    }
  };

  const handleRemove = async (idProduit: number) => {
    try {
      await removeFromCart(idProduit);
      removeItemTotal(idProduit);
    } catch (error) {
      // Error is handled in useCart
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
      try {
        await clearCart();
      } catch (error) {
        // L'erreur est gérée dans useCart
      }
    }
  };

  if (!mounted) {
    return null;
  }

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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <ShoppingCartIcon className="w-6 h-6 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Votre Panier
            </h1>
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="flex items-center gap-2 text-red-500 hover:text-red-700 transition-colors px-4 py-2 rounded-lg hover:bg-red-50"
            >
              <XMarkIcon className="w-5 h-5" />
              <span className="font-medium">Vider le panier</span>
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCartIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Votre panier est vide</h3>
              <p className="text-gray-600 mb-8">Découvrez notre sélection de produits et commencez vos achats</p>
              <Link href="/site">
                <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 font-medium shadow-lg">
                  Découvrir nos produits
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Liste des produits */}
            <div className="xl:col-span-3">
              <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="p-6 bg-gray-50 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Articles dans votre panier</h2>
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                      {totalItems} article{totalItems > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                
                {/* Modified div with conditional scrollbar */}
                <div className={`divide-y divide-gray-100 ${cartItems.length > 4 ? 'max-h-[400px] overflow-y-auto' : ''}`}>
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
                <Link href="/site" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors font-medium">
                  <ArrowLeftIcon className="w-5 h-5" />
                  Continuer vos achats
                </Link>
              </div>
            </div>

            {/* Résumé de la commande */}
            <div className="xl:col-span-1">
              <div className="sticky top-6 space-y-6">
                {/* Résumé des prix */}
                <div className="bg-white rounded-2xl shadow-sm border p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Résumé de la commande</h3>
                  
                  <div className="space-y-4 text-sm">
                    {totalSavings > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Prix original</span>
                        <span className="line-through">{totalOriginal.toFixed(2)} TND</span>
                      </div>
                    )}

                    {totalSavings > 0 && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Promotions</span>
                        <span>-{totalSavings.toFixed(2)} TND</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Sous-total</span>
                      <span className="font-medium">{totalFinal.toFixed(2)} TND</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Livraison</span>
                      <span className={`font-medium ${livraison === 0 ? "text-green-600" : ""}`}>
                        {livraison === 0 ? "Gratuite" : `${livraison.toFixed(2)} TND`}
                      </span>
                    </div>

                    {totalFinal < 100 && totalFinal > 0 && (
                      <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded-lg">
                        Plus que {(100 - totalFinal).toFixed(2)} TND pour la livraison gratuite !
                      </div>
                    )}

                    <div className="border-t pt-4">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total TTC</span>
                        <span className="text-purple-600">{totalTTC.toFixed(2)} TND</span>
                      </div>
                    </div>

                    {totalSavings > 0 && (
                      <div className="text-center text-green-600 font-medium bg-green-50 p-3 rounded-lg">
                        Vous économisez {totalSavings.toFixed(2)} TND !
                      </div>
                    )}
                  </div>

                  <Link href="/site/passerCmd" className="block mt-6">
                    <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 font-semibold transition-all transform hover:scale-105 shadow-lg">
                      Finaliser la commande
                    </button>
                  </Link>
                </div>

                {/* Garanties */}
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