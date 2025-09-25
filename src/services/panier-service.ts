// services/panier-service.ts
import api from './api';

const API_BASE_URL = 'http://localhost:3001/api';

export interface Produit {
  idProduit: number;
  nom: string;
  prix: number;
  description: string;
  quantiteStock: number;
  images?: Array<{
    idImage: number;
    url: string;
    rang: number;
  }>;
}

export interface ProduitVariation {
  idProduitVariation: number;
  idProduit: number;
  idCouleur: number;
  idTaille?: number;
  idAge?: number;
  quantiteStock: number;
  couleur?: {
    idCouleur: number;
    nom: string;
  };
  taille?: {
    idTaille: number;
    nom: string;
  };
  age?: {
    idAge: number;
    minAge: number;
    maxAge: number;
    typeAge: 'mois' | 'ans';
    label: string;
  };
}

export interface CartItem {
  idPanierProduit: number;
  idProduit: number;
  idProduitVariation?: number;
  quantite: number;
  prixUnitaire: number;
  produit: Produit;
  variation?: ProduitVariation;
}

export interface Cart {
  idPanier: number;
  idUtilisateur: number;
  produits: CartItem[];
}

class PanierService {
  async getPanier(): Promise<Cart> {
    try {
      const response = await api.get('/panier');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du panier');
    }
  }

  async ajouterProduit(idProduit: number, quantite: number = 1, idProduitVariation?: number): Promise<void> {
    try {
      const payload: any = { idProduit, quantite };
      if (idProduitVariation) {
        payload.idProduitVariation = idProduitVariation;
      }
      await api.post('/panier/ajouter', payload);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'ajout au panier');
    }
  }

  async modifierQuantite(idProduit: number, quantite: number, idProduitVariation?: number): Promise<void> {
    try {
      const payload: any = { idProduit, quantite };
      if (idProduitVariation) {
        payload.idProduitVariation = idProduitVariation;
      }
      await api.put('/panier/modifier', payload);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la modification');
    }
  }

  async retirerProduit(idPanierProduit: number): Promise<void> {
    console.log("Retirer produit avec idPanierProduit:", idPanierProduit);
    try {
      await api.delete(`/panier/retirer/${idPanierProduit}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  }

  async viderPanier(): Promise<void> {
    try {
      await api.delete('/panier/vider');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du vidage du panier');
    }
  }

  async getNombreProduits(): Promise<number> {
    try {
      const response = await api.get('/panier/count');
      return response.data.count;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du comptage');
    }
  }
}

export default new PanierService();