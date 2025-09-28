import api from './api';

export interface Avis {
  idAvis: number;
  idUtilisateur: number;
  idProduit: number;
  note: number;
  createdAt: string;
  updatedAt: string;
  utilisateur: {
    idUtilisateur: number;
    prenom: string;
    nom: string;
  };
}

export interface AvisStatistiques {
  totalAvis: number;
  moyenneNote: number;
  repartition: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface CreateAvisData {
  idProduit: number;
  note: number;
}

class AvisService {
  async createOrUpdateAvis(avisData: CreateAvisData, token?: string): Promise<Avis> {
    const response = await api.post<{ data: Avis }>('/avis', avisData, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data.data;
  }

  async getAvisByProduit(idProduit: number): Promise<Avis[]> {
    const response = await api.get<Avis[]>(`/avis/produit/${idProduit}`);
    return response.data;
  }

  async getAvisStatistiques(idProduit: number): Promise<AvisStatistiques> {
    const response = await api.get<AvisStatistiques>(`/avis/statistiques/${idProduit}`);
    return response.data;
  }

  async getMonAvis(idProduit: number, token?: string): Promise<Avis | null> {
    try {
      const response = await api.get<Avis>(`/avis/mon-avis/${idProduit}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération');
    }
  }

  async deleteAvis(idAvis: number, token?: string): Promise<void> {
    await api.delete(`/avis/${idAvis}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }
}

export default new AvisService();