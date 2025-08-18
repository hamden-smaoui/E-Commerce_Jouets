// services/commandes-service.ts
const API_BASE_URL = 'http://localhost:3001/api/jouets';

// Interfaces
export interface LigneCommande {
  idLigneCommande?: number;
  idCommande?: number;
  idProduit: number;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
  produit?: {
    idProduit: number;
    nom: string;
    prix?: number;
    images?: Array<{
      url: string;
      rang: number;
    }>;
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

class CommandesService {
  // Create a new commande
  async createCommande(commandeData: CommandeFormData): Promise<CommandeResponse> {
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
      return data.data;
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

  // Get a commande by ID
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
}

export default new CommandesService();