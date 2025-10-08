import api from './api';

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
  couleur?: { idCouleur: number; nom: string };
  taille?: { idTaille: number; nom: string };
  age?: { idAge: number; minAge: number; maxAge: number; typeAge: 'mois' | 'ans'; label: string };
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
  async getPanier(token?: string): Promise<Cart> {
  if (!token) throw new Error('Utilisateur non authentifié');
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

  async ajouterProduit(idProduit: number, quantite: number = 1, idProduitVariation?: number, token?: string): Promise<void> {
    if (!token) throw new Error('Utilisateur non authentifié');
    try {
      const payload: any = { idProduit, quantite };
      if (idProduitVariation) payload.idProduitVariation = idProduitVariation;
      await api.post('/panier/ajouter', payload, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000
      });
    } catch (error: any) {
      handleApiError(error);
    }
  }

  async modifierQuantite(idProduit: number, quantite: number, idProduitVariation?: number, token?: string): Promise<void> {
    if (!token) throw new Error('Utilisateur non authentifié');
    try {
      const payload: any = { idProduit, quantite };
      if (idProduitVariation) payload.idProduitVariation = idProduitVariation;
      await api.put('/panier/modifier', payload, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000
      });
    } catch (error: any) {
      handleApiError(error);
    }
  }

  async retirerProduit(idPanierProduit: number, token?: string): Promise<void> {
    if (!token) throw new Error('Utilisateur non authentifié');
    try {
      await api.delete(`/panier/retirer/${idPanierProduit}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000
      });
    } catch (error: any) {
      handleApiError(error);
    }
  }

  async viderPanier(token?: string): Promise<void> {
    if (!token) throw new Error('Utilisateur non authentifié');
    try {
      await api.delete('/panier/vider', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000
      });
    } catch (error: any) {
      handleApiError(error);
    }
  }

  async getNombreProduits(token?: string): Promise<number> {
    if (!token) throw new Error('Utilisateur non authentifié');
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
}

export default new PanierService();