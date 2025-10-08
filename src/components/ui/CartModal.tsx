"use client";
import { useState, useRef, useEffect, createContext, useContext, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { usePromotions } from "@/hooks/usePromotion";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import {
  ShoppingCartIcon,
  TrashIcon,
  MinusIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import React from "react";

// Context pour la gestion des sous-totaux
const TotalContext = createContext({
  addSubtotal: (id: number, subtotal: number, subOriginal: number) => {},
  removeSubtotal: (id: number) => {},
});


const CartModalItem = ({ item, onIncrement, onDecrement, onRemove }: any) => {
  const { addSubtotal, removeSubtotal } = useContext(TotalContext);
  const { calculatePriceWithPromotion, hasPromotions } = usePromotions(item.idProduit);
  const { prixFinal } = calculatePriceWithPromotion(item.produit.prix);

  const imageUrl =
    item.produit.images && item.produit.images.length > 0
      ? `http://localhost:3001${item.produit.images.sort((a:any, b:any) => a.rang - b.rang)[0].url}`
      : '/images/placeholder.jpg';

  const subTotal = prixFinal * item.quantite;
  const subOriginal = item.produit.prix * item.quantite;

  useEffect(() => {
    addSubtotal(item.idProduit, subTotal, subOriginal);
    return () => removeSubtotal(item.idProduit);
  }, [addSubtotal, removeSubtotal, item.idProduit, subTotal, subOriginal]);

  // Correction ici : stockDisponible dépend de variation ou produit
  const stockDisponible = item.variation
    ? item.variation.quantiteStock
    : item.produit.quantiteStock;

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
    <div className="flex items-start gap-3 p-3 hover:bg-pink-50 rounded-lg transition-colors border-b border-gray-100 last:border-b-0">
      <div className="flex-shrink-0">
        <Image
          src={imageUrl}
          alt={item.produit.nom}
          width={70}
          height={70}
          className="rounded-lg object-cover shadow-sm"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight font-[Comic_Sans_MS,sans-serif]">
          {item.produit.nom}
        </h4>
        {item.variation && (
          <div className="text-xs text-gray-500 font-medium truncate mt-1">
            {formatVariation(item.variation)}
          </div>
        )}
        <div className="flex items-center gap-2 mt-1">
          {hasPromotions ? (
            <>
              <span className="text-sm font-bold text-red-600">
                {prixFinal.toFixed(2)} TND
              </span>
              <span className="text-xs text-gray-500 line-through">
                {item.produit.prix.toFixed(2)} TND
              </span>
            </>
          ) : (
            <span className="text-sm font-bold text-orange-500">
              {item.produit.prix.toFixed(2)} TND
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                onDecrement(item.idProduit, item.quantite, item.idProduitVariation)
              }
              disabled={item.quantite <= 1}
              className="w-7 h-7 rounded-full border-2 border-pink-300 flex items-center justify-center hover:bg-pink-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <MinusIcon className="w-3 h-3 text-pink-600" />
            </button>
            <span className="w-10 text-center text-sm font-bold">
              {item.quantite}
            </span>
            <button
              onClick={() =>
                onIncrement(
                  item.idProduit,
                  item.quantite,
                  stockDisponible,
                  item.idProduitVariation
                )
              }
              disabled={item.quantite >= stockDisponible}
              className="w-7 h-7 rounded-full border-2 border-pink-300 flex items-center justify-center hover:bg-pink-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <PlusIcon className="w-3 h-3 text-pink-600" />
            </button>
          </div>
          <button
  onClick={() => onRemove(item.idPanierProduit, item.idProduit)}
  className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-50"
  title="Supprimer"
>
  <TrashIcon className="w-5 h-5" />
</button>
        </div>
      </div>
    </div>
  );
};


interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { 
    cartItems, 
    totalItems, 
    loading, 
    updateQuantity, 
    removeFromCart 
  } = useCart();
  const { storeInfo } = useStoreInfo();

  const subtotalsRef = useRef(new Map<number, { subtotal: number; subOriginal: number }>());
  const [totals, setTotals] = useState({ totalWithPromotions: 0, totalOriginal: 0, totalSavings: 0 });
  const seuilLivraisonGratuite = storeInfo?.seuilLivraisonGratuite || 100;

  const addSubtotal = useCallback((id: number, subtotal: number, subOriginal: number) => {
    subtotalsRef.current.set(id, { subtotal, subOriginal });
    const newTotalWithProm = Array.from(subtotalsRef.current.values()).reduce((acc, v) => acc + v.subtotal, 0);
    const newTotalOriginal = Array.from(subtotalsRef.current.values()).reduce((acc, v) => acc + v.subOriginal, 0);
    setTotals({
      totalWithPromotions: newTotalWithProm,
      totalOriginal: newTotalOriginal,
      totalSavings: newTotalOriginal - newTotalWithProm,
    });
  }, []);

  const removeSubtotal = useCallback((id: number) => {
    subtotalsRef.current.delete(id);
    const newTotalWithProm = Array.from(subtotalsRef.current.values()).reduce((acc, v) => acc + v.subtotal, 0);
    const newTotalOriginal = Array.from(subtotalsRef.current.values()).reduce((acc, v) => acc + v.subOriginal, 0);
    setTotals({
      totalWithPromotions: newTotalWithProm,
      totalOriginal: newTotalOriginal,
      totalSavings: newTotalOriginal - newTotalWithProm,
    });
  }, []);

  const handleIncrement = async (idProduit: number, currentQuantity: number, stock: number, idProduitVariation: number) => {
    if (currentQuantity < stock) {
      try {
        await updateQuantity(idProduit, currentQuantity + 1, idProduitVariation);
      } catch (error) {}
    }
  };

  const handleDecrement = async (idProduit: number, currentQuantity: number, idProduitVariation: number) => {
    if (currentQuantity > 1) {
      try {
        await updateQuantity(idProduit, currentQuantity - 1, idProduitVariation);
      } catch (error) {}
    }
  };

  const handleRemove = async (idPanierProduit: number, idProduit: number) => {
  try {
    await removeFromCart(idPanierProduit, idProduit);
  } catch (error) {}
};

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-[999] transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 z-[1000] bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50">
          <h2 className="text-xl font-extrabold text-pink-600 drop-shadow-lg flex items-center font-[Comic_Sans_MS,sans-serif]">
            <ShoppingCartIcon className="h-6 w-6 mr-2 text-purple-500" />
            Mon Panier ({totalItems})
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-pink-100 rounded-full transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="animate-spin h-12 w-12 border-4 border-pink-400 border-t-transparent rounded-full"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <ShoppingCartIcon className="h-20 w-20 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-6 text-center font-[Comic_Sans_MS,sans-serif] text-lg">
              Votre panier est vide
            </p>
            <Link href="/site">
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full hover:shadow-lg transition-all font-bold"
              >
                Découvrir nos produits ✨
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* Liste des produits */}
            <TotalContext.Provider value={{ addSubtotal, removeSubtotal }}>
              <div className="flex-1 overflow-y-auto px-4 py-2">
                {cartItems.map((item) => (
  <CartModalItem
    key={`${item.idProduit}-${item.idProduitVariation || 0}`}
    item={item}
    onIncrement={handleIncrement}
    onDecrement={handleDecrement}
    onRemove={handleRemove}
  />
))}
              </div>
            </TotalContext.Provider>

            {/* Footer */}
            <div className="border-t-2 border-pink-200 p-4 space-y-3 bg-gradient-to-r from-pink-50 to-purple-50">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-lg font-bold text-gray-800">
                  <span className="font-[Comic_Sans_MS,sans-serif]">Total:</span>
                  <span className="text-purple-600 text-xl">
                    {totals.totalWithPromotions.toFixed(2)} TND
                  </span>
                </div>
                {totals.totalSavings > 0 && (
                  <div className="flex items-center justify-between text-sm text-green-600">
                    <span className="font-[Comic_Sans_MS,sans-serif]">Économies totales:</span>
                    <span className="font-bold">
                      -{totals.totalSavings.toFixed(2)} TND
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Link href="/site/cart" className="block">
                  <button
                    onClick={onClose}
                    className="w-full bg-white border-2 border-purple-300 text-purple-600 py-3 px-4 rounded-full hover:bg-purple-50 transition-all font-bold text-sm shadow-sm"
                  >
                    Voir le panier complet 🛒
                  </button>
                </Link>
                <Link href="/site/passerCmd" className="block">
                  <button
                    onClick={onClose}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-full hover:shadow-lg transition-all font-bold text-sm"
                  >
                    Passer commande 🎁
                  </button>
                </Link>
              </div>

              <p className="text-xs text-center text-green-600 font-bold bg-green-50 px-3 py-2 rounded-full shadow-sm font-[Comic_Sans_MS,sans-serif]">
                🎁 Livraison offerte dès {seuilLivraisonGratuite} TND ! 🚚✨
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}