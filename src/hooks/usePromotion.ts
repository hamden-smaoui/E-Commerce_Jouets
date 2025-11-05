// hooks/usePromotions.ts
import { useState, useEffect } from 'react';
import PromotionsService, { PromotionActive } from '@/services/promotions-service';

export const usePromotions = (idProduit?: number) => {
  const [promotions, setPromotions] = useState<PromotionActive[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (idProduit) {
      loadPromotions();
    }
  }, [idProduit]);

  const loadPromotions = async () => {
    if (!idProduit) return;
    
    try {
      setLoading(true);
      const promotionsData = await PromotionsService.getPromotionsPourProduit(idProduit);
      setPromotions(promotionsData);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const calculatePriceWithPromotion = (prixOriginal: number): { prixFinal: number; reduction: number; pourcentageReduction: number } => {
    if (promotions.length === 0) {
      return { prixFinal: prixOriginal, reduction: 0, pourcentageReduction: 0 };
    }

    let meilleurReduction = 0;
    
    promotions.forEach(promo => {
      let reduction = 0;
      if (promo.typePromotion === 'pourcentage') {
        reduction = prixOriginal * (promo.valeurPromotion / 100);
      } else if (promo.typePromotion === 'montant_fixe') {
        reduction = Math.min(promo.valeurPromotion, prixOriginal);
      }
      
      if (reduction > meilleurReduction) {
        meilleurReduction = reduction;
      }
    });

    const prixFinal = Math.max(0, prixOriginal - meilleurReduction);
    const pourcentageReduction = prixOriginal > 0 ? (meilleurReduction / prixOriginal) * 100 : 0;

    return { prixFinal, reduction: meilleurReduction, pourcentageReduction };
  };

  return {
    promotions,
    loading,
    calculatePriceWithPromotion,
    hasPromotions: promotions.length > 0
  };
};