const API_BASE_URL = 'http://localhost:3001/api/favoris';

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
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  }

  async addFavori(favoriData: FavoriFormData): Promise<FavoriResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(favoriData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add favori');
      }

      const data = await response.json();
      return data.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error adding favori: ${message}`);
    }
  }

  async getAllFavorisByUser(idUtilisateur: number): Promise<FavoriResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${idUtilisateur}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch favoris');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching favoris: ${message}`);
    }
  }

  async deleteFavori(idFavori: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/${idFavori}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete favori');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error deleting favori: ${message}`);
    }
  }

  async deleteAllFavorisByUser(idUtilisateur: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${idUtilisateur}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete all favoris');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error deleting all favoris: ${message}`);
    }
  }
}

export default new FavoriService();