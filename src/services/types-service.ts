import api from './api';

interface Categorie {
  idCategorie: number;
  nom: string;
}

export interface Type {
  idType: number;
  nom: string;
  description: string | null;
}

export interface TypeFormData {
  idType?: number | null;
  nom: string;
  description: string | null;
  categorieIds?: number[];
}

export interface TypeResponse extends Type {
  categories?: Categorie[];
}

class TypesService {
  async createType(typeData: TypeFormData, token?: string): Promise<TypeResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post<{ data: TypeResponse }>('/types', typeData, { headers });
    return response.data.data;
  }

  async getAllTypes(token?: string): Promise<TypeResponse[]> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<TypeResponse[]>('/types', { headers });
    return response.data;
  }

  async getTypeById(id: number, token?: string): Promise<TypeResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<TypeResponse>(`/types/${id}`, { headers });
    return response.data;
  }

  async updateType(id: number, typeData: TypeFormData, token?: string): Promise<TypeResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.put<{ data: TypeResponse }>(`/types/${id}`, typeData, { headers });
    return response.data.data;
  }

  async deleteType(id: number, token?: string): Promise<void> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await api.delete(`/types/${id}`, { headers });
  }
}

export default new TypesService();