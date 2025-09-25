// hooks/useCart.ts
"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import PanierService, { Cart, CartItem } from "@/services/panier-service";
import { useAuth } from "./useAuth";
import { toast } from "react-hot-toast";

interface CartContextType {
  cart: Cart | null;
  cartItems: CartItem[];
  totalItems: number;
  totalPrice: number;
  loading: boolean;
  addToCart: (idProduit: number, quantite?: number, variationId?: number) => Promise<void>;
  updateQuantity: (idProduit: number, quantite: number, idProduitVariation?: number) => Promise<void>;
  removeFromCart: (idPanierProduit: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  clearCartWithoutToast: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartItems = cart?.produits || [];
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantite, 0);
  
  // Utiliser le prix unitaire stocké dans le panier
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.quantite * item.prixUnitaire,
    0
  );

  const refreshCart = async () => {
    if (!mounted || !isAuthenticated) {
      setCart(null);
      return;
    }

    try {
      setLoading(true);
      const cartData = await PanierService.getPanier();
      setCart(cartData);
      console.log("Panier chargé avec succès:", cartData);
    } catch (error) {
      console.error("Erreur lors du chargement du panier:", error);
      toast.error("Erreur lors du chargement du panier");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (idProduit: number, quantite: number = 1, variationId?: number) => {
    if (!isAuthenticated) {
      toast.error("Vous devez être connecté pour ajouter des produits au panier");
      return;
    }

    try {
      await PanierService.ajouterProduit(idProduit, quantite, variationId);
      await refreshCart();
      toast.success("Produit ajouté au panier");
    } catch (error: any) {
      const message = error.message || "Erreur lors de l'ajout au panier";
      toast.error(message);
      throw error;
    }
  };

  // CORRECTION: Fonction updateQuantity corrigée pour correspondre au service
  const updateQuantity = async (idProduit: number, quantite: number, idProduitVariation?: number) => {
    try {
      await PanierService.modifierQuantite(idProduit, quantite, idProduitVariation);
      await refreshCart();
    } catch (error: any) {
      const message = error.message || "Erreur lors de la modification";
      toast.error(message);
      throw error;
    }
  };

  const removeFromCart = async (idPanierProduit: number) => {
    try {
      console.log("Suppression du produit avec idPanierProduit:", idPanierProduit);
      await PanierService.retirerProduit(idPanierProduit);
      await refreshCart();
      toast.success("Produit retiré du panier");
    } catch (error: any) {
      const message = error.message || "Erreur lors de la suppression";
      toast.error(message);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await PanierService.viderPanier();
      await refreshCart();
      toast.success("Panier vidé");
    } catch (error: any) {
      const message = error.message || "Erreur lors du vidage du panier";
      toast.error(message);
      throw error;
    }
  };

  const clearCartWithoutToast = async () => {
    try {
      await PanierService.viderPanier();
      await refreshCart();
    } catch (error: any) {
      const message = error.message || "Erreur lors du vidage du panier";
      toast.error(message);
      throw error;
    }
  };

  useEffect(() => {
    if (mounted && isAuthenticated) {
      refreshCart();
    } else if (mounted && !isAuthenticated) {
      setCart(null);
    }
  }, [mounted, isAuthenticated]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems,
        totalItems,
        totalPrice,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        clearCartWithoutToast,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}