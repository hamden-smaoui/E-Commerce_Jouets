import api from './api';

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

export interface UtilisateurInfo {
  idUtilisateur: number;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
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

class ReclamationService {
  async createReclamation(reclamationData: ReclamationFormData): Promise<ReclamationResponse> {
    const response = await api.post<{ data: ReclamationResponse }>('/reclamations', reclamationData);
    return response.data.data;
  }

  async getAllReclamations(): Promise<ReclamationResponse[]> {
    const response = await api.get<ReclamationResponse[]>('/reclamations');
    return response.data;
  }

  async getReclamationById(id: number): Promise<ReclamationResponse> {
    const response = await api.get<ReclamationResponse>(`/reclamations/${id}`);
    return response.data;
  }

  async updateReclamation(id: number, reclamationData: ReclamationFormData): Promise<ReclamationResponse> {
    const response = await api.put<{ data: ReclamationResponse }>(`/reclamations/${id}`, reclamationData);
    return response.data.data;
  }

  async deleteReclamation(id: number): Promise<void> {
    await api.delete(`/reclamations/${id}`);
  }

  async getReclamationsByUser(idUtilisateur: number): Promise<ReclamationResponse[]> {
    const response = await api.get<ReclamationResponse[]>(`/reclamations/user/${idUtilisateur}`);
    return response.data;
  }
}

export default new ReclamationService();