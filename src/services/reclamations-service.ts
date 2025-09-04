const API_BASE_URL = 'http://localhost:3001/api';

export interface ReclamationFormData {
  sujet: string;
  message: string;
  statut?: 'en_attente' | 'en_cours' | 'resolue' | 'fermee';
  idUtilisateur?: number;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
}

export interface ReclamationResponse {
  idReclamation: number;
  sujet: string;
  message: string;
  statut: 'en_attente' | 'en_cours' | 'resolue' | 'fermee';
  createdAt: string;
  updatedAt: string;
  idUtilisateur: number;
  utilisateur?: UtilisateurInfo;

}
export interface UtilisateurInfo {
  idUtilisateur: number;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
}
class ReclamationService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  }

  async createReclamation(reclamationData: ReclamationFormData): Promise<ReclamationResponse> {
    console.log('Creating reclamation with data:', reclamationData);
    try {
      const response = await fetch(`${API_BASE_URL}/reclamations`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(reclamationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de la création de la réclamation');
      }

      const data = await response.json();
      return data.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Une erreur inconnue s\'est produite';
      throw new Error(`Erreur lors de la création de la réclamation : ${message}`);
    }
  }

  async getAllReclamations(): Promise<ReclamationResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/reclamations`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de la récupération des réclamations');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Une erreur inconnue s\'est produite';
      throw new Error(`Erreur lors de la récupération des réclamations : ${message}`);
    }
  }

  async getReclamationById(id: number): Promise<ReclamationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/reclamations/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de la récupération de la réclamation');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Une erreur inconnue s\'est produite';
      throw new Error(`Erreur lors de la récupération de la réclamation : ${message}`);
    }
  }

  async updateReclamation(id: number, reclamationData: ReclamationFormData): Promise<ReclamationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/reclamations/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(reclamationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de la mise à jour de la réclamation');
      }

      const data = await response.json();
      return data.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Une erreur inconnue s\'est produite';
      throw new Error(`Erreur lors de la mise à jour de la réclamation : ${message}`);
    }
  }

  async deleteReclamation(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/reclamations/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de la suppression de la réclamation');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Une erreur inconnue s\'est produite';
      throw new Error(`Erreur lors de la suppression de la réclamation : ${message}`);
    }
  }

  async getReclamationsByUser(idUtilisateur: number): Promise<ReclamationResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/reclamations/user/${idUtilisateur}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de la récupération des réclamations de l\'utilisateur');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Une erreur inconnue s\'est produite';
      throw new Error(`Erreur lors de la récupération des réclamations de l\'utilisateur : ${message}`);
    }
  }
}

export default new ReclamationService();