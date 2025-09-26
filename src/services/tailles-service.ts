import api from './api';

export interface Taille {
  idTaille: number;
  nom: string;
}

export interface TailleFormData {
  nom: string;
}

class TaillesService {
  async createTaille(tailleData: TailleFormData): Promise<Taille> {
    const response = await api.post<Taille>('/tailles', tailleData);
    return response.data;
  }

  async getAllTailles(): Promise<Taille[]> {
    const response = await api.get<Taille[]>('/tailles');
    return response.data;
  }

  async getTailleById(id: number): Promise<Taille> {
    const response = await api.get<Taille>(`/tailles/${id}`);
    return response.data;
  }

  async updateTaille(id: number, tailleData: TailleFormData): Promise<Taille> {
    const response = await api.put<Taille>(`/tailles/${id}`, tailleData);
    return response.data;
  }

  async deleteTaille(id: number): Promise<void> {
    await api.delete(`/tailles/${id}`);
  }
}

export default new TaillesService();