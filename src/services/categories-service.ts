import api from './api';

interface Produit {
  idProduit: number;
  nom: string;
  prix: number;
}

interface Type {
  idType: number;
  nom: string;
  description: string | null;
}

export interface Categorie {
  idCategorie: number;
  nom: string;
  description: string | null;
}

export interface CategorieFormData {
  idCategorie?: number | null;
  nom: string;
  description: string | null;
  typeIds?: number[];
}

interface CategorieResponse extends Categorie {
  produits?: Produit[];
  types?: Type[];
}

class CategoriesService {
  async createCategorie(categorieData: CategorieFormData, token?: string): Promise<CategorieResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post<{ data: CategorieResponse }>('/categories', categorieData, { headers });
    return response.data.data;
  }

  async getAllCategories(token?: string): Promise<CategorieResponse[]> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<CategorieResponse[]>('/categories', { headers });
    return response.data;
  }

  async getCategorieById(id: number, token?: string): Promise<CategorieResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<CategorieResponse>(`/categories/${id}`, { headers });
    return response.data;
  }

  async updateCategorie(id: number, categorieData: CategorieFormData, token?: string): Promise<CategorieResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.put<{ data: CategorieResponse }>(`/categories/${id}`, categorieData, { headers });
    return response.data.data;
  }

  async deleteCategorie(id: number, token?: string): Promise<void> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await api.delete(`/categories/${id}`, { headers });
  }
}

export default new CategoriesService();