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
  async createAge(ageData: AgeFormData): Promise<Age> {
    const response = await api.post<Age>('/ages', ageData);
    return response.data;
  }

  async getAllAges(): Promise<Age[]> {
    const response = await api.get<Age[]>('/ages');
    return response.data;
  }

  async getAgeById(id: number): Promise<Age> {
    const response = await api.get<Age>(`/ages/${id}`);
    return response.data;
  }

  async updateAge(id: number, ageData: AgeFormData): Promise<Age> {
    const response = await api.put<Age>(`/ages/${id}`, ageData);
    return response.data;
  }

  async deleteAge(id: number): Promise<void> {
    await api.delete(`/ages/${id}`);
  }
}

export default new AgesService();