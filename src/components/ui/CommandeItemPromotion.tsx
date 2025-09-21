// components/ui/CommandeItemPromotion.tsx
"use client";
import React from 'react';

interface CommandeItemPromotionProps {
  idProduit: number;
  prixOriginal: number; 
  quantite: number;
  prixFacture: number;
  
  ligne?: {
    prixUnitaireOriginal?: number;
    prixUnitaireFinal?: number;
    prixUnitaire: number;
    reductionUnitaire?: number;
  };
}

const CommandeItemPromotion: React.FC<CommandeItemPromotionProps> = ({ 
  idProduit, 
  prixOriginal, 
  quantite,
  prixFacture,
  ligne 
}) => {
  // Si on a les nouvelles données de la base, les utiliser
  // Sinon, utiliser les anciennes props pour la compatibilité
  const prixUnitaireOriginal = ligne?.prixUnitaireOriginal || prixOriginal;
  const prixUnitaireFinal = ligne?.prixUnitaireFinal || prixFacture;
  const reductionUnitaire = ligne?.reductionUnitaire || (prixUnitaireOriginal - prixUnitaireFinal);
  
  // Vérifier s'il y a une promotion
  const hasPromotion = reductionUnitaire > 0 && prixUnitaireFinal < prixUnitaireOriginal;
  const pourcentageReduction = hasPromotion ? ((reductionUnitaire / prixUnitaireOriginal) * 100) : 0;

  if (!hasPromotion) {
    return (
      <div className="text-orange-500 text-base sm:text-lg font-bold mt-1">
        {prixUnitaireFinal.toFixed(2)} <span className="text-xs">TND</span>
      </div>
    );
  }

  return (
    <div className="mt-1 space-y-1">
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
        <span className="text-base sm:text-lg font-bold text-red-600">
          {prixUnitaireFinal.toFixed(2)} <span className="text-xs">TND</span>
        </span>
        <span className="text-xs sm:text-sm text-gray-500 line-through">
          {prixUnitaireOriginal.toFixed(2)} <span className="text-xs">TND</span>
        </span>
        {pourcentageReduction > 0 && (
          <span className="bg-pink-200 text-pink-800 px-1 sm:px-2 py-0.5 text-xs rounded inline-block w-fit">
            -{pourcentageReduction.toFixed(0)}%
          </span>
        )}
      </div>
      
      <div className="text-xs text-green-600 font-medium">
        Économie: {reductionUnitaire.toFixed(2)} <span className="text-xs">TND</span> par unité
      </div>
    </div>
  );
};

export default CommandeItemPromotion;