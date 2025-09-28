import api from './api';

interface Produit {
  idProduit: number;
  nom: string;
  prix: number;
}

export interface Marque {
  idMarque: number;
  nom: string;
  description: string | null;
  logoUrl: string | null;
}

export interface MarqueFormData {
  idMarque?: number | null;
  nom: string;
  description: string | null;
  logo: File | string | null;
}

interface MarqueResponse extends Marque {
  produits?: Produit[];
}

class MarquesService {
  async createMarque(formData: FormData,token?: string): Promise<MarqueResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post<{ data: MarqueResponse }>('/marques', formData, { headers });
    return response.data.data;
  }

 async getAllMarques(token?: string): Promise<MarqueResponse[]> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<MarqueResponse[]>('/marques', { headers });
    return response.data;
  }

  async getMarqueById(id: number,token?: string): Promise<MarqueResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<{ data: MarqueResponse }>(`/marques/${id}`, { headers });
    return response.data.data;
  }

  async updateMarque(id: number, formData: FormData,token?: string): Promise<MarqueResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.put<{ data: MarqueResponse }>(`/marques/${id}`, formData,{ headers });
    return response.data.data;
  }

  async deleteMarque(id: number,token?: string): Promise<void> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await api.delete(`/marques/${id}`, { headers });
  }
}

export default new MarquesService();