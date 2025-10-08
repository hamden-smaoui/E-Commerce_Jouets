"use client";
import React, { Suspense } from "react";
import dynamic from 'next/dynamic';
import KidsCornerLoader from "@/components/ui/KidsCornerLoader";
import { CartProvider } from "@/hooks/useCart";
import { CartPromotionProvider } from '@/contexts/CartPromotionContext';

// ✅ Chargement dynamique sans SSR
const CartContentInner = dynamic(() => import('@/components/cart/CartContentInner'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <KidsCornerLoader
        message="Chargement du panier..."
        size="lg"
        showMessage={true}
      />
    </div>
  ),
});

const CartWithProvider = () => {
  return (
    <CartProvider>
      <CartPromotionProvider>
        <Suspense 
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-base-200">
              <KidsCornerLoader
                message="Chargement du panier..."
                size="lg"
                showMessage={true}
              />
            </div>
          }
        >
          <CartContentInner />
        </Suspense>
      </CartPromotionProvider>
    </CartProvider>
  );
};

export default CartWithProvider;