// services/codes-promo-service.ts
const API_BASE_URL = 'http://localhost:3001/api/jouets';

interface Promotion {
  idPromotion: number;
  nom: string;
  typePromotion: string;
  valeurPromotion: number;
  dateDebut: string;
  dateFin: string;
  actif: boolean;
}

export interface CodePromo {
  idCodePromo: number;
  code: string;
  idPromotion: number;
  actif: boolean;
  utilisationMax: number | null;
  utilisationActuelle: number;
  createdAt: string;
  updatedAt: string;
}

export interface CodePromoFormData {
  idCodePromo?: number | null;
  code: string;
  idPromotion: number;
  utilisationMax: number | null;
  actif?: boolean;
}

interface CodePromoResponse extends CodePromo {
  promotion?: Promotion;
}

interface CodePromoListResponse {
  data: CodePromoResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface StatsCodePromo {
  totalCodes: number;
  codesActifs: number;
  totalUtilisations: number;
  utilisationMoyenne: number;
}

interface TopCode extends CodePromo {
  promotion: {
    nom: string;
    typePromotion: string;
  };
}

interface UtilisationParPeriode {
  date: string;
  utilisations: number;
  totalReduction: number;
}

class CodesPromoService {
  // Valider un code promo
  async validerCodePromo(code: string, montantPanier?: number, idUtilisateur?: number): Promise<{
    valide: boolean;
    message: string;
    promotion?: any;
    montantMinimum?: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (montantPanier) params.append('montantPanier', montantPanier.toString());
      if (idUtilisateur) params.append('idUtilisateur', idUtilisateur.toString());

      // Corrected URL to match backend route
      const response = await fetch(`${API_BASE_URL}/codes-promo/valider/${code}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          valide: false,
          message: data.message || 'Code promo invalide',
          montantMinimum: data.montantMinimum
        };
      }

      return {
        valide: data.valide,
        message: data.message,
        promotion: data.data?.promotion,
        montantMinimum: data.montantMinimum
      };
    } catch (error) {
      return {
        valide: false,
        message: 'Erreur lors de la validation du code'
      };
    }
  }

  // Other methods remain unchanged
  async createCodePromo(codePromoData: CodePromoFormData): Promise<CodePromoResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/codes-promo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(codePromoData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create code promo');
      }

      const data = await response.json();
      return data.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error creating code promo: ${message}`);
    }
  }

  async getAllCodesPromo(params?: {
    page?: number;
    limit?: number;
    actif?: boolean;
    idPromotion?: number;
    search?: string;
  }): Promise<CodePromoListResponse> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.actif !== undefined) searchParams.append('actif', params.actif.toString());
      if (params?.idPromotion) searchParams.append('idPromotion', params.idPromotion.toString());
      if (params?.search) searchParams.append('search', params.search);

      const response = await fetch(`${API_BASE_URL}/codes-promo?${searchParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch codes promo');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching codes promo: ${message}`);
    }
  }

  async getCodePromoById(id: number): Promise<CodePromoResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/codes-promo/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch code promo');
      }

      const data = await response.json();
      return data.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching code promo: ${message}`);
    }
  }

  async updateCodePromo(id: number, codePromoData: Partial<CodePromoFormData>): Promise<CodePromoResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/codes-promo/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(codePromoData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update code promo');
      }

      const data = await response.json();
      return data.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error updating code promo: ${message}`);
    }
  }

  async deleteCodePromo(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/codes-promo/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete code promo');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error deleting code promo: ${message}`);
    }
  }

  async genererCodesPromo(data: {
    idPromotion: number;
    nombreCodes: number;
    prefixe?: string;
    longueur?: number;
    utilisationMax?: number;
  }): Promise<CodePromoResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/codes-promo/generer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate codes promo');
      }

      const result = await response.json();
      return result.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error generating codes promo: ${message}`);
    }
  }

  async getStatsCodesPromo(params?: {
    idPromotion?: number;
    dateDebut?: string;
    dateFin?: string;
  }): Promise<{
    generales: StatsCodePromo;
    topCodes: TopCode[];
    utilisationParPeriode: UtilisationParPeriode[];
  }> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.idPromotion) searchParams.append('idPromotion', params.idPromotion.toString());
      if (params?.dateDebut) searchParams.append('dateDebut', params.dateDebut);
      if (params?.dateFin) searchParams.append('dateFin', params.dateFin);

      const response = await fetch(`${API_BASE_URL}/codes-promo/stats/utilisation?${searchParams}`, {
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

  async exporterCodesPromo(params?: {
    idPromotion?: number;
    format?: 'json' | 'csv';
  }): Promise<CodePromoResponse[] | string> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.idPromotion) searchParams.append('idPromotion', params.idPromotion.toString());
      if (params?.format) searchParams.append('format', params.format);

      const response = await fetch(`${API_BASE_URL}/codes-promo/export?${searchParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': params?.format === 'csv' ? 'text/csv' : 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to export codes promo');
      }

      if (params?.format === 'csv') {
        return await response.text();
      } else {
        const data = await response.json();
        return data.data;
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error exporting codes promo: ${message}`);
    }
  }

  async toggleCodePromo(id: number): Promise<CodePromoResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/codes-promo/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle code promo');
      }

      const data = await response.json();
      return data.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error toggling code promo: ${message}`);
    }
  }

  async dupliquerCodesPromo(data: {
    idPromotionSource: number;
    idPromotionCible: number;
    codesIds: number[];
  }): Promise<CodePromoResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/codes-promo/dupliquer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to duplicate codes promo');
      }

      const result = await response.json();
      return result.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error duplicating codes promo: ${message}`);
    }
  }
}

export default new CodesPromoService();