import api from './api';
import * as CartStorage from '@/utils/cart-storage';

export interface Produit {
  idProduit: number;
  nom: string;
  prix: number;
  description: string;
  quantiteStock: number;
  livraisonGratuite?: boolean; 
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
  couleur?: { idCouleur: number; nom: string };
  taille?: { idTaille: number; nom: string };
  age?: { idAge: number; minAge: number; maxAge: number; typeAge: 'mois' | 'ans'; label: string };
}

export interface CartItem {
  idPanierProduit?: number; // Optionnel pour le localStorage
  idProduit: number;
  idProduitVariation?: number;
  quantite: number;
  prixUnitaire: number;
  produit: Produit;
  variation?: ProduitVariation;
}

export interface Cart {
  idPanier?: number; // Optionnel pour le localStorage
  idUtilisateur?: number;
  produits: CartItem[];
}

function handleApiError(error: any): Error {
  if (!navigator.onLine) {
    return new Error("Vous êtes hors ligne. Veuillez vérifier votre connexion internet.");
  }
  if (error.response) {
    return new Error(error.response.data?.message || "Erreur inconnue du serveur.");
  } else if (error.request) {
    return new Error("Impossible de contacter le serveur. Veuillez réessayer plus tard.");
  } else {
    return new Error("Erreur inconnue lors de la communication avec le serveur.");
  }
}

class PanierService {
  /**
   * ✅ NOUVEAU : Récupérer le panier (BDD ou localStorage)
   */
  async getPanier(token?: string): Promise<Cart> {
    if (!token) {
      // ✅ Pas de token → Retourner le panier local
      return this.getLocalCart();
    }

    try {
      const response = await api.get('/panier', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000
      });
      return response.data.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  }

  /**
   * ✅ NOUVEAU : Récupérer le panier depuis localStorage
   */
  private getLocalCart(): Cart {
    const localCart = CartStorage.getLocalCart();
    return {
      produits: localCart.items.map((item) => ({
        idProduit: item.idProduit,
        idProduitVariation: item.idProduitVariation,
        quantite: item.quantite,
        prixUnitaire: item.prixUnitaire,
        produit: item.produit,
        variation: item.variation,
      })),
    };
  }

  /**
   * ✅ MODIFIÉ : Ajouter un produit (BDD ou localStorage)
   */
  async ajouterProduit(
    idProduit: number,
    quantite: number = 1,
    idProduitVariation?: number,
    token?: string,
    produit?: Produit,
    variation?: ProduitVariation
  ): Promise<void> {
    if (!token) {
      // ✅ Pas de token → Ajouter au localStorage
      if (!produit) {
        throw new Error('Les informations du produit sont requises pour le panier local');
      }
      CartStorage.addToLocalCart(
        idProduit,
        quantite,
        produit.prix,
        produit,
        idProduitVariation,
        variation
      );
      return;
    }

    // ✅ Token présent → Ajouter en BDD
    try {
      const payload: any = { idProduit, quantite };
      if (idProduitVariation) payload.idProduitVariation = idProduitVariation;
      await api.post('/panier/ajouter', payload, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000
      });
    } catch (error: any) {
      throw handleApiError(error);
    }
  }

  /**
   * ✅ MODIFIÉ : Modifier la quantité (BDD ou localStorage)
   */
  async modifierQuantite(
    idProduit: number,
    quantite: number,
    idProduitVariation?: number,
    token?: string
  ): Promise<void> {
    if (!token) {
      // ✅ Pas de token → Modifier dans localStorage
      CartStorage.updateLocalCartQuantity(idProduit, quantite, idProduitVariation);
      return;
    }

    // ✅ Token présent → Modifier en BDD
    try {
      const payload: any = { idProduit, quantite };
      if (idProduitVariation) payload.idProduitVariation = idProduitVariation;
      await api.put('/panier/modifier', payload, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000
      });
    } catch (error: any) {
      throw handleApiError(error);
    }
  }

  /**
   * ✅ MODIFIÉ : Retirer un produit (BDD ou localStorage)
   */
  async retirerProduit(
    idPanierProduit: number | undefined,
    token?: string,
    idProduit?: number,
    idProduitVariation?: number
  ): Promise<void> {
    if (!token) {
      // ✅ Pas de token → Retirer du localStorage
      if (idProduit === undefined) {
        throw new Error('idProduit requis pour retirer du panier local');
      }
      CartStorage.removeFromLocalCart(idProduit, idProduitVariation);
      return;
    }

    // ✅ Token présent → Retirer de la BDD
    if (!idPanierProduit) {
      throw new Error('idPanierProduit requis pour retirer de la BDD');
    }
    try {
      await api.delete(`/panier/retirer/${idPanierProduit}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000
      });
    } catch (error: any) {
      throw handleApiError(error);
    }
  }

  /**
   * ✅ MODIFIÉ : Vider le panier (BDD ou localStorage)
   */
  async viderPanier(token?: string): Promise<void> {
    if (!token) {
      // ✅ Pas de token → Vider localStorage
      CartStorage.clearLocalCart();
      return;
    }

    // ✅ Token présent → Vider BDD
    try {
      await api.delete('/panier/vider', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000
      });
    } catch (error: any) {
      throw handleApiError(error);
    }
  }

  /**
   * ✅ MODIFIÉ : Obtenir le nombre de produits (BDD ou localStorage)
   */
  async getNombreProduits(token?: string): Promise<number> {
    if (!token) {
      // ✅ Pas de token → Compter dans localStorage
      return CartStorage.getLocalCartItemCount();
    }

    // ✅ Token présent → Compter en BDD
    try {
      const response = await api.get('/panier/count', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000
      });
      return response.data.count;
    } catch (error: any) {
      throw handleApiError(error);
    }
  }

  /**
   * ✅ NOUVEAU : Synchroniser le panier local avec la BDD
   */
/**
 * ✅ MODIFIÉ : Synchroniser le panier local avec la BDD UNIQUEMENT si le localStorage contient des produits
 */
async syncLocalCartToDB(token: string): Promise<void> {
  const localCart = CartStorage.getLocalCart();

  // ✅ CONDITION AJOUTÉE : Ne rien faire si le panier local est vide
  if (localCart.items.length === 0) {
    console.log('⏭️ Panier local vide, pas de synchronisation nécessaire');
    return; // Rien à synchroniser
  }

  console.log(`🔄 Synchronisation de ${localCart.items.length} produits du panier local vers la BDD...`);

  try {
    // Envoyer tous les produits du panier local à la BDD
    for (const item of localCart.items) {
      await this.ajouterProduit(
        item.idProduit,
        item.quantite,
        item.idProduitVariation,
        token
      );
    }

    // ✅ Vider le localStorage après synchronisation réussie
    CartStorage.clearLocalCart();
    console.log('✅ Panier local synchronisé et vidé avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation du panier:', error);
    throw error;
  }
}
}

export default new PanierService();