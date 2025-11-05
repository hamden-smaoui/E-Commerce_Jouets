// components/ui/CartItemPromotion.tsx
"use client";
import React from 'react';
import { usePromotions } from '@/hooks/usePromotion';
import { useCartPromotionContext } from '@/contexts/CartPromotionContext';

interface CartItemPromotionProps {
  idProduit: number;
  prixOriginal: number;
  quantite: number;
}

const CartItemPromotion: React.FC<CartItemPromotionProps> = ({ 
  idProduit, 
  prixOriginal, 
  quantite 
}) => {
  const { calculatePriceWithPromotion, hasPromotions, promotions } = usePromotions(idProduit);
  const { updateItemTotal } = useCartPromotionContext();
  const { prixFinal, reduction, pourcentageReduction } = calculatePriceWithPromotion(prixOriginal);

  // Mettre à jour le contexte à chaque changement - CORRECTION ICI
  React.useEffect(() => {
    updateItemTotal(idProduit, prixOriginal, prixFinal, quantite);
  }, [idProduit, prixOriginal, prixFinal, quantite, updateItemTotal]);

  if (!hasPromotions) {
    return (
      <div className="text-orange-500 text-lg font-bold mt-1">
        {prixOriginal.toFixed(2)} <span className="text-xs">TND</span>
      </div>
    );
  }

  return (
    <div className="mt-1">
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-red-600">
          {prixFinal.toFixed(2)} <span className="text-xs">TND</span>
        </span>
        <span className="text-sm text-gray-500 line-through">
          {prixOriginal.toFixed(2)} <span className="text-xs">TND</span>
        </span>
      </div>
      
    </div>
  );
};

export default CartItemPromotion;