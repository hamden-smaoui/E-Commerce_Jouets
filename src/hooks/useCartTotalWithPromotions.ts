// hooks/useCartTotalWithPromotions.ts
import { useState, useEffect } from 'react';
import { useCart } from './useCart';
import PromotionsService from '@/services/promotions-service';

export const useCartTotalWithPromotions = () => {
  const { cartItems } = useCart();
  const [totals, setTotals] = useState({
    subtotalOriginal: 0,
    subtotalFinal: 0,
    totalSavings: 0
  });

  useEffect(() => {
    const calculateTotals = async () => {
      if (cartItems.length === 0) {
        setTotals({ subtotalOriginal: 0, subtotalFinal: 0, totalSavings: 0 });
        return;
      }

      let subtotalOriginal = 0;
      let subtotalFinal = 0;

      for (const item of cartItems) {
        const itemTotalOriginal = item.produit.prix * item.quantite;
        subtotalOriginal += itemTotalOriginal;

        try {
          // Récupérer les promotions pour ce produit
          const promotions = await PromotionsService.getPromotionsPourProduit(item.idProduit);
          
          let bestReduction = 0;
          promotions.forEach(promo => {
            let reduction = 0;
            if (promo.typePromotion === 'pourcentage') {
              reduction = item.produit.prix * (promo.valeurPromotion / 100);
            } else if (promo.typePromotion === 'montant_fixe') {
              reduction = Math.min(promo.valeurPromotion, item.produit.prix);
            }
            
            if (reduction > bestReduction) {
              bestReduction = reduction;
            }
          });

          const prixFinal = Math.max(0, item.produit.prix - bestReduction);
          const itemTotalFinal = prixFinal * item.quantite;
          subtotalFinal += itemTotalFinal;
        } catch (error) {
          // Si erreur, utiliser le prix original
          subtotalFinal += itemTotalOriginal;
        }
      }

      setTotals({
        subtotalOriginal,
        subtotalFinal,
        totalSavings: subtotalOriginal - subtotalFinal
      });
    };

    calculateTotals();
  }, [cartItems]);

  return totals;
};