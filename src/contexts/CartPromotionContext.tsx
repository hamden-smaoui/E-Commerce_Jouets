"use client";
import React, { createContext, useContext, useState, useCallback } from 'react';

interface ItemTotal {
  original: number;
  final: number;
  quantity: number;
}

interface CartPromotionContextType {
  itemTotals: Record<number, ItemTotal>;
  updateItemTotal: (idProduit: number, originalPrice: number, finalPrice: number, quantity: number) => void;
  removeItemTotal: (idProduit: number) => void; // New function
  getTotals: () => { totalOriginal: number; totalFinal: number; totalSavings: number };
  clearTotals: () => void;
}

const CartPromotionContext = createContext<CartPromotionContextType | undefined>(undefined);

export const CartPromotionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [itemTotals, setItemTotals] = useState<Record<number, ItemTotal>>({});

  const updateItemTotal = useCallback((idProduit: number, originalPrice: number, finalPrice: number, quantity: number) => {
    console.log('Context: Updating item total', { idProduit, originalPrice, finalPrice, quantity });
    setItemTotals(prev => {
      const newTotals = {
        ...prev,
        [idProduit]: { original: originalPrice, final: finalPrice, quantity }
      };
      console.log('Context: New item totals', newTotals);
      return newTotals;
    });
  }, []);

  const removeItemTotal = useCallback((idProduit: number) => {
    console.log('Context: Removing item total', { idProduit });
    setItemTotals(prev => {
      const newTotals = { ...prev };
      delete newTotals[idProduit];
      console.log('Context: New item totals after removal', newTotals);
      return newTotals;
    });
  }, []);

  const getTotals = useCallback(() => {
    const totals = Object.values(itemTotals).reduce(
      (acc, item) => ({
        totalOriginal: acc.totalOriginal + (item.original * item.quantity),
        totalFinal: acc.totalFinal + (item.final * item.quantity),
        totalSavings: acc.totalSavings + ((item.original - item.final) * item.quantity)
      }),
      { totalOriginal: 0, totalFinal: 0, totalSavings: 0 }
    );
    console.log('Context: Calculated totals', totals);
    return totals;
  }, [itemTotals]);

  const clearTotals = useCallback(() => {
    console.log('Context: Clearing totals');
    setItemTotals({});
  }, []);

  return (
    <CartPromotionContext.Provider value={{ itemTotals, updateItemTotal, removeItemTotal, getTotals, clearTotals }}>
      {children}
    </CartPromotionContext.Provider>
  );
};

export const useCartPromotionContext = () => {
  const context = useContext(CartPromotionContext);
  if (!context) {
    throw new Error('useCartPromotionContext must be used within CartPromotionProvider');
  }
  return context;
};