import api from './api';

export interface Age {
  idAge: number;
  minAge: number;
  maxAge: number;
  typeAge: 'mois' | 'ans';
  label: string;
}

export interface AgeFormData {
  minAge: number;
  maxAge: number;
  typeAge: 'mois' | 'ans';
  label: string;
}

class AgesService {
  async createAge(ageData: AgeFormData, token?: string): Promise<Age> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post<Age>('/ages', ageData, { headers });
    return response.data;
  }
  async getAllAges(token?: string): Promise<Age[]> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<Age[]>('/ages', { headers });
    return response.data;
  }
  async getAgeById(id: number, token?: string): Promise<Age> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<Age>(`/ages/${id}`, { headers });
    return response.data;
  }
  async updateAge(id: number, ageData: AgeFormData, token?: string): Promise<Age> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.put<Age>(`/ages/${id}`, ageData, { headers });
    return response.data;
  }
  async deleteAge(id: number, token?: string): Promise<void> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await api.delete(`/ages/${id}`, { headers });
  }
}
export default new AgesService();