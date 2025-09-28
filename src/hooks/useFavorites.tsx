"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import FavoriService, { FavoriResponse } from "@/services/favoris-service";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const user = session?.userData;
  const token = session?.customToken;

  useEffect(() => {
    setMounted(true);
  }, []);

  const refreshFavorites = async () => {
    if (!mounted || !isAuthenticated || !user || !token) {
      setFavorites([]);
      return;
    }
    try {
      setLoading(true);
      const userId = user.idUtilisateur;
      if (userId) {
        const favoritesData = await FavoriService.getAllFavorisByUser(userId, token);
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
    if (!isAuthenticated || !user || !token) {
      toast.error("Vous devez être connecté pour ajouter aux favoris");
      router.push("/signIn");
      return;
    }
    try {
      const userId = user.idUtilisateur;
      if (!userId) {
        toast.error("Erreur d'authentification");
        return;
      }
      await FavoriService.addFavori({ idUtilisateur: userId, idProduit }, token);
      await refreshFavorites();
      toast.success("Produit ajouté aux favoris");
    } catch (error: any) {
      const message = error.message || "Erreur lors de l'ajout aux favoris";
      toast.error(message);
      throw error;
    }
  };

  const removeFromFavorites = async (idProduit: number) => {
    if (!isAuthenticated || !user || !token) {
      toast.error("Vous devez être connecté pour retirer des favoris");
      router.push("/signIn");
      return;
    }
    try {
      const favoriteItem = favorites.find(fav => fav.idProduit === idProduit);
      if (favoriteItem) {
        await FavoriService.deleteFavori(favoriteItem.idFavori, token);
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
    if (!isAuthenticated || !user || !token) {
      toast.error("Vous devez être connecté pour vider les favoris");
      router.push("/signIn");
      return;
    }
    try {
      const userId = user.idUtilisateur;
      if (userId) {
        await FavoriService.deleteAllFavorisByUser(userId, token);
        await refreshFavorites();
        toast.success("Favoris vidés");
      }
    } catch (error: any) {
      const message = error.message || "Erreur lors du vidage des favoris";
      toast.error(message);
    }
  };

  useEffect(() => {
    if (mounted && isAuthenticated && user && token) {
      refreshFavorites();
    } else if (mounted && !isAuthenticated) {
      setFavorites([]);
    }
  }, [mounted, isAuthenticated, user, token]);

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