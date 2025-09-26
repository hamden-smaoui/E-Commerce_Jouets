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
  async createType(typeData: TypeFormData): Promise<TypeResponse> {
    const response = await api.post<{ data: TypeResponse }>('/types', typeData);
    return response.data.data;
  }

  async getAllTypes(): Promise<TypeResponse[]> {
    const response = await api.get<TypeResponse[]>('/types');
    return response.data;
  }

  async getTypeById(id: number): Promise<TypeResponse> {
    const response = await api.get<TypeResponse>(`/types/${id}`);
    return response.data;
  }

  async updateType(id: number, typeData: TypeFormData): Promise<TypeResponse> {
    const response = await api.put<{ data: TypeResponse }>(`/types/${id}`, typeData);
    return response.data.data;
  }

  async deleteType(id: number): Promise<void> {
    await api.delete(`/types/${id}`);
  }
}

export default new TypesService();