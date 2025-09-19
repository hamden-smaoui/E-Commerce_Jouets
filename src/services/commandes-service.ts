// services/commandes-service.ts
const API_BASE_URL = 'http://localhost:3001/api/jouets';

// Interfaces mises à jour
export interface LigneCommande {
  idLigneCommande?: number;
  idCommande?: number;
  idProduit: number;
  quantite: number;
  prixUnitaire: number; // Prix facturé (compatibilité)
  prixUnitaireOriginal?: number; // Prix original avant promotion
  prixUnitaireFinal?: number; // Prix final après promotion
  sousTotal: number;
  reductionUnitaire?: number; // Montant de réduction par unité
  idPromotionAppliquee?: number; // ID de la promotion appliquée
  produit?: {
    idProduit: number;
    nom: string;
    prix?: number;
    images?: Array<{
      url: string;
      rang: number;
    }>;
  };
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
  montantOriginal?: number; // Montant original avant promotions
  montantReduction?: number; // Montant total des réductions
  fraisLivraison?: number; // Frais de livraison
  codePromoGlobal?: string; // Code promo utilisé
  idPromotionUtilisee?: number; // ID de la promotion globale utilisée
  notesLivraison: string | null;
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
  notesLivraison?: string | null;
  lignesCommandes?: LigneCommande[];
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

// Interface pour les réponses de création avec détails promotions
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
      reduction: number;
    }>;
    promotionGlobale: {
      nom: string;
      reduction: number;
      codePromo: string;
    } | null;
  };
}

// Interface pour le calcul du panier
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

// Interface pour la validation de code promo
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
  // Create a new commande with promotion details
  async createCommande(commandeData: CommandeFormData & { 
    codePromo?: string; 
    fraisLivraison?: number; 
  }): Promise<CommandeCreateResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/commandes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commandeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create commande');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error creating commande: ${message}`);
    }
  }

  // Get all commandes with pagination and filtering
  async getAllCommandes(params: {
    page?: number;
    limit?: number;
    statut?: string;
    dateDebut?: string;
    dateFin?: string;
  } = {}): Promise<CommandePaginationResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.statut) queryParams.append('statut', params.statut);
      if (params.dateDebut) queryParams.append('dateDebut', params.dateDebut);
      if (params.dateFin) queryParams.append('dateFin', params.dateFin);

      const response = await fetch(`${API_BASE_URL}/commandes?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch commandes');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching commandes: ${message}`);
    }
  }

  // Get a commande by ID with full promotion details
  async getCommandeById(id: number): Promise<CommandeResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/commandes/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch commande');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching commande: ${message}`);
    }
  }

  // Update a commande
  async updateCommande(id: number, commandeData: Partial<CommandeFormData>): Promise<CommandeResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/commandes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commandeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update commande');
      }

      const data = await response.json();
      return data.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error updating commande: ${message}`);
    }
  }

  // Delete a commande
  async deleteCommande(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/commandes/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete commande');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error deleting commande: ${message}`);
    }
  }

  // Get commandes by client
  async getCommandesByClient(clientId: number): Promise<CommandeResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/commandes/client/${clientId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch commandes by client');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching commandes by client: ${message}`);
    }
  }

  // Get commande statistics
  async getCommandeStats(): Promise<CommandeStats[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/commandes/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch commande stats');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching commande stats: ${message}`);
    }
  }

  // Calculate cart with promotions
  async calculerPanier(panierData: {
    lignesCommandes: LigneCommande[];
    codePromo?: string;
    idClient?: number;
    fraisLivraison?: number;
  }): Promise<CalculPanierResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/commandes/calculer-panier`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(panierData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to calculate cart');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error calculating cart: ${message}`);
    }
  }

  // Validate promo code
  async validerCodePromo(codeData: {
    codePromo: string;
    lignesCommandes: LigneCommande[];
    idClient?: number;
  }): Promise<ValidationCodePromoResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/commandes/valider-code-promo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(codeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to validate promo code');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error validating promo code: ${message}`);
    }
  }

  // Helper method to check if a commande has promotions
  hasPromotions(commande: CommandeResponse): boolean {
    const hasProductPromotions = commande.lignesCommandes?.some(ligne => 
      ligne.reductionUnitaire && ligne.reductionUnitaire > 0
    ) || false;
    
    const hasGlobalPromotion = commande.promotionGlobale || commande.codePromoGlobal;
    
    return hasProductPromotions || !!hasGlobalPromotion;
  }

  // Helper method to calculate total savings
  calculateTotalSavings(commande: CommandeResponse): number {
    if (!commande.montantOriginal || !commande.montantTotal) return 0;
    
    const originalWithShipping = commande.montantOriginal + (commande.fraisLivraison || 0);
    return originalWithShipping - commande.montantTotal;
  }

  // Helper method to calculate product savings
  calculateProductSavings(commande: CommandeResponse): number {
    return commande.lignesCommandes?.reduce((total, ligne) => 
      total + ((ligne.reductionUnitaire || 0) * ligne.quantite), 0
    ) || 0;
  }

  // Helper method to calculate promo code savings
  calculatePromoCodeSavings(commande: CommandeResponse): number {
    const totalSavings = this.calculateTotalSavings(commande);
    const productSavings = this.calculateProductSavings(commande);
    return totalSavings - productSavings;
  }
  
}

export default new CommandesService();