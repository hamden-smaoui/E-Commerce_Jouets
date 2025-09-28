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
  async validerCodePromo(code: string,token?: string): Promise<{
    valide: boolean;
    message: string;
    valeurPourcentage?: number;
  }> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await api.get(`/codes-promo/valider/${code}`,{ headers });
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

  async createCodePromo(codePromoData: CodePromoFormData, token?: string): Promise<CodePromoResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post<{ data: CodePromoResponse }>('/codes-promo', codePromoData, { headers });
    return response.data.data;
  }

  async getAllCodesPromo(params?: {
    page?: number;
    limit?: number;
    actif?: boolean;
    search?: string;
  }, token?: string): Promise<CodePromoListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.actif !== undefined) searchParams.append('actif', params.actif.toString());
    if (params?.search) searchParams.append('search', params.search);

    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<CodePromoListResponse>(`/codes-promo?${searchParams}`, { headers });
    return response.data;
  }

  async getCodePromoById(id: number, token?: string): Promise<CodePromoResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<{ data: CodePromoResponse }>(`/codes-promo/${id}`, { headers });
    return response.data.data;
  }

  async updateCodePromo(id: number, codePromoData: Partial<CodePromoFormData>, token?: string): Promise<CodePromoResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.put<{ data: CodePromoResponse }>(`/codes-promo/${id}`, codePromoData, { headers });
    return response.data.data;
  }

  async deleteCodePromo(id: number, token?: string): Promise<void> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await api.delete(`/codes-promo/${id}`, { headers });
  }

  async genererCodesPromo(data: {
    nombreCodes: number;
    prefixe?: string;
    longueur?: number;
    valeurPourcentage: number;
    utilisationMax?: number;
  }, token?: string): Promise<CodePromoResponse[]> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post<{ data: CodePromoResponse[] }>('/codes-promo/generer', data, { headers });
    return response.data.data;
  }

  async getStatsCodesPromo(params?: {
    dateDebut?: string;
    dateFin?: string;
  }, token?: string): Promise<{
    generales: StatsCodePromo;
    topCodes: CodePromoResponse[];
    utilisationParPeriode: UtilisationParPeriode[];
  }> {
    const searchParams = new URLSearchParams();
    if (params?.dateDebut) searchParams.append('dateDebut', params.dateDebut);
    if (params?.dateFin) searchParams.append('dateFin', params.dateFin);

    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<{ data: any }>(`/codes-promo/stats/utilisation?${searchParams}`, { headers });
    return response.data.data;
  }

  async exporterCodesPromo(params?: {
    format?: 'json' | 'csv';
  }, token?: string): Promise<CodePromoResponse[] | string> {
    const searchParams = new URLSearchParams();
    if (params?.format) searchParams.append('format', params.format);

    const config: any = params?.format === 'csv'
      ? { headers: { Accept: 'text/csv', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, responseType: 'text' as const }
      : { headers: token ? { Authorization: `Bearer ${token}` } : {} };

    const response = await api.get(`/codes-promo/export?${searchParams}`, config);
    return params?.format === 'csv' ? response.data : response.data.data;
  }

  async toggleCodePromo(id: number, token?: string): Promise<CodePromoResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.patch<{ data: CodePromoResponse }>(`/codes-promo/${id}/toggle`, {}, { headers });
    return response.data.data;
  }
}

export default new CodesPromoService();