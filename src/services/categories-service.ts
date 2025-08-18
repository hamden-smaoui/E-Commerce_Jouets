const API_BASE_URL = 'http://localhost:3001/api/jouets';

interface Produit {
  idProduit: number;
  nom: string;
  prix: number;
}

interface Type {
  idType: number;
  nom: string;
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
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categorieData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create categorie');
      }

      const data = await response.json();
      return data.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error creating categorie: ${message}`);
    }
  }

  async getAllCategories(): Promise<CategorieResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch categories');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching categories: ${message}`);
    }
  }

  async getCategorieById(id: number): Promise<CategorieResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch categorie');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching categorie: ${message}`);
    }
  }

  async updateCategorie(id: number, categorieData: CategorieFormData): Promise<CategorieResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categorieData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update categorie');
      }

      const data = await response.json();
      return data.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error updating categorie: ${message}`);
    }
  }

  async deleteCategorie(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete categorie');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error deleting categorie: ${message}`);
    }
  }
}

export default new CategoriesService();