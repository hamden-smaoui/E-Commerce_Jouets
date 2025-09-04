import authService from './auth-service';

// Base URL for the API
const API_BASE_URL = 'http://localhost:3001/api/jouets';

// Interface for Commande (Order) as included in the backend response
interface Commande {
  idCommande: number;
  dateCommande: string;
  statut: string;
}

export interface User {
  idUtilisateur: number;
  prenom: string;
  nom: string;
  email?: string;
  motDePasse?: string;
  telephone: string;
  adresseRue?: string;
  adresseVille?: string;
  adresseCodePostal?: string;
  adressePays?: string;
  role: 'admin' | 'client' | null;
}

export interface FormData {
  idUtilisateur: number | null;
  prenom: string;
  nom: string;
  email?: string;
  motDePasse?: string;
  telephone: string;
  adresseRue?: string;
  adresseVille?: string;
  adresseCodePostal?: string;
  adressePays?: string;
  role: 'admin' | 'client' | null;
}

// Interface for API response user data (including commandes)
interface UserResponse extends User {
  commandes?: Commande[];
}

// UsersService class to handle API calls
class UsersService {
  private getHeaders(): HeadersInit {
    return authService.getAuthHeaders();
  }

  // Create a new user
  async createUser(userData: FormData): Promise<UserResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/utilisateurs`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }

      const data = await response.json();
      return data.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error creating user: ${message}`);
    }
  }

  // Get all users with their orders
  async getAllUsers(): Promise<UserResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/utilisateurs`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch users');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching users: ${message}`);
    }
  }

  // Get a user by ID with their orders
  async getUserById(id: number): Promise<UserResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/utilisateurs/${id}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching user: ${message}`);
    }
  }

  // Update a user
  async updateUser(id: number, userData: FormData): Promise<UserResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/utilisateurs/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

      const data = await response.json();
      return data.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error updating user: ${message}`);
    }
  }

  // Delete a user
  async deleteUser(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/utilisateurs/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error deleting user: ${message}`);
    }
  }
}

export default new UsersService();