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
  async createReclamation(reclamationData: ReclamationFormData, token?: string): Promise<ReclamationResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post<{ data: ReclamationResponse }>(
      '/reclamations',
      reclamationData,
      { headers }
    );
    return response.data.data;
  }

  async getAllReclamations(token?: string): Promise<ReclamationResponse[]> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<ReclamationResponse[]>('/reclamations', { headers });
    return response.data;
  }

  async getReclamationById(id: number, token?: string): Promise<ReclamationResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<ReclamationResponse>(`/reclamations/${id}`, { headers });
    return response.data;
  }

  async updateReclamation(id: number, reclamationData: ReclamationFormData, token?: string): Promise<ReclamationResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.put<{ data: ReclamationResponse }>(
      `/reclamations/${id}`,
      reclamationData,
      { headers }
    );
    return response.data.data;
  }

  async deleteReclamation(id: number, token?: string): Promise<void> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await api.delete(`/reclamations/${id}`, { headers });
  }

  async getReclamationsByUser(idUtilisateur: number, token?: string): Promise<ReclamationResponse[]> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<ReclamationResponse[]>(`/reclamations/user/${idUtilisateur}`, { headers });
    return response.data;
  }
}

export default new ReclamationService();