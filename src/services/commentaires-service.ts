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
  async createCommentaire(commentaireData: CreateCommentaireData): Promise<Commentaire> {
    const response = await api.post<{ data: Commentaire }>('/commentaires', commentaireData);
    return response.data.data;
  }

  async getCommentairesByProduit(idProduit: number, page: number = 1, limit: number = 10): Promise<CommentairePagination> {
    const response = await api.get<CommentairePagination>(`/commentaires/produit/${idProduit}?page=${page}&limit=${limit}`);
    return response.data;
  }

  async updateCommentaire(idCommentaire: number, updateData: UpdateCommentaireData): Promise<Commentaire> {
    const response = await api.put<{ data: Commentaire }>(`/commentaires/${idCommentaire}`, updateData);
    return response.data.data;
  }

  async deleteCommentaire(idCommentaire: number): Promise<void> {
    await api.delete(`/commentaires/${idCommentaire}`);
  }

  async getCommentairesByUtilisateur(page: number = 1, limit: number = 10): Promise<CommentairePagination> {
    const response = await api.get<CommentairePagination>(`/commentaires/mes-commentaires?page=${page}&limit=${limit}`);
    return response.data;
  }
}

export default new CommentaireService();