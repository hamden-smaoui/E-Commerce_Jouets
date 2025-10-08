"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import PanierService, { Cart, CartItem } from "@/services/panier-service";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import * as fbq from "@/lib/fpixel"; // 👈 Ajouter

interface CartContextType {
  cart: Cart | null;
  cartItems: CartItem[];
  totalItems: number;
  totalPrice: number;
  loading: boolean;          // Le loading global (affichage initial)
  initialLoading: boolean;   // Nouveau : loading uniquement au premier affichage
  actionLoadingItemId: number | null; // Nouveau : idProduit en action
  addToCart: (idProduit: number, quantite?: number, variationId?: number) => Promise<void>;
  updateQuantity: (idProduit: number, quantite: number, idProduitVariation?: number) => Promise<void>;
  removeFromCart: (idPanierProduit: number, idProduit: number) => Promise<void>; // Ajout idProduit
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
 const [initialLoading, setInitialLoading] = useState(true); // Nouveau
  const [actionLoadingItemId, setActionLoadingItemId] = useState<number | null>(null); // Nouveau
 
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
      setCart(null);
      if (isAuthenticated) toast.error("Erreur lors du chargement du panier");
    } finally {
      setLoading(false);
      setInitialLoading(false); // Fin du premier chargement
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
    
    // Récupérer les infos du produit ajouté
    const updatedCart = await PanierService.getPanier(token);
    const addedItem = updatedCart.produits.find(p => p.idProduit === idProduit);
    
    toast.success("Produit ajouté au panier");
    
    // 🔥 TRACKER AVEC TOUTES LES INFOS
    if (addedItem) {
      fbq.event('AddToCart', {
        content_ids: [idProduit.toString()],
        content_name: addedItem.produit.nom || 'Produit', // 👈 Nom du produit
        content_type: 'product',
        value: addedItem.prixUnitaire * quantite, // 👈 Prix total
        currency: 'TND', // Changez selon votre devise
        num_items: quantite // 👈 Quantité
      });
    }
    
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
      setActionLoadingItemId(idProduit);
      await PanierService.modifierQuantite(idProduit, quantite, idProduitVariation, token);
      await refreshCart();
    } catch (error: any) {
      const message = error.message || "Erreur lors de la modification";
      toast.error(message);
      throw error;
    } finally {
      setActionLoadingItemId(null);
    }
  };


  const removeFromCart = async (idPanierProduit: number, idProduit: number) => {
    if (!isAuthenticated || !token) {
      toast.error("Vous devez être connecté pour retirer du panier");
      router.push("/signIn");
      return;
    }
    try {
      setActionLoadingItemId(idProduit);
      await PanierService.retirerProduit(idPanierProduit, token);
      await refreshCart();
      toast.success("Produit retiré du panier");
    } catch (error: any) {
      const message = error.message || "Erreur lors de la suppression";
      toast.error(message);
      throw error;
    } finally {
      setActionLoadingItemId(null);
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
      setInitialLoading(false);
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
        initialLoading,
        actionLoadingItemId,
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