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
  async createMarque(formData: FormData): Promise<MarqueResponse> {
    const response = await api.post<{ data: MarqueResponse }>('/marques', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  }

  async getAllMarques(): Promise<MarqueResponse[]> {
    const response = await api.get<MarqueResponse[]>('/marques');
    return response.data;
  }

  async getMarqueById(id: number): Promise<MarqueResponse> {
    const response = await api.get<{ data: MarqueResponse }>(`/marques/${id}`);
    return response.data.data;
  }

  async updateMarque(id: number, formData: FormData): Promise<MarqueResponse> {
    const response = await api.put<{ data: MarqueResponse }>(`/marques/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  }

  async deleteMarque(id: number): Promise<void> {
    await api.delete(`/marques/${id}`);
  }
}

export default new MarquesService();