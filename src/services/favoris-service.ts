import api from './api';
import { ProduitVariation } from './produits-service';
interface Marque {
  idMarque: number;
  nom: string;
}
interface Categorie {
  idCategorie: number;
  nom: string;
}
interface ProductImage {
  idImage: number;
  url: string;
  rang: number;
}
interface Produit {
  idProduit: number;
  nom: string;
  prix: number;
  description?: string;
  quantiteStock: number;
  images?: ProductImage[];
  marque?: Marque;
  categorie?: Categorie;
  variations?: ProduitVariation[];
}

export interface Favori {
  idFavori: number;
  idUtilisateur: number;
  idProduit: number;
}
export interface FavoriFormData {
  idUtilisateur: number;
  idProduit: number;
}
export interface FavoriResponse extends Favori {
  produit?: Produit;
}

class FavoriService {
  async addFavori(favoriData: FavoriFormData, token?: string): Promise<FavoriResponse> {
    if (!token) throw new Error("Utilisateur non authentifié");
    const response = await api.post<{ data: FavoriResponse }>('/favoris', favoriData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  }

  async getAllFavorisByUser(idUtilisateur: number, token?: string): Promise<FavoriResponse[]> {
    if (!token) throw new Error("Utilisateur non authentifié");
    const response = await api.get<FavoriResponse[]>(`/favoris/user/${idUtilisateur}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async deleteFavori(idFavori: number, token?: string): Promise<void> {
    if (!token) throw new Error("Utilisateur non authentifié");
    await api.delete(`/favoris/${idFavori}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  async deleteAllFavorisByUser(idUtilisateur: number, token?: string): Promise<void> {
    if (!token) throw new Error("Utilisateur non authentifié");
    await api.delete(`/favoris/user/${idUtilisateur}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}

export default new FavoriService();