const API_BASE_URL = 'http://localhost:3001/api/jouets';

export interface Couleur {
  idCouleur: number;
  nom: string;
}

export interface CouleurFormData {
  nom: string;
}

class CouleursService {
  async createCouleur(couleurData: CouleurFormData): Promise<Couleur> {
    try {
      const response = await fetch(`${API_BASE_URL}/couleurs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(couleurData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create couleur');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error creating couleur: ${message}`);
    }
  }

  async getAllCouleurs(): Promise<Couleur[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/couleurs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch couleurs');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching couleurs: ${message}`);
    }
  }

  async getCouleurById(id: number): Promise<Couleur> {
    try {
      const response = await fetch(`${API_BASE_URL}/couleurs/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch couleur');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching couleur: ${message}`);
    }
  }

  async updateCouleur(id: number, couleurData: CouleurFormData): Promise<Couleur> {
    try {
      const response = await fetch(`${API_BASE_URL}/couleurs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(couleurData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update couleur');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error updating couleur: ${message}`);
    }
  }

  async deleteCouleur(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/couleurs/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete couleur');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error deleting couleur: ${message}`);
    }
  }
}

export default new CouleursService();