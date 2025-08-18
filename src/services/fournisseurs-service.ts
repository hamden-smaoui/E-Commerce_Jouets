const API_BASE_URL = 'http://localhost:3001/api/jouets';

// Interface for Fournisseur as stored in the database
export interface Fournisseur {
  idFournisseur: number;
  prenom: string;
  nom: string;
  email: string | null;
  telephone: string;
}

// Interface for form data (used for front-end form state)
export interface FournisseurFormData {
  idFournisseur?: number | null;
  prenom: string;
  nom: string;
  email: string | null;
  telephone: string;
}

// Interface for API response fournisseur data
interface FournisseurResponse extends Fournisseur {}

// FournisseursService class to handle API calls
class FournisseursService {
  // Create a new fournisseur
  async createFournisseur(formData: FournisseurFormData): Promise<FournisseurResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/fournisseurs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de la création du fournisseur');
      }

      const data = await response.json();
      // Retourner directement data si c'est la structure correcte, sinon data.data
      return data.data || data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(`Erreur lors de la création du fournisseur: ${message}`);
    }
  }

  // Get all fournisseurs
  async getAllFournisseurs(): Promise<FournisseurResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/fournisseurs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de la récupération des fournisseurs');
      }

      const data = await response.json();
      // Retourner directement data si c'est un tableau, sinon data.data
      return Array.isArray(data) ? data : (data.data || []);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(`Erreur lors de la récupération des fournisseurs: ${message}`);
    }
  }

  // Get a fournisseur by ID
  async getFournisseurById(id: number): Promise<FournisseurResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/fournisseurs/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de la récupération du fournisseur');
      }

      const data = await response.json();
      // Retourner directement data si c'est la structure correcte, sinon data.data
      return data.data || data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(`Erreur lors de la récupération du fournisseur: ${message}`);
    }
  }

  // Update a fournisseur
  async updateFournisseur(id: number, formData: FournisseurFormData): Promise<FournisseurResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/fournisseurs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de la mise à jour du fournisseur');
      }

      const data = await response.json();
      // Retourner directement data si c'est la structure correcte, sinon data.data
      return data.data || data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(`Erreur lors de la mise à jour du fournisseur: ${message}`);
    }
  }

  // Delete a fournisseur
  async deleteFournisseur(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/fournisseurs/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de la suppression du fournisseur');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(`Erreur lors de la suppression du fournisseur: ${message}`);
    }
  }
}

export default new FournisseursService();