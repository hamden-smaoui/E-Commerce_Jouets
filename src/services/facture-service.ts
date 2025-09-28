import api from './api';

export interface Couleur {
  idCouleur: number;
  nom: string;
}
export interface Taille {
  idTaille: number;
  nom: string;
}
export interface Age {
  idAge: number;
  minAge: number;
  maxAge: number;
  typeAge: 'mois' | 'ans';
  label: string;
}
export interface ProduitVariation {
  idProduitVariation: number;
  idProduit: number;
  idCouleur: number;
  idTaille?: number;
  idAge?: number;
  quantiteStock: number;
  couleur?: Couleur;
  taille?: Taille;
  age?: Age;
}
export interface LigneCommande {
  // ... mêmes propriétés
  idLigneCommande?: number;
  idCommande?: number;
  idProduit: number;
  idProduitVariation: number;
  quantite: number;
  prixUnitaire: number;
  prixUnitaireOriginal?: number;
  prixUnitaireFinal?: number;
  sousTotal: number;
  reductionUnitaire?: number;
  idPromotionAppliquee?: number;
  variation?: ProduitVariation;
  produit?: {
    idProduit: number;
    nom: string;
    description?: string;
    images?: Array<{ url: string; rang: number }>;
  };
  promotionAppliquee?: {
    idPromotion: number;
    nom: string;
    description: string;
    typePromotion: string;
  };
}

export interface Facture {
  // ... propriétés comme avant
  idFacture: number;
  numeroFacture: string;
  idCommande: number;
  dateFacture: string;
  dateEcheance?: string;
  montantHT: number;
  montantTVA: number;
  montantTotal: number;
  tauxTVA: number;
  statut: 'brouillon' | 'envoyée' | 'payée' | 'en_retard' | 'annulée';
  clientNom: string;
  clientEmail?: string;
  clientTelephone?: string;
  clientAdresse?: string;
  entrepriseNom: string;
  entrepriseAdresse?: string;
  entrepriseTelephone?: string;
  entrepriseEmail?: string;
  entrepriseSiret?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
export interface FactureFormData { /* ...comme avant... */ 
  idFacture?: number;
  numeroFacture?: string;
  idCommande: number;
  dateFacture: string;
  dateEcheance?: string;
  montantHT: number;
  montantTVA: number;
  montantTotal: number;
  tauxTVA: number;
  statut: 'brouillon' | 'envoyée' | 'payée' | 'en_retard' | 'annulée';
  clientNom: string;
  clientEmail?: string;
  clientTelephone?: string;
  clientAdresse?: string;
  entrepriseNom: string;
  entrepriseAdresse?: string;
  entrepriseTelephone?: string;
  entrepriseEmail?: string;
  entrepriseSiret?: string;
  notes?: string;
}
export interface FactureResponse extends Facture {
  commande?: {
    idCommande: number;
    dateCommande: string;
    montantTotal: number;
    client?: {
      idUtilisateur: number;
      prenom: string;
      nom: string;
      email: string;
      telephone: string;
    };
    codePromoGlobal?: string;
    reductionCodePromo?: number;
    lignesCommandes?: LigneCommande[];
  };
}
export interface FactureStats {
  totalFactures: number;
  facturesPayees: number;
  facturesEnRetard: number;
  montantTotal: number;
  tauxPaiement: string;
}

class FacturesService {
  async getAllFactures(token?: string): Promise<FactureResponse[]> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<FactureResponse[]>('/factures', { headers });
    return response.data;
  }

  async updateFacture(id: number, factureData: Partial<FactureFormData>, token?: string): Promise<FactureResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.put<{ data: FactureResponse }>(`/factures/${id}`, factureData, { headers });
    return response.data.data;
  }

  async deleteFacture(id: number, token?: string): Promise<void> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await api.delete(`/factures/${id}`, { headers });
  }

  async downloadFacturePDF(id: number, token?: string): Promise<Blob> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get(`/factures/${id}/pdf`, { responseType: 'blob', headers });
    return response.data;
  }

  async getFactureStats(token?: string): Promise<FactureStats> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<FactureStats>('/factures/statsfactures', { headers });
    return response.data;
  }

  async getFactureById(id: number, token?: string): Promise<FactureResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<FactureResponse>(`/factures/${id}`, { headers });
    return response.data;
  }

  async createFacture(factureData: FactureFormData, token?: string): Promise<FactureResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post<{ data: FactureResponse }>(`/factures`, factureData, { headers });
    return response.data.data;
  }

  async createFactureForCommande(idCommande: number, token?: string): Promise<FactureResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post<{ data: FactureResponse }>(`/factures/commandes/${idCommande}/facture`, {}, { headers });
    return response.data.data;
  }

  formatFactureNumber(numero: string): string {
    return numero || 'N/A';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  formatAmount(amount: number | string | undefined | null): string {
    const numeric = Number(amount);
    if (isNaN(numeric)) return '0.00 TND';
    return `${numeric.toFixed(2)} TND`;
  }

  getStatusColor(statut: string): string {
    switch (statut) {
      case 'payée': return '#10b981';
      case 'en_retard': return '#ef4444';
      case 'annulée': return '#6b7280';
      case 'brouillon': return '#f59e0b';
      case 'envoyée': return '#3b82f6';
      default: return '#6b7280';
    }
  }

  getStatusLabel(statut: string): string {
    switch (statut) {
      case 'brouillon': return 'Brouillon';
      case 'envoyée': return 'Envoyée';
      case 'payée': return 'Payée';
      case 'en_retard': return 'En retard';
      case 'annulée': return 'Annulée';
      default: return statut;
    }
  }
}

export default new FacturesService();