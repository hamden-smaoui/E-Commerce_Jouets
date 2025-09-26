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
  async createPromotion(promotionData: PromotionFormData): Promise<PromotionResponse> {
    const response = await api.post<{ data: PromotionResponse }>('/promotions', promotionData);
    return response.data.data;
  }

  async getAllPromotions(): Promise<PromotionResponse[]> {
    const response = await api.get<PromotionResponse[]>('/promotions');
    return response.data;
  }

  async getPromotionById(id: number): Promise<PromotionResponse> {
    const response = await api.get<{ data: PromotionResponse }>(`/promotions/${id}`);
    return response.data.data;
  }

  async updatePromotion(id: number, promotionData: PromotionFormData): Promise<PromotionResponse> {
    const response = await api.put<{ data: PromotionResponse }>(`/promotions/${id}`, promotionData);
    return response.data.data;
  }

  async deletePromotion(id: number): Promise<void> {
    await api.delete(`/promotions/${id}`);
  }

  async appliquerPromotion(data: { panierData: any; idUtilisateur?: number }): Promise<{
    message: string;
    promotion: {
      id: number;
      nom: string;
      description: string;
      typePromotion: string;
      reduction: number;
      montantFinal: number;
    };
  }> {
    const response = await api.post('/promotions/appliquer', data);
    return response.data;
  }

  async getPromotionsActives(idProduit?: number): Promise<PromotionResponse[]> {
    const params = new URLSearchParams();
    if (idProduit) params.append('idProduit', idProduit.toString());
    const response = await api.get<{ data: PromotionResponse[] }>(`/promotions/actives/list?${params}`);
    return response.data.data;
  }

  async getStatsUtilisation(dateDebut?: string, dateFin?: string): Promise<{
    generales: StatsUtilisation;
    topPromotions: TopPromotion[];
    repartitionType: RepartitionType[];
  }> {
    const params = new URLSearchParams();
    if (dateDebut) params.append('dateDebut', dateDebut);
    if (dateFin) params.append('dateFin', dateFin);
    const response = await api.get<{ data: { generales: StatsUtilisation; topPromotions: TopPromotion[]; repartitionType: RepartitionType[] } }>(`/promotions/stats/utilisation?${params}`);
    return response.data.data;
  }

  async togglePromotion(id: number): Promise<PromotionResponse> {
    const response = await api.patch<{ data: PromotionResponse }>(`/promotions/${id}/toggle`);
    return response.data.data;
  }

  async dupliquerPromotion(id: number): Promise<PromotionResponse> {
    const response = await api.post<{ data: PromotionResponse }>(`/promotions/${id}/dupliquer`);
    return response.data.data;
  }

  async getPromotionsPourProduit(idProduit: number): Promise<PromotionActive[]> {
    const response = await api.get<{ data: PromotionActive[] }>(`/promotions/produit/${idProduit}`);
    return response.data.data || [];
  }

  async calculerPrixProduit(idProduit: number, prix: number, quantite: number = 1) {
    const response = await api.post<{ data: any }>(`/promotions/calculer-prix/${idProduit}`, { prix, quantite });
    return response.data.data;
  }
}

export default new PromotionsService();