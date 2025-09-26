import api from './api';

export interface Couleur {
  idCouleur: number;
  nom: string;
}
export interface CouleurFormData {
  nom: string;
}

class CouleursService {
  async createCouleur(couleurData: CouleurFormData): Promise<Couleur> {
    const response = await api.post<Couleur>('/couleurs', couleurData);
    return response.data;
  }

  async getAllCouleurs(): Promise<Couleur[]> {
    const response = await api.get<Couleur[]>('/couleurs');
    return response.data;
  }

  async getCouleurById(id: number): Promise<Couleur> {
    const response = await api.get<Couleur>(`/couleurs/${id}`);
    return response.data;
  }

  async updateCouleur(id: number, couleurData: CouleurFormData): Promise<Couleur> {
    const response = await api.put<Couleur>(`/couleurs/${id}`, couleurData);
    return response.data;
  }

  async deleteCouleur(id: number): Promise<void> {
    await api.delete(`/couleurs/${id}`);
  }
}

export default new CouleursService();