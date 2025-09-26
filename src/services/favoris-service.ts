import api from './api';

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
  async addFavori(favoriData: FavoriFormData): Promise<FavoriResponse> {
    const response = await api.post<{ data: FavoriResponse }>('/favoris', favoriData);
    return response.data.data;
  }

  async getAllFavorisByUser(idUtilisateur: number): Promise<FavoriResponse[]> {
    const response = await api.get<FavoriResponse[]>(`/favoris/user/${idUtilisateur}`);
    return response.data;
  }

  async deleteFavori(idFavori: number): Promise<void> {
    await api.delete(`/favoris/${idFavori}`);
  }

  async deleteAllFavorisByUser(idUtilisateur: number): Promise<void> {
    await api.delete(`/favoris/user/${idUtilisateur}`);
  }
}

export default new FavoriService();