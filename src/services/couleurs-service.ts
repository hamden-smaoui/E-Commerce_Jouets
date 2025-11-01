import api from './api';

export interface Couleur {
  idCouleur: number;
  nom: string;
  ref?: string | null; // ✅ Ajout du champ ref
}

export interface CouleurFormData {
  nom: string;
  ref?: string | null; // ✅ Ajout du champ ref
}

class CouleursService {
  async createCouleur(couleurData: CouleurFormData, token?: string): Promise<Couleur> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post<Couleur>('/couleurs', couleurData, { headers });
    return response.data;
  }

  async getAllCouleurs(token?: string): Promise<Couleur[]> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<Couleur[]>('/couleurs', { headers });
    return response.data;
  }

  async getCouleurById(id: number, token?: string): Promise<Couleur> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<Couleur>(`/couleurs/${id}`, { headers });
    return response.data;
  }

  async updateCouleur(id: number, couleurData: CouleurFormData, token?: string): Promise<Couleur> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.put<Couleur>(`/couleurs/${id}`, couleurData, { headers });
    return response.data;
  }

  async deleteCouleur(id: number, token?: string): Promise<void> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await api.delete(`/couleurs/${id}`, { headers });
  }
}

export default new CouleursService();