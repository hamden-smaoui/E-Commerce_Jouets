const API_BASE_URL = 'http://localhost:3001/api/jouets';

export interface CodePromo {
  idCodePromo: number;
  code: string;
  valeurPourcentage: number; // Discount percentage, e.g. 20 for 20%
  actif: boolean;
  utilisationMax: number | null;
  utilisationActuelle: number;
  createdAt: string;
  updatedAt: string;
}

export interface CodePromoFormData {
  idCodePromo?: number | null;
  code: string;
  valeurPourcentage: number;
  utilisationMax: number | null;
  actif?: boolean;
}

interface CodePromoResponse extends CodePromo {}

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

interface UtilisationParPeriode {
  date: string;
  utilisations: number;
  totalReduction: number;
}

class CodesPromoService {
  // Valider un code promo
  async validerCodePromo(code: string): Promise<{
    valide: boolean;
    message: string;
    valeurPourcentage?: number;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/codes-promo/valider/${code}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();

      if (!response.ok) {
        return { valide: false, message: data.message || 'Code promo invalide' };
      }

      return {
        valide: data.valide,
        message: data.message,
        valeurPourcentage: data.data?.valeurPourcentage
      };
    } catch (error) {
      return {
        valide: false,
        message: 'Erreur lors de la validation du code'
      };
    }
  }

  // Créer un code promo
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

  // Lister tous les codes promo
  async getAllCodesPromo(params?: {
    page?: number;
    limit?: number;
    actif?: boolean;
    search?: string;
  }): Promise<CodePromoListResponse> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.actif !== undefined) searchParams.append('actif', params.actif.toString());
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

  // Récupérer un code promo par ID
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

  // Mettre à jour un code promo
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

  // Supprimer un code promo
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

  // Générer des codes promo en masse
  async genererCodesPromo(data: {
    nombreCodes: number;
    prefixe?: string;
    longueur?: number;
    valeurPourcentage: number;
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

  // Statistiques d'utilisation des codes promo
  async getStatsCodesPromo(params?: {
    dateDebut?: string;
    dateFin?: string;
  }): Promise<{
    generales: StatsCodePromo;
    topCodes: CodePromoResponse[];
    utilisationParPeriode: UtilisationParPeriode[];
  }> {
    try {
      const searchParams = new URLSearchParams();
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

  // Exporter codes promo
  async exporterCodesPromo(params?: {
    format?: 'json' | 'csv';
  }): Promise<CodePromoResponse[] | string> {
    try {
      const searchParams = new URLSearchParams();
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

  // Activer/Désactiver un code promo
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
}

export default new CodesPromoService();