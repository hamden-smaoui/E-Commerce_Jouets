const API_BASE_URL = 'http://localhost:3001/api/jouets';

export interface Age {
  idAge: number;
  minAge: number;
  maxAge: number;
  typeAge: 'mois' | 'ans';
  label: string;
}

export interface AgeFormData {
  minAge: number;
  maxAge: number;
  typeAge: 'mois' | 'ans';
  label: string;
}

class AgesService {
  async createAge(ageData: AgeFormData): Promise<Age> {
    try {
      const response = await fetch(`${API_BASE_URL}/ages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ageData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create age');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error creating age: ${message}`);
    }
  }

  async getAllAges(): Promise<Age[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/ages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch ages');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching ages: ${message}`);
    }
  }

  async getAgeById(id: number): Promise<Age> {
    try {
      const response = await fetch(`${API_BASE_URL}/ages/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch age');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching age: ${message}`);
    }
  }

  async updateAge(id: number, ageData: AgeFormData): Promise<Age> {
    try {
      const response = await fetch(`${API_BASE_URL}/ages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ageData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update age');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error updating age: ${message}`);
    }
  }

  async deleteAge(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/ages/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete age');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error deleting age: ${message}`);
    }
  }
}

export default new AgesService();