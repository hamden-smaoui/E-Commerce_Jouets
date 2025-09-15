const API_BASE_URL = 'http://localhost:3001/api';

export interface Commentaire {
  idCommentaire: number;
  idUtilisateur: number;
  idProduit: number;
  contenu: string;
  createdAt: string;
  updatedAt: string;
  utilisateur: {
    idUtilisateur: number;
    prenom: string;
    nom: string;
  };
}

export interface CommentairePagination {
  data: Commentaire[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CreateCommentaireData {
  idProduit: number;
  contenu: string;
}

export interface UpdateCommentaireData {
  contenu: string;
}

class CommentaireService {
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

  // Créer un commentaire
  async createCommentaire(commentaireData: CreateCommentaireData): Promise<Commentaire> {
    try {
      const response = await fetch(`${API_BASE_URL}/commentaires`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(commentaireData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create commentaire');
      }

      const data = await response.json();
      return data.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error creating commentaire: ${message}`);
    }
  }

  // Récupérer les commentaires d'un produit avec pagination
  async getCommentairesByProduit(idProduit: number, page: number = 1, limit: number = 10): Promise<CommentairePagination> {
    try {
      const response = await fetch(`${API_BASE_URL}/commentaires/produit/${idProduit}?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch commentaires');
      }

      return await response.json();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching commentaires: ${message}`);
    }
  }

  // Mettre à jour un commentaire
  async updateCommentaire(idCommentaire: number, updateData: UpdateCommentaireData): Promise<Commentaire> {
    try {
      const response = await fetch(`${API_BASE_URL}/commentaires/${idCommentaire}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update commentaire');
      }

      const data = await response.json();
      return data.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error updating commentaire: ${message}`);
    }
  }

  // Supprimer un commentaire
  async deleteCommentaire(idCommentaire: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/commentaires/${idCommentaire}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete commentaire');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error deleting commentaire: ${message}`);
    }
  }

  // Récupérer les commentaires de l'utilisateur connecté
  async getCommentairesByUtilisateur(page: number = 1, limit: number = 10): Promise<CommentairePagination> {
    try {
      const response = await fetch(`${API_BASE_URL}/commentaires/mes-commentaires?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user commentaires');
      }

      return await response.json();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching user commentaires: ${message}`);
    }
  }
}

export default new CommentaireService();