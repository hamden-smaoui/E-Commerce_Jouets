import api from './api';

export interface Fournisseur {
  idFournisseur: number;
  prenom: string;
  nom: string;
  email: string | null;
  telephone: string;
}

export interface FournisseurFormData {
  idFournisseur?: number | null;
  prenom: string;
  nom: string;
  email: string | null;
  telephone: string;
}

interface FournisseurResponse extends Fournisseur {}

class FournisseursService {
  async createFournisseur(formData: FournisseurFormData): Promise<FournisseurResponse> {
    const response = await api.post<{ data: FournisseurResponse }>('/fournisseurs', formData);
    return response.data.data;
  }

  async getAllFournisseurs(): Promise<FournisseurResponse[]> {
    const response = await api.get<FournisseurResponse[]>('/fournisseurs');
    return response.data;
  }

  async getFournisseurById(id: number): Promise<FournisseurResponse> {
    const response = await api.get<{ data: FournisseurResponse }>(`/fournisseurs/${id}`);
    return response.data.data;
  }

  async updateFournisseur(id: number, formData: FournisseurFormData): Promise<FournisseurResponse> {
    const response = await api.put<{ data: FournisseurResponse }>(`/fournisseurs/${id}`, formData);
    return response.data.data;
  }

  async deleteFournisseur(id: number): Promise<void> {
    await api.delete(`/fournisseurs/${id}`);
  }
}

export default new FournisseursService();