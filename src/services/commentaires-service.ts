import api from './api';

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
  async createCommentaire(commentaireData: CreateCommentaireData, token?: string): Promise<Commentaire> {
    const response = await api.post<{ data: Commentaire }>('/commentaires', commentaireData, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data.data;
  }

  async getCommentairesByProduit(idProduit: number, page: number = 1, limit: number = 10): Promise<CommentairePagination> {
    const response = await api.get<CommentairePagination>(`/commentaires/produit/${idProduit}?page=${page}&limit=${limit}`);
    return response.data;
  }

  async updateCommentaire(idCommentaire: number, updateData: UpdateCommentaireData, token?: string): Promise<Commentaire> {
    const response = await api.put<{ data: Commentaire }>(`/commentaires/${idCommentaire}`, updateData, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data.data;
  }

  async deleteCommentaire(idCommentaire: number, token?: string): Promise<void> {
    await api.delete(`/commentaires/${idCommentaire}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async getCommentairesByUtilisateur(page: number = 1, limit: number = 10, token?: string): Promise<CommentairePagination> {
    const response = await api.get<CommentairePagination>(`/commentaires/mes-commentaires?page=${page}&limit=${limit}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  }
}

export default new CommentaireService();