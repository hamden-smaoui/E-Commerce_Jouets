const API_BASE_URL = 'http://localhost:3001/api/jouets';

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
  idProduitVariation: number;
  quantite: number;
  prixUnitaire: number;
  prixUnitaireOriginal?: number;
  prixUnitaireFinal?: number;
  sousTotal: number;
  reductionUnitaire?: number;
  idPromotionAppliquee?: number;
  variation?: ProduitVariation; // <-- AJOUT/MAJ
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

export interface FactureFormData {
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
   async getAllFactures(): Promise<FactureResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/factures`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch factures');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching factures: ${message}`);
    }
  }

  async updateFacture(id: number, factureData: Partial<FactureFormData>): Promise<FactureResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/factures/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(factureData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update facture');
      }

      const data = await response.json();
      return data.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error updating facture: ${message}`);
    }
  }

  async deleteFacture(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/factures/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete facture');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error deleting facture: ${message}`);
    }
  }

  async downloadFacturePDF(id: number): Promise<Blob> {
    try {
      const response = await fetch(`${API_BASE_URL}/factures/${id}/pdf`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate PDF');
      }

      return await response.blob();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error generating PDF: ${message}`);
    }
  }

  async getFactureStats(): Promise<FactureStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/statsfactures`, {
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
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching stats: ${message}`);
    }
  }

  // Utilitaires
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
      case 'payée':
        return '#10b981'; // Vert
      case 'en_retard':
        return '#ef4444'; // Rouge
      case 'annulée':
        return '#6b7280'; // Gris
      case 'brouillon':
        return '#f59e0b'; // Orange
      case 'envoyée':
        return '#3b82f6'; // Bleu
      default:
        return '#6b7280';
    }
  }

  getStatusLabel(statut: string): string {
    switch (statut) {
      case 'brouillon':
        return 'Brouillon';
      case 'envoyée':
        return 'Envoyée';
      case 'payée':
        return 'Payée';
      case 'en_retard':
        return 'En retard';
      case 'annulée':
        return 'Annulée';
      default:
        return statut;
    }
  }

  async getFactureById(id: number): Promise<FactureResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/factures/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch facture');
      }

      const data = await response.json();
      console.log("fact",data)
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching facture: ${message}`);
    }
  }
    async createFacture(factureData: FactureFormData): Promise<FactureResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/factures`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(factureData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create facture');
      }

      const data = await response.json();
      return data.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error creating facture: ${message}`);
    }
  }

async createFactureForCommande(idCommande: number): Promise<FactureResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/factures/commandes/${idCommande}/facture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create facture');
      }

      const data = await response.json();
      return data.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error creating facture: ${message}`);
    }
  }

}

export default new FacturesService();