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
  async createCategorie(categorieData: CategorieFormData): Promise<CategorieResponse> {
    const response = await api.post<{ data: CategorieResponse }>('/categories', categorieData);
    return response.data.data;
  }

  async getAllCategories(): Promise<CategorieResponse[]> {
    const response = await api.get<CategorieResponse[]>('/categories');
    return response.data;
  }

  async getCategorieById(id: number): Promise<CategorieResponse> {
    const response = await api.get<CategorieResponse>(`/categories/${id}`);
    return response.data;
  }

  async updateCategorie(id: number, categorieData: CategorieFormData): Promise<CategorieResponse> {
    const response = await api.put<{ data: CategorieResponse }>(`/categories/${id}`, categorieData);
    return response.data.data;
  }

  async deleteCategorie(id: number): Promise<void> {
    await api.delete(`/categories/${id}`);
  }
}

export default new CategoriesService();