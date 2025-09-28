import api from './api';

interface Produit {
  idProduit: number;
  nom: string;
}
interface Categorie {
  idCategorie: number;
  nom: string;
}
interface Marque {
  idMarque: number;
  nom: string;
}
interface Type {
  idType: number;
  nom: string;
}

export interface Promotion {
  idPromotion: number;
  nom: string;
  description: string | null;
  typePromotion: 'pourcentage' | 'montant_fixe' | 'livraison_gratuite';
  valeurPromotion: number;
  typeApplication: 'produit' | 'categorie' | 'type' | 'marque' | 'panier' | 'global';
  conditionMinimum: number | null;
  quantiteMinimum: number | null;
  dateDebut: string;
  dateFin: string;
  actif: boolean;
  utilisationMax: number | null;
  utilisationParClient: number | null;
  utilisationActuelle: number;
}
export interface PromotionActive {
  idPromotion: number;
  nom: string;
  description: string;
  typePromotion: 'pourcentage' | 'montant_fixe' | 'livraison_gratuite';
  valeurPromotion: number;
  typeApplication: string;
  reduction?: number;
  applicable?: boolean;
}
export interface PromotionFormData {
  idPromotion?: number | null;
  nom: string;
  description: string;
  typePromotion: 'pourcentage' | 'montant_fixe' | 'livraison_gratuite';
  valeurPromotion: number;
  typeApplication: 'produit' | 'categorie' | 'type' | 'marque' | 'panier' | 'global';
  conditionMinimum: number | null;
  quantiteMinimum: number | null;
  dateDebut: string;
  dateFin: string;
  utilisationMax: number | null;
  utilisationParClient: number | null;
  produits?: number[];
  categories?: number[];
  marques?: number[];
  types?: number[];
}

interface PromotionResponse extends Promotion {
  produits?: Produit[];
  categories?: Categorie[];
  marques?: Marque[];
  types?: Type[];
}
interface StatsUtilisation {
  totalUtilisations: number;
  totalReductions: number;
  reductionMoyenne: number;
}
interface TopPromotion {
  idPromotion: number;
  utilisations: number;
  totalReduction: number;
  promotion: {
    nom: string;
    typePromotion: string;
    typeApplication: string;
  };
}
interface RepartitionType {
  count: number;
  promotion: {
    typeApplication: string;
  };
}

class PromotionsService {
  async createPromotion(promotionData: PromotionFormData, token?: string): Promise<PromotionResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post<{ data: PromotionResponse }>('/promotions', promotionData, { headers });
    return response.data.data;
  }

  async getAllPromotions(token?: string): Promise<PromotionResponse[]> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<PromotionResponse[]>('/promotions', { headers });
    return response.data;
  }

  async getPromotionById(id: number, token?: string): Promise<PromotionResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<{ data: PromotionResponse }>(`/promotions/${id}`, { headers });
    return response.data.data;
  }

  async updatePromotion(id: number, promotionData: PromotionFormData, token?: string): Promise<PromotionResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.put<{ data: PromotionResponse }>(`/promotions/${id}`, promotionData, { headers });
    return response.data.data;
  }

  async deletePromotion(id: number, token?: string): Promise<void> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await api.delete(`/promotions/${id}`, { headers });
  }

  async appliquerPromotion(data: { panierData: any; idUtilisateur?: number }, token?: string): Promise<any> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post('/promotions/appliquer', data, { headers });
    return response.data;
  }

  async getPromotionsActives(idProduit?: number, token?: string): Promise<PromotionResponse[]> {
    const params = new URLSearchParams();
    if (idProduit) params.append('idProduit', idProduit.toString());
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<{ data: PromotionResponse[] }>(`/promotions/actives/list?${params}`, { headers });
    return response.data.data;
  }

  async getStatsUtilisation(dateDebut?: string, dateFin?: string, token?: string): Promise<{
    generales: StatsUtilisation;
    topPromotions: TopPromotion[];
    repartitionType: RepartitionType[];
  }> {
    const params = new URLSearchParams();
    if (dateDebut) params.append('dateDebut', dateDebut);
    if (dateFin) params.append('dateFin', dateFin);
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<{ data: any }>(`/promotions/stats/utilisation?${params}`, { headers });
    return response.data.data;
  }

  async togglePromotion(id: number, token?: string): Promise<PromotionResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.patch<{ data: PromotionResponse }>(`/promotions/${id}/toggle`, {}, { headers });
    return response.data.data;
  }

  async dupliquerPromotion(id: number, token?: string): Promise<PromotionResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post<{ data: PromotionResponse }>(`/promotions/${id}/dupliquer`, {}, { headers });
    return response.data.data;
  }

  async getPromotionsPourProduit(idProduit: number, token?: string): Promise<PromotionActive[]> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<{ data: PromotionActive[] }>(`/promotions/produit/${idProduit}`, { headers });
    return response.data.data || [];
  }

  async calculerPrixProduit(idProduit: number, prix: number, quantite: number = 1, token?: string) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post<{ data: any }>(`/promotions/calculer-prix/${idProduit}`, { prix, quantite }, { headers });
    return response.data.data;
  }
}

export default new PromotionsService();