// services/promotions-service.ts
const API_BASE_URL = 'http://localhost:3001/api/jouets';

// Interfaces pour les entités liées
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

interface CodePromo {
  idCodePromo: number;
  code: string;
  actif: boolean;
  utilisationMax: number | null;
  utilisationActuelle: number;
}

// Interface principale pour Promotion
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
  codesPromo?: Array<{
    code: string;
    utilisationMax: number | null;
  }>;
}

interface PromotionResponse extends Promotion {
  codesPromo?: CodePromo[];
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
  // Créer une promotion
  async createPromotion(promotionData: PromotionFormData): Promise<PromotionResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/promotions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promotionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create promotion');
      }

      const data = await response.json();
      return data.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error creating promotion: ${message}`);
    }
  }

  // Obtenir toutes les promotions
  async getAllPromotions(): Promise<PromotionResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/promotions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch promotions');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching promotions: ${message}`);
    }
  }

  // Obtenir une promotion par ID
  async getPromotionById(id: number): Promise<PromotionResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/promotions/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch promotion');
      }

      const data = await response.json();
      return data.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching promotion: ${message}`);
    }
  }

  // Mettre à jour une promotion
  async updatePromotion(id: number, promotionData: PromotionFormData): Promise<PromotionResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/promotions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promotionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update promotion');
      }

      const data = await response.json();
      return data.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error updating promotion: ${message}`);
    }
  }

  // Supprimer une promotion
  async deletePromotion(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/promotions/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete promotion');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error deleting promotion: ${message}`);
    }
  }

  // Appliquer une promotion
  async appliquerPromotion(data: {
    codePromo?: string;
    panierData: any;
    idUtilisateur?: number;
  }): Promise<{
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
    try {
      const response = await fetch(`${API_BASE_URL}/promotions/appliquer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to apply promotion');
      }

      const result = await response.json();
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error applying promotion: ${message}`);
    }
  }

  // Obtenir les promotions actives
  async getPromotionsActives(idProduit?: number): Promise<PromotionResponse[]> {
    try {
      const params = new URLSearchParams();
      if (idProduit) {
        params.append('idProduit', idProduit.toString());
      }

      const response = await fetch(`${API_BASE_URL}/promotions/actives/list?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch active promotions');
      }

      const data = await response.json();
      return data.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching active promotions: ${message}`);
    }
  }

  // Obtenir les statistiques d'utilisation
  async getStatsUtilisation(dateDebut?: string, dateFin?: string): Promise<{
    generales: StatsUtilisation;
    topPromotions: TopPromotion[];
    repartitionType: RepartitionType[];
  }> {
    try {
      const params = new URLSearchParams();
      if (dateDebut) params.append('dateDebut', dateDebut);
      if (dateFin) params.append('dateFin', dateFin);

      const response = await fetch(`${API_BASE_URL}/promotions/stats/utilisation?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch stats');
      }

      const data = await response.json();
      return data.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching stats: ${message}`);
    }
  }

  // Activer/Désactiver une promotion
  async togglePromotion(id: number): Promise<PromotionResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/promotions/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle promotion');
      }

      const data = await response.json();
      return data.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error toggling promotion: ${message}`);
    }
  }

  // Dupliquer une promotion
  async dupliquerPromotion(id: number): Promise<PromotionResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/promotions/${id}/dupliquer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to duplicate promotion');
      }

      const data = await response.json();
      return data.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error duplicating promotion: ${message}`);
    }
  }
}

export default new PromotionsService();