const API_BASE_URL = 'http://localhost:3001/api/jouets';

interface Categorie {
  idCategorie: number;
  nom: string;
}

export interface Type {
  idType: number;
  nom: string;
  description: string | null;
  
}

export interface TypeFormData {
  idType?: number | null;
  nom: string;
  description: string | null;
  categorieIds?: number[];
}

export interface TypeResponse extends Type {
  categories?: Categorie[];
}

class TypesService {
  async createType(typeData: TypeFormData): Promise<TypeResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/types`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(typeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create type');
      }

      const data = await response.json();
      return data.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error creating type: ${message}`);
    }
  }

  async getAllTypes(): Promise<TypeResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/types`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch types');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching types: ${message}`);
    }
  }

  async getTypeById(id: number): Promise<TypeResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/types/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch type');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching type: ${message}`);
    }
  }

  async updateType(id: number, typeData: TypeFormData): Promise<TypeResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/types/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(typeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update type');
      }

      const data = await response.json();
      return data.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error updating type: ${message}`);
    }
  }

  async deleteType(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/types/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete type');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error deleting type: ${message}`);
    }
  }
}

export default new TypesService();