import api from './api';

export interface Taille {
  idTaille: number;
  nom: string;
}

export interface TailleFormData {
  nom: string;
}

class TaillesService {
  async createTaille(tailleData: TailleFormData, token?: string): Promise<Taille> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post<Taille>('/tailles', tailleData, { headers });
    return response.data;
  }

  async getAllTailles(token?: string): Promise<Taille[]> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<Taille[]>('/tailles', { headers });
    return response.data;
  }

  async getTailleById(id: number, token?: string): Promise<Taille> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<Taille>(`/tailles/${id}`, { headers });
    return response.data;
  }

  async updateTaille(id: number, tailleData: TailleFormData, token?: string): Promise<Taille> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.put<Taille>(`/tailles/${id}`, tailleData, { headers });
    return response.data;
  }

  async deleteTaille(id: number, token?: string): Promise<void> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await api.delete(`/tailles/${id}`, { headers });
  }
}

export default new TaillesService();