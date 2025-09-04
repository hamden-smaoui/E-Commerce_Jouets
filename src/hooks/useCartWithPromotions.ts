// hooks/useCartWithPromotions.ts
import { useState, useEffect } from 'react';
import { useCart } from './useCart';
import { usePromotions } from './usePromotion';

interface CartItemWithPromotion {
  idProduit: number;
  quantite: number;
  prixOriginal: number;
  prixFinal: number;
  reduction: number;
  totalOriginal: number;
  totalFinal: number;
  totalReduction: number;
  nom: string;
  hasPromotion: boolean;
}

export const useCartWithPromotions = () => {
  const { cartItems, totalItems, loading, updateQuantity, removeFromCart, clearCart } = useCart();
  const [itemsWithPromotions, setItemsWithPromotions] = useState<CartItemWithPromotion[]>([]);
  const [totals, setTotals] = useState({
    totalOriginal: 0,
    totalFinal: 0,
    totalReduction: 0,
    hasAnyPromotion: false
  });

  // Hook pour chaque produit (nous devrons l'implémenter différemment)
  useEffect(() => {
    const calculateItemsWithPromotions = async () => {
      if (cartItems.length === 0) {
        setItemsWithPromotions([]);
        setTotals({
          totalOriginal: 0,
          totalFinal: 0,
          totalReduction: 0,
          hasAnyPromotion: false
        });
        return;
      }

      // On va créer une version simplifiée pour maintenant
      const items = cartItems.map(item => {
        const prixOriginal = item.produit.prix;
        const quantite = item.quantite;
        const totalOriginal = prixOriginal * quantite;
        
        return {
          idProduit: item.idProduit,
          quantite,
          prixOriginal,
          prixFinal: prixOriginal, // Sera mis à jour par les composants individuels
          reduction: 0,
          totalOriginal,
          totalFinal: totalOriginal,
          totalReduction: 0,
          nom: item.produit.nom,
          hasPromotion: false
        };
      });

      setItemsWithPromotions(items);
      
      const totalOriginal = items.reduce((sum, item) => sum + item.totalOriginal, 0);
      setTotals({
        totalOriginal,
        totalFinal: totalOriginal,
        totalReduction: 0,
        hasAnyPromotion: false
      });
    };

    calculateItemsWithPromotions();
  }, [cartItems]);

  return {
    cartItems,
    itemsWithPromotions,
    totalItems,
    totals,
    loading,
    updateQuantity,
    removeFromCart,
    clearCart
  };
};