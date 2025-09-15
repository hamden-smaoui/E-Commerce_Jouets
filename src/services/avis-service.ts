const API_BASE_URL = 'http://localhost:3001/api';

export interface Avis {
  idAvis: number;
  idUtilisateur: number;
  idProduit: number;
  note: number;
  createdAt: string;
  updatedAt: string;
  utilisateur: {
    idUtilisateur: number;
    prenom: string;
    nom: string;
  };
}

export interface AvisStatistiques {
  totalAvis: number;
  moyenneNote: number;
  repartition: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface CreateAvisData {
  idProduit: number;
  note: number;
}

class AvisService {
  // Récupérer le token d'authentification
  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  // Headers avec authentification
  private getAuthHeaders() {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Créer ou mettre à jour un avis
  async createOrUpdateAvis(avisData: CreateAvisData): Promise<Avis> {
    try {
      const response = await fetch(`${API_BASE_URL}/avis`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(avisData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create/update avis');
      }

      const data = await response.json();
      return data.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error creating/updating avis: ${message}`);
    }
  }

  // Récupérer tous les avis d'un produit
  async getAvisByProduit(idProduit: number): Promise<Avis[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/avis/produit/${idProduit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch avis');
      }

      return await response.json();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching avis: ${message}`);
    }
  }

  // Récupérer les statistiques des avis
  async getAvisStatistiques(idProduit: number): Promise<AvisStatistiques> {
    try {
      const response = await fetch(`${API_BASE_URL}/avis/statistiques/${idProduit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch statistics');
      }

      return await response.json();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching statistics: ${message}`);
    }
  }

  // Récupérer l'avis de l'utilisateur connecté pour un produit
  async getMonAvis(idProduit: number): Promise<Avis | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/avis/mon-avis/${idProduit}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user avis');
      }

      return await response.json();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching user avis: ${message}`);
    }
  }

  // Supprimer un avis
  async deleteAvis(idAvis: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/avis/${idAvis}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete avis');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error deleting avis: ${message}`);
    }
  }
}

export default new AvisService();