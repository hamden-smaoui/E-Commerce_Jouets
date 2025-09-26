import api from './api';

export interface CodePromo {
  idCodePromo: number;
  code: string;
  valeurPourcentage: number;
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
  async validerCodePromo(code: string): Promise<{
    valide: boolean;
    message: string;
    valeurPourcentage?: number;
  }> {
    try {
      const response = await api.get(`/codes-promo/valider/${code}`);
      const data = response.data;
      return {
        valide: data.valide,
        message: data.message,
        valeurPourcentage: data.data?.valeurPourcentage
      };
    } catch (error: any) {
      return {
        valide: false,
        message: error?.response?.data?.message || 'Erreur lors de la validation du code'
      };
    }
  }

  async createCodePromo(codePromoData: CodePromoFormData): Promise<CodePromoResponse> {
    const response = await api.post<{ data: CodePromoResponse }>('/codes-promo', codePromoData);
    return response.data.data;
  }

  async getAllCodesPromo(params?: {
    page?: number;
    limit?: number;
    actif?: boolean;
    search?: string;
  }): Promise<CodePromoListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.actif !== undefined) searchParams.append('actif', params.actif.toString());
    if (params?.search) searchParams.append('search', params.search);

    const response = await api.get<CodePromoListResponse>(`/codes-promo?${searchParams}`);
    return response.data;
  }

  async getCodePromoById(id: number): Promise<CodePromoResponse> {
    const response = await api.get<{ data: CodePromoResponse }>(`/codes-promo/${id}`);
    return response.data.data;
  }

  async updateCodePromo(id: number, codePromoData: Partial<CodePromoFormData>): Promise<CodePromoResponse> {
    const response = await api.put<{ data: CodePromoResponse }>(`/codes-promo/${id}`, codePromoData);
    return response.data.data;
  }

  async deleteCodePromo(id: number): Promise<void> {
    await api.delete(`/codes-promo/${id}`);
  }

  async genererCodesPromo(data: {
    nombreCodes: number;
    prefixe?: string;
    longueur?: number;
    valeurPourcentage: number;
    utilisationMax?: number;
  }): Promise<CodePromoResponse[]> {
    const response = await api.post<{ data: CodePromoResponse[] }>('/codes-promo/generer', data);
    return response.data.data;
  }

  async getStatsCodesPromo(params?: {
    dateDebut?: string;
    dateFin?: string;
  }): Promise<{
    generales: StatsCodePromo;
    topCodes: CodePromoResponse[];
    utilisationParPeriode: UtilisationParPeriode[];
  }> {
    const searchParams = new URLSearchParams();
    if (params?.dateDebut) searchParams.append('dateDebut', params.dateDebut);
    if (params?.dateFin) searchParams.append('dateFin', params.dateFin);

    const response = await api.get<{ data: any }>(`/codes-promo/stats/utilisation?${searchParams}`);
    return response.data.data;
  }

  async exporterCodesPromo(params?: {
    format?: 'json' | 'csv';
  }): Promise<CodePromoResponse[] | string> {
    const searchParams = new URLSearchParams();
    if (params?.format) searchParams.append('format', params.format);

    const config = params?.format === 'csv'
      ? { headers: { Accept: 'text/csv' }, responseType: 'text' as const }
      : {};

    const response = await api.get(`/codes-promo/export?${searchParams}`, config);
    return params?.format === 'csv' ? response.data : response.data.data;
  }

  async toggleCodePromo(id: number): Promise<CodePromoResponse> {
    const response = await api.patch<{ data: CodePromoResponse }>(`/codes-promo/${id}/toggle`);
    return response.data.data;
  }
}

export default new CodesPromoService();