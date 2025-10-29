"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import PanierService, { Cart, CartItem } from "@/services/panier-service";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import * as fbq from "@/lib/fpixel";

interface CartContextType {
  cart: Cart | null;
  cartItems: CartItem[];
  totalItems: number;
  totalPrice: number;
  loading: boolean;
  initialLoading: boolean;
  actionLoadingItemId: number | null;
  addToCart: (idProduit: number, quantite?: number, variationId?: number, produit?: any, variation?: any) => Promise<void>;
  updateQuantity: (idProduit: number, quantite: number, idProduitVariation?: number) => Promise<void>;
  removeFromCart: (idPanierProduit: number | undefined, idProduit: number, idProduitVariation?: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  clearCartWithoutToast: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [actionLoadingItemId, setActionLoadingItemId] = useState<number | null>(null);
  const [syncDone, setSyncDone] = useState(false);
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

  /**
   * ✅ MODIFIÉ : Synchroniser le panier local avec la BDD lors de la connexion
   */
  const syncCartOnLogin = async () => {
    if (!token || syncDone) return;

    try {
      await PanierService.syncLocalCartToDB(token);
      console.log('✅ Tentative de synchronisation terminée');
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation:', error);
      throw error;
    }
  };

  /**
   * ✅ Rafraîchir le panier (BDD ou localStorage)
   */
  const refreshCart = async () => {
    if (!mounted) {
      setCart(null);
      return;
    }

    try {
      setLoading(true);
      const cartData = await PanierService.getPanier(token);
      setCart(cartData);
    } catch (error) {
      setCart(null);
      if (isAuthenticated) {
        toast.error("Erreur lors du chargement du panier");
      }
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  /**
   * ✅ Ajouter au panier (BDD ou localStorage)
   */
  const addToCart = async (
    idProduit: number,
    quantite: number = 1,
    variationId?: number,
    produit?: any,
    variation?: any
  ) => {
    try {
      await PanierService.ajouterProduit(
        idProduit,
        quantite,
        variationId,
        token,
        produit,
        variation
      );
      await refreshCart();

      toast.success("Produit ajouté au panier");

      // 🔥 Tracker avec Meta Pixel
      const updatedCart = await PanierService.getPanier(token);
      const addedItem = updatedCart.produits.find((p) => p.idProduit === idProduit);

      if (addedItem) {
        fbq.event("AddToCart", {
          content_ids: [idProduit.toString()],
          content_name: addedItem.produit.nom || "Produit",
          content_type: "product",
          value: addedItem.prixUnitaire * quantite,
          currency: "TND",
          num_items: quantite,
        });
      }
    } catch (error: any) {
      const message = error.message || "Erreur lors de l'ajout au panier";
      toast.error(message);
      throw error;
    }
  };

  /**
   * ✅ Modifier la quantité (BDD ou localStorage)
   */
  const updateQuantity = async (idProduit: number, quantite: number, idProduitVariation?: number) => {
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

  /**
   * ✅ Retirer du panier (BDD ou localStorage)
   */
  const removeFromCart = async (
    idPanierProduit: number | undefined,
    idProduit: number,
    idProduitVariation?: number
  ) => {
    try {
      setActionLoadingItemId(idProduit);
      await PanierService.retirerProduit(idPanierProduit, token, idProduit, idProduitVariation);
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

  /**
   * ✅ Vider le panier (BDD ou localStorage)
   */
  const clearCart = async () => {
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
    try {
      await PanierService.viderPanier(token);
      await refreshCart();
    } catch (error: any) {
      const message = error.message || "Erreur lors du vidage du panier";
      toast.error(message);
      throw error;
    }
  };

  /**
   * ✅ MODIFIÉ : Synchroniser puis charger le panier à la connexion
   */
  useEffect(() => {
    const handleCartLoad = async () => {
      if (!mounted) return;

      if (isAuthenticated && token) {
        // ✅ Utilisateur connecté
        if (!syncDone) {
          // ✅ Synchroniser le panier local vers BDD (si non vide)
          try {
            await syncCartOnLogin();
            setSyncDone(true);
          } catch (error) {
            console.error('Erreur de synchronisation:', error);
          }
        }
        // ✅ Charger le panier depuis la BDD
        await refreshCart();
      } else {
        // ✅ Utilisateur non connecté → Charger depuis localStorage
        await refreshCart();
      }
    };

    handleCartLoad();
  }, [mounted, isAuthenticated, token]);

  /**
   * ✅ NOUVEAU : Réinitialiser syncDone à la déconnexion
   */
  useEffect(() => {
    if (!isAuthenticated) {
      setSyncDone(false);
    }
  }, [isAuthenticated]);

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