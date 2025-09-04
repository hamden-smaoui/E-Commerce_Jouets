"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import FavoriService, { FavoriResponse } from "@/services/favoris-service";
import { useAuth } from "./useAuth";
import { toast } from "react-hot-toast";

interface FavoritesContextType {
  favorites: FavoriResponse[];
  loading: boolean;
  addToFavorites: (idProduit: number) => Promise<void>;
  removeFromFavorites: (idProduit: number) => Promise<void>;
  isFavorite: (idProduit: number) => boolean;
  clearFavorites: () => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const refreshFavorites = async () => {
    if (!mounted || !isAuthenticated || !user) {
      setFavorites([]);
      return;
    }

    try {
      setLoading(true);
      // Use the correct user ID property from your auth system
      const userId = user.idUtilisateur ;
      if (userId) {
        const favoritesData = await FavoriService.getAllFavorisByUser(userId);
        setFavorites(favoritesData);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des favoris:", error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (idProduit: number) => {
    if (!isAuthenticated || !user) {
      toast.error("Vous devez être connecté pour ajouter aux favoris");
      return;
    }

    try {
      const userId = user.idUtilisateur ;
      if (!userId) {
        toast.error("Erreur d'authentification");
        return;
      }

      await FavoriService.addFavori({
        idUtilisateur: userId,
        idProduit: idProduit
      });
      await refreshFavorites();
      toast.success("Produit ajouté aux favoris");
    } catch (error: any) {
      const message = error.message || "Erreur lors de l'ajout aux favoris";
      toast.error(message);
      throw error;
    }
  };

  const removeFromFavorites = async (idProduit: number) => {
    try {
      const favoriteItem = favorites.find(fav => fav.idProduit === idProduit);
      if (favoriteItem) {
        await FavoriService.deleteFavori(favoriteItem.idFavori);
        await refreshFavorites();
        toast.success("Produit retiré des favoris");
      }
    } catch (error: any) {
      const message = error.message || "Erreur lors de la suppression des favoris";
      toast.error(message);
      throw error;
    }
  };

  const isFavorite = (idProduit: number): boolean => {
    return favorites.some(fav => fav.idProduit === idProduit);
  };

  const clearFavorites = async () => {
    if (!user) return;
    
    try {
      const userId = user.idUtilisateur ;
      if (userId) {
        await FavoriService.deleteAllFavorisByUser(userId);
        await refreshFavorites();
        toast.success("Favoris vidés");
      }
    } catch (error: any) {
      const message = error.message || "Erreur lors du vidage des favoris";
      toast.error(message);
    }
  };

  useEffect(() => {
    if (mounted && isAuthenticated && user) {
      refreshFavorites();
    } else if (mounted && !isAuthenticated) {
      setFavorites([]);
    }
  }, [mounted, isAuthenticated, user]);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        clearFavorites,
        refreshFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}