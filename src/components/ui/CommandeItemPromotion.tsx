// components/ui/CommandeItemPromotion.tsx
"use client";
import React from 'react';
import { usePromotions } from '@/hooks/usePromotion';

interface CommandeItemPromotionProps {
  idProduit: number;
  prixOriginal: number;
  quantite: number;
  prixFacture: number; // Prix facturé dans la commande
}

const CommandeItemPromotion: React.FC<CommandeItemPromotionProps> = ({ 
  idProduit, 
  prixOriginal, 
  quantite,
  prixFacture 
}) => {
  const { calculatePriceWithPromotion, hasPromotions, promotions } = usePromotions(idProduit);
  const { prixFinal, reduction, pourcentageReduction } = calculatePriceWithPromotion(prixOriginal);

  // Vérifier s'il y a une différence entre le prix original et le prix facturé
  const hasPromotion = prixFacture < prixOriginal || hasPromotions;
  const actualReduction = prixOriginal - prixFacture;
  const actualPercentage = actualReduction > 0 ? (actualReduction / prixOriginal) * 100 : 0;

  if (!hasPromotion) {
    return (
      <div className="text-orange-500 text-base sm:text-lg font-bold mt-1">
        {prixFacture.toFixed(2)} TND
      </div>
    );
  }

  return (
    <div className="mt-1 space-y-1">
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
        <span className="text-base sm:text-lg font-bold text-red-600">
          {prixFacture.toFixed(2)} TND
        </span>
        <span className="text-xs sm:text-sm text-gray-500 line-through">
          {prixOriginal.toFixed(2)} TND
        </span>
        {actualPercentage > 0 && (
          <span className="bg-pink-200 text-pink-800 px-1 sm:px-2 py-0.5 text-xs rounded inline-block w-fit">
            -{actualPercentage.toFixed(0)}%
          </span>
        )}
      </div>
      
      {actualReduction > 0 && (
        <div className="text-xs text-green-600 font-medium">
          Économie: {actualReduction.toFixed(2)} TND par unité
        </div>
      )}
      
      {hasPromotions && promotions.length > 0 && (
        <div className="text-xs text-blue-600 flex items-center gap-1">
          <span>🏷️</span>
          <span className="truncate">{promotions[0].nom}</span>
        </div>
      )}
    </div>
  );
};

export default CommandeItemPromotion;