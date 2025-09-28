"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import PanierService, { Cart, CartItem } from "@/services/panier-service";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const { status, data: session } = useSession();
  const isAuthenticated = status === "authenticated";
  const token = session?.customToken;

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartItems = cart?.produits || [];
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantite, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.quantite * item.prixUnitaire, 0);

  const refreshCart = async () => {
    if (!mounted || !isAuthenticated || !token) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const cartData = await PanierService.getPanier(token);
      setCart(cartData);
    } catch (error) {
      setCart(null); // always reset if error
      if (isAuthenticated) toast.error("Erreur lors du chargement du panier");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (idProduit: number, quantite: number = 1, variationId?: number) => {
    if (!isAuthenticated || !token) {
      toast.error("Vous devez être connecté pour ajouter des produits au panier");
      router.push("/signIn");
      return;
    }
    try {
      await PanierService.ajouterProduit(idProduit, quantite, variationId, token);
      await refreshCart();
      toast.success("Produit ajouté au panier");
    } catch (error: any) {
      const message = error.message || "Erreur lors de l'ajout au panier";
      toast.error(message);
      throw error;
    }
  };

  const updateQuantity = async (idProduit: number, quantite: number, idProduitVariation?: number) => {
    if (!isAuthenticated || !token) {
      toast.error("Vous devez être connecté pour modifier le panier");
      router.push("/signIn");
      return;
    }
    try {
      await PanierService.modifierQuantite(idProduit, quantite, idProduitVariation, token);
      await refreshCart();
    } catch (error: any) {
      const message = error.message || "Erreur lors de la modification";
      toast.error(message);
      throw error;
    }
  };

  const removeFromCart = async (idPanierProduit: number) => {
    if (!isAuthenticated || !token) {
      toast.error("Vous devez être connecté pour retirer du panier");
      router.push("/signIn");
      return;
    }
    try {
      await PanierService.retirerProduit(idPanierProduit, token);
      await refreshCart();
      toast.success("Produit retiré du panier");
    } catch (error: any) {
      const message = error.message || "Erreur lors de la suppression";
      toast.error(message);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated || !token) {
      toast.error("Vous devez être connecté pour vider le panier");
      router.push("/signIn");
      return;
    }
    try {
      await PanierService.viderPanier(token);
      await refreshCart();
      toast.success("Panier vidé");
    } catch (error: any) {
      const message = error.message || "Erreur lors du vidage du panier";
      toast.error(message);
      throw error;
    }
  };

  const clearCartWithoutToast = async () => {
    if (!isAuthenticated || !token) return;
    try {
      await PanierService.viderPanier(token);
      await refreshCart();
    } catch (error: any) {
      const message = error.message || "Erreur lors du vidage du panier";
      toast.error(message);
      throw error;
    }
  };

  useEffect(() => {
    if (mounted && isAuthenticated && token) {
      refreshCart();
    } else if (mounted && !isAuthenticated) {
      setCart(null);
    }
  }, [mounted, isAuthenticated, token]);

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