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
  async createFournisseur(formData: FournisseurFormData, token?: string): Promise<FournisseurResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post<{ data: FournisseurResponse }>('/fournisseurs', formData, { headers });
    return response.data.data;
  }

  async getAllFournisseurs(token?: string): Promise<FournisseurResponse[]> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<FournisseurResponse[]>('/fournisseurs', { headers });
    return response.data;
  }

  async getFournisseurById(id: number, token?: string): Promise<FournisseurResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<{ data: FournisseurResponse }>(`/fournisseurs/${id}`, { headers });
    return response.data.data;
  }

  async updateFournisseur(id: number, formData: FournisseurFormData, token?: string): Promise<FournisseurResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.put<{ data: FournisseurResponse }>(`/fournisseurs/${id}`, formData, { headers });
    return response.data.data;
  }

  async deleteFournisseur(id: number, token?: string): Promise<void> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await api.delete(`/fournisseurs/${id}`, { headers });
  }
}

export default new FournisseursService();