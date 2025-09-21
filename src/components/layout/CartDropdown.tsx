"use client";
import { useState, useRef, useEffect, createContext, useContext, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { usePromotions } from "@/hooks/usePromotion";
import {
  ShoppingCartIcon,
  TrashIcon,
  MinusIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

// Context for subtotal management
const TotalContext = createContext({
  addSubtotal: (id: number, subtotal: number, subOriginal: number) => {},
  removeSubtotal: (id: number) => {},
});

// Affiche un item avec promotion
const CartDropdownItem = ({ item, onIncrement, onDecrement, onRemove }: any) => {
  const { addSubtotal, removeSubtotal } = useContext(TotalContext);
  const { calculatePriceWithPromotion, hasPromotions } = usePromotions(item.idProduit);
  const { prixFinal, reduction } = calculatePriceWithPromotion(item.produit.prix);
  
  const imageUrl = item.produit.images && item.produit.images.length > 0
    ? `http://localhost:3001${item.produit.images.sort((a:any, b:any) => a.rang - b.rang)[0].url}`
    : '/images/placeholder.jpg';

  const subTotal = prixFinal * item.quantite;
  const subOriginal = item.produit.prix * item.quantite;

  useEffect(() => {
    addSubtotal(item.idProduit, subTotal, subOriginal);
    return () => removeSubtotal(item.idProduit);
  }, [addSubtotal, removeSubtotal, item.idProduit, subTotal, subOriginal]);

  return (
    <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
      {/* Image du produit */}
      <div className="flex-shrink-0">
        <Image
          src={imageUrl}
          alt={item.produit.nom}
          width={60}
          height={60}
          className="rounded-lg object-cover"
        />
      </div>

      {/* Détails du produit */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight">
          {item.produit.nom}
        </h4>
        
        {/* Prix avec promotion */}
        <div className="flex items-center gap-2 mt-1">
          {hasPromotions ? (
            <>
              <span className="text-sm font-semibold text-red-600">
                {prixFinal.toFixed(2)} TND
              </span>
              <span className="text-xs text-gray-500 line-through">
                {item.produit.prix.toFixed(2)} TND
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold text-orange-500">
              {item.produit.prix.toFixed(2)} TND
            </span>
          )}
        </div>

        {/* Contrôles de quantité */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onDecrement(item.idProduit, item.quantite)}
              disabled={item.quantite <= 1}
              className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <MinusIcon className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-sm font-medium">
              {item.quantite}
            </span>
            <button
              onClick={() => onIncrement(item.idProduit, item.quantite, item.produit.quantiteStock)}
              disabled={item.quantite >= item.produit.quantiteStock}
              className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <PlusIcon className="w-3 h-3" />
            </button>
          </div>
          
          <button
            onClick={() => onRemove(item.idProduit)}
            className="text-red-500 hover:text-red-700 transition-colors p-1"
            title="Supprimer"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CartDropdown() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { 
    cartItems, 
    totalItems, 
    loading, 
    updateQuantity, 
    removeFromCart 
  } = useCart();

  const subtotalsRef = useRef(new Map<number, { subtotal: number; subOriginal: number }>());
  const [totals, setTotals] = useState({ totalWithPromotions: 0, totalOriginal: 0, totalSavings: 0 });

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

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleRemove = async (idProduit: number) => {
    try {
      await removeFromCart(idProduit);
    } catch (error) {}
  };

  const handleCartClick = () => {
    setIsOpen(!isOpen);
  };

  if (loading) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button className="btn btn-ghost btn-circle btn-sm md:btn-md" disabled>
          <div className="animate-spin h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full"></div>
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton du panier avec indicateur */}
      <div className="indicator">
        {totalItems > 0 && (
          <span className="indicator-item badge badge-warning badge-xs">
            {totalItems}
          </span>
        )}
        <button
          onClick={handleCartClick}
          className="btn btn-ghost btn-circle btn-sm md:btn-md bg-purple-100 hover:bg-purple-200 shadow-md hover:scale-105 transition-all"
          title="Panier"
        >
          <ShoppingCartIcon className="h-5 w-5 md:h-6 md:w-6 text-purple-500 drop-shadow-lg" />
        </button>
      </div>

      {/* Dropdown du panier */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-[1000] max-h-[80vh] flex flex-col">
          {/* Header du dropdown */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="text-lg font-extrabold font-[Comic_Sans_MS,sans-serif] text-pink-600 drop-shadow-lg">
              Mon Panier ({totalItems})
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Contenu du panier */}
          {cartItems.length === 0 ? (
            <div className="p-6 text-center">
              <ShoppingCartIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">Votre panier est vide</p>
              <Link href="/site">
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Découvrir nos produits
                </button>
              </Link>
            </div>
          ) : (
            <>
              {/* Liste des produits avec scroll */}
              <TotalContext.Provider value={{ addSubtotal, removeSubtotal }}>
                <div className="flex-1 overflow-y-auto max-h-80">
                  <div className="p-4 space-y-4">
                    {cartItems.map((item) => (
                      <CartDropdownItem
                        key={item.idProduit}
                        item={item}
                        onIncrement={handleIncrement}
                        onDecrement={handleDecrement}
                        onRemove={handleRemove}
                      />
                    ))}
                  </div>
                </div>
              </TotalContext.Provider>

              {/* Footer avec total et boutons */}
              <div className="border-t border-gray-100 p-4 space-y-3 bg-gray-50 rounded-b-lg">
                {/* Total avec économies */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-lg font-bold text-gray-800">
                    <span>Total:</span>
                    <span className="text-purple-600">
                      {totals.totalWithPromotions.toFixed(2)} TND
                    </span>
                  </div>
                  {totals.totalSavings > 0 && (
                    <div className="flex items-center justify-between text-sm text-green-600">
                      <span>Économies totales:</span>
                      <span className="font-medium">
                        -{totals.totalSavings.toFixed(2)} TND
                      </span>
                    </div>
                  )}
                </div>

                {/* Boutons d'action */}
                <div className="space-y-2">
                  <Link href="/site/cart" className="block">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                    >
                      Voir le panier complet
                    </button>
                  </Link>
                  <Link href="/site/passerCmd" className="block">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-semibold text-sm"
                    >
                      Passer commande
                    </button>
                  </Link>
                </div>

                {/* Note sur la livraison */}
                <p className="text-xs text-gray-500 text-center">
                  Livraison gratuite à partir de 100 TND
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}