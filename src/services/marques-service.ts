const API_BASE_URL = 'http://localhost:3001/api/jouets';

// Interface for Produit as included in the backend response
interface Produit {
  idProduit: number;
  nom: string;
  prix: number;
}

// Interface for Marque as stored in the database
export interface Marque {
  idMarque: number;
  nom: string;
  description: string | null;
  logoUrl: string | null;
}

// Interface for form data (used for front-end form state)
export interface MarqueFormData {
  idMarque?: number | null;
  nom: string;
  description: string | null;
  logo: File | string | null;
}

// Interface for API response marque data (including produits)
interface MarqueResponse extends Marque {
  produits?: Produit[];
}

// MarquesService class to handle API calls
class MarquesService {
  // Create a new marque
  async createMarque(formData: globalThis.FormData): Promise<MarqueResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/marques`, {
        method: 'POST',
        body: formData, // No Content-Type header; browser sets multipart/form-data automatically
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de la création de la marque');
      }

      const data = await response.json();
      // Retourner directement data si c'est la structure correcte, sinon data.data
      return data.data || data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(`Erreur lors de la création de la marque: ${message}`);
    }
  }

  // Get all marques with their products
  async getAllMarques(): Promise<MarqueResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/marques`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de la récupération des marques');
      }

      const data = await response.json();
      // Retourner directement data si c'est un tableau, sinon data.data
      return Array.isArray(data) ? data : (data.data || []);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(`Erreur lors de la récupération des marques: ${message}`);
    }
  }

  // Get a marque by ID with its products
  async getMarqueById(id: number): Promise<MarqueResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/marques/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de la récupération de la marque');
      }

      const data = await response.json();
      // Retourner directement data si c'est la structure correcte, sinon data.data
      return data.data || data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(`Erreur lors de la récupération de la marque: ${message}`);
    }
  }

  // Update a marque
  async updateMarque(id: number, formData: globalThis.FormData): Promise<MarqueResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/marques/${id}`, {
        method: 'PUT',
        body: formData, // No Content-Type header; browser sets multipart/form-data automatically
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de la mise à jour de la marque');
      }

      const data = await response.json();
      // Retourner directement data si c'est la structure correcte, sinon data.data
      return data.data || data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(`Erreur lors de la mise à jour de la marque: ${message}`);
    }
  }

  // Delete a marque
  async deleteMarque(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/marques/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de la suppression de la marque');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(`Erreur lors de la suppression de la marque: ${message}`);
    }
  }
}

export default new MarquesService();