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
  idLigneCommande?: number;
  idCommande?: number;
  idProduit: number;
  idProduitVariation: number | null; // ✅ CORRIGÉ : Accepte null aussi
  quantite: number;
  prixUnitaire: number;
  prixUnitaireOriginal?: number;
  prixUnitaireFinal?: number;
  sousTotal: number;
  reductionUnitaire?: number;
  idPromotionAppliquee?: number;
  produit?: {
    idProduit: number;
    nom: string;
    prix?: number;
    images?: Array<{ url: string; rang: number }>;
  };
  variation?: ProduitVariation;
  promotionAppliquee?: {
    idPromotion: number;
    nom: string;
    description: string;
    typePromotion: string;
  };
}

export interface Commande {
  idCommande: number;
  idClient: number | null;
  clientPrenom: string;
  clientNom: string;
  clientEmail: string | null;
  clientTelephone: string;
  clientAdresseRue: string;
  clientAdresseVille: string;
  clientAdresseCodePostal: string;
  clientAdressePays: string;
  dateCommande: string;
  statut: 'en attente' | 'en traitement' | 'expédiée' | 'livrée' | 'annulée';
  montantTotal: number;
  montantOriginal?: number;
  montantReduction?: number;
  fraisLivraison?: number;
  codePromoGlobal?: string;
  idPromotionUtilisee?: number;
  reductionCodePromo?: number;
  notesLivraison: string | null;
  guestToken?: string; // 🆕 NOUVEAU
  createdAt: string;
  updatedAt: string;
}

export interface CommandeFormData {
  idCommande?: number | null;
  idClient?: number | null;
  clientPrenom: string;
  clientNom: string;
  clientEmail?: string | null;
  clientTelephone: string;
  clientAdresseRue: string;
  clientAdresseVille: string;
  clientAdresseCodePostal: string;
  clientAdressePays: string;
  statut: 'en attente' | 'en traitement' | 'expédiée' | 'livrée' | 'annulée';
  montantTotal: number;
  montantOriginal?: number;
  montantReduction?: number;
  fraisLivraison?: number;
  codePromoGlobal?: string;
  reductionCodePromo?: number;
  notesLivraison?: string | null;
  lignesCommandes?: LigneCommande[];
}
export interface CancelCommandeResponse {
  message: string;
  data: CommandeResponse;
}
export interface CommandeResponse extends Commande {
  client?: {
    idUtilisateur: number;
    prenom: string;
    nom: string;
    email?: string;
  };
  lignesCommandes?: LigneCommande[];
  facture?: {
    idFacture: number;
    statut: string;
    dateEmission?: string;
  };
  promotionGlobale?: {
    idPromotion: number;
    nom: string;
    description: string;
    typePromotion: string;
  };
  calculDetails?: {
    montantOriginal: number;
    montantFinal: number;
    fraisLivraison: number;
    montantTotal: number;
    economiesTotal: number;
    economiesProduits: number;
    economiesCodePromo: number;
  };
}

export interface CommandePaginationResponse {
  data: CommandeResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CommandeStats {
  statut: string;
  count: number;
  total: number;
}

export interface CommandeCreateResponse {
  message: string;
  data: CommandeResponse;
  calculDetails: {
    montantOriginal: number;
    montantProduits: number;
    reductionProduits: number;
    reductionCodePromo: number;
    montantFinal: number;
    fraisLivraison: number;
    montantTotal: number;
    economiesTotal: number;
  };
  promotions: {
    promotionsProduits: Array<{
      idProduit: number;
      idProduitVariation: number;
      reduction: number;
    }>;
    promotionGlobale: {
      nom: string;
      reduction: number;
      codePromo: string;
    } | null;
  };
}

// 🆕 NOUVEAU - CORRIGÉ
export interface CommandeGuestCreateResponse {
  message: string;
  data: CommandeResponse & {
    guestToken: string; // ✅ guestToken est dans data
  };
  calculDetails: {
    montantOriginal: number;
    montantProduits: number;
    reductionProduits: number;
    reductionCodePromo: number;
    montantFinal: number;
    fraisLivraison: number;
    montantTotal: number;
    economiesTotal: number;
  };
  promotions: {
    promotionsProduits: Array<{
      idProduit: number;
      idProduitVariation: number;
      reduction: number;
    }>;
    promotionGlobale: {
      nom: string;
      reduction: number;
      codePromo: string;
    } | null;
  };
}

export interface CalculPanierResponse {
  message: string;
  data: {
    montantOriginal: number;
    fraisLivraison: number;
    montantReduction: number;
    montantFinal: number;
    promotion: {
      nom: string;
      description: string;
      typePromotion: string;
    } | null;
    codePromo: string | null;
    error: string | null;
  };
}

export interface ValidationCodePromoResponse {
  message: string;
  valide: boolean;
  reduction?: number;
  promotion?: {
    nom: string;
    description: string;
  };
}

class CommandesService {
  // ============================================
  // MÉTHODES AUTHENTIFIÉES (EXISTANTES)
  // ============================================

  async createCommande(
    commandeData: CommandeFormData & { codePromo?: string; fraisLivraison?: number },
    token?: string
  ): Promise<CommandeCreateResponse> {
    const response = await api.post<CommandeCreateResponse>('/commandes', commandeData, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  }
// Créer une commande (authentifié OU guest)
async createCommandeUnified(
  commandeData: CommandeFormData & { codePromo?: string; fraisLivraison?: number },
  token?: string
): Promise<CommandeCreateResponse | CommandeGuestCreateResponse> {
  const headers: any = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await api.post<CommandeCreateResponse | CommandeGuestCreateResponse>(
    '/commandes',
    commandeData,
    { headers }
  );
  
  return response.data;
}
  async getAllCommandes(
    params: { page?: number; limit?: number; statut?: string; dateDebut?: string; dateFin?: string } = {},
    token?: string
  ): Promise<CommandePaginationResponse> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.statut) queryParams.append('statut', params.statut);
    if (params.dateDebut) queryParams.append('dateDebut', params.dateDebut);
    if (params.dateFin) queryParams.append('dateFin', params.dateFin);

    const response = await api.get<CommandePaginationResponse>(`/commandes?${queryParams.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  }

  async getCommandeById(id: number, token?: string): Promise<CommandeResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<CommandeResponse>(`/commandes/${id}`, { headers });
    return response.data;
  }

  async updateCommande(id: number, commandeData: Partial<CommandeFormData>, token?: string): Promise<CommandeResponse> {
    const response = await api.put<{ data: CommandeResponse }>(`/commandes/${id}`, commandeData, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data.data;
  }

  async deleteCommande(id: number, token?: string): Promise<void> {
    await api.delete(`/commandes/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async getCommandesByClient(token?: string): Promise<CommandeResponse[]> {
    const response = await api.get<CommandeResponse[]>(`/commandes/client`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  }

  async getCommandeStats(token?: string): Promise<CommandeStats[]> {
    const response = await api.get<CommandeStats[]>('/commandes/stats', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  }

  async calculerPanier(
    panierData: { lignesCommandes: LigneCommande[]; codePromo?: string; idClient?: number; fraisLivraison?: number },
    token?: string
  ): Promise<CalculPanierResponse> {
    const response = await api.post<CalculPanierResponse>('/commandes/calculer-panier', panierData, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  }

  async validerCodePromo(
    codeData: { codePromo: string; lignesCommandes: LigneCommande[]; idClient?: number },
    token?: string
  ): Promise<ValidationCodePromoResponse> {
    const response = await api.post<ValidationCodePromoResponse>('/commandes/valider-code-promo', codeData, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  }

  // ============================================
  // 🆕 NOUVELLES MÉTHODES GUEST
  // ============================================

  async createCommandeGuest(
    commandeData: CommandeFormData & { codePromo?: string; fraisLivraison?: number }
  ): Promise<CommandeGuestCreateResponse> {
    const response = await api.post<CommandeGuestCreateResponse>('/commandes/guest', commandeData);
    return response.data;
  }

  async getCommandeByIdGuest(idCommande: number, guestToken: string): Promise<CommandeResponse> {
    const response = await api.get<CommandeResponse>(`/commandes/guest/${idCommande}?token=${guestToken}`);
    return response.data;
  }

  // ============================================
  // HELPERS (INCHANGÉS)
  // ============================================

  hasPromotions(commande: CommandeResponse): boolean {
    const hasProductPromotions = commande.lignesCommandes?.some(ligne => ligne.reductionUnitaire && ligne.reductionUnitaire > 0) || false;
    const hasGlobalPromotion = commande.promotionGlobale || commande.codePromoGlobal;
    return hasProductPromotions || !!hasGlobalPromotion;
  }

  calculateTotalSavings(commande: CommandeResponse): number {
    if (!commande.montantOriginal || !commande.montantTotal) return 0;
    const originalWithShipping = commande.montantOriginal + (commande.fraisLivraison || 0);
    return originalWithShipping - commande.montantTotal;
  }

  calculateProductSavings(commande: CommandeResponse): number {
    return commande.lignesCommandes?.reduce((total, ligne) => total + ((ligne.reductionUnitaire || 0) * ligne.quantite), 0) || 0;
  }

  calculatePromoCodeSavings(commande: CommandeResponse): number {
    const totalSavings = this.calculateTotalSavings(commande);
    const productSavings = this.calculateProductSavings(commande);
    return totalSavings - productSavings;
  }
    async cancelCommandeGuest(idCommande: number, guestToken: string): Promise<CancelCommandeResponse> {
    const response = await api.put<CancelCommandeResponse>(
      `/commandes/guest/${idCommande}/cancel?token=${guestToken}`,
      {}
    );
    return response.data;
  }
}

export default new CommandesService();
