const API_BASE_URL = 'http://localhost:3001/api/jouets';

export interface Taille {
  idTaille: number;
  nom: string;
}

export interface TailleFormData {
  nom: string;
}

class TaillesService {
  async createTaille(tailleData: TailleFormData): Promise<Taille> {
    try {
      const response = await fetch(`${API_BASE_URL}/tailles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tailleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create taille');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error creating taille: ${message}`);
    }
  }

  async getAllTailles(): Promise<Taille[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/tailles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch tailles');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching tailles: ${message}`);
    }
  }

  async getTailleById(id: number): Promise<Taille> {
    try {
      const response = await fetch(`${API_BASE_URL}/tailles/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch taille');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching taille: ${message}`);
    }
  }

  async updateTaille(id: number, tailleData: TailleFormData): Promise<Taille> {
    try {
      const response = await fetch(`${API_BASE_URL}/tailles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tailleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update taille');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error updating taille: ${message}`);
    }
  }

  async deleteTaille(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/tailles/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete taille');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error deleting taille: ${message}`);
    }
  }
}

export default new TaillesService();