// services/panier-service.ts
import api from './api';

const API_BASE_URL = 'http://localhost:3001/api';

// Interface for Produit as included in the cart

// Interface for CartItem
export interface CartItem {
  idPanierProduit: number;
  idProduit: number;
  quantite: number;
  produit: Produit;
}

// Interface for Cart
export interface Cart {
  idPanier: number;
  idUtilisateur: number;
  produits: CartItem[]; // Changed from panierProduits to produits
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

  async ajouterProduit(idProduit: number, quantite: number = 1): Promise<void> {
    try {
      await api.post('/panier/ajouter', { idProduit, quantite });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'ajout au panier');
    }
  }

  async modifierQuantite(idProduit: number, quantite: number): Promise<void> {
    try {
      await api.put('/panier/modifier', { idProduit, quantite });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la modification');
    }
  }

  async retirerProduit(idProduit: number): Promise<void> {
    try {
      await api.delete(`/panier/retirer/${idProduit}`);
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