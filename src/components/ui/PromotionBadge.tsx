// components/ui/PromotionBadge.tsx
import React from 'react';

interface PromotionBadgeProps {
  pourcentageReduction: number;
  typePromotion?: 'pourcentage' | 'montant_fixe' | 'livraison_gratuite';
  className?: string;
}

const PromotionBadge: React.FC<PromotionBadgeProps> = ({ 
  pourcentageReduction, 
  typePromotion = 'pourcentage',
  className = '' 
}) => {
  if (pourcentageReduction <= 0) return null;

  return (
    <div className={`absolute top-2 left-2 z-10 ${className}`}>
      <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg transform -rotate-12">
        {typePromotion === 'livraison_gratuite' ? 'Livraison Gratuite' : `-${Math.round(pourcentageReduction)}%`}
      </div>
    </div>
  );
};

export default PromotionBadge;