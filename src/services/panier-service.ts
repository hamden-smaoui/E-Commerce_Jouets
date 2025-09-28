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

class PanierService {
  async getPanier(token?: string): Promise<Cart> {
    if (!token) throw new Error('Utilisateur non authentifié');
    const response = await api.get('/panier', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  }

  async ajouterProduit(idProduit: number, quantite: number = 1, idProduitVariation?: number, token?: string): Promise<void> {
    if (!token) throw new Error('Utilisateur non authentifié');
    const payload: any = { idProduit, quantite };
    if (idProduitVariation) payload.idProduitVariation = idProduitVariation;
    await api.post('/panier/ajouter', payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  async modifierQuantite(idProduit: number, quantite: number, idProduitVariation?: number, token?: string): Promise<void> {
    if (!token) throw new Error('Utilisateur non authentifié');
    const payload: any = { idProduit, quantite };
    if (idProduitVariation) payload.idProduitVariation = idProduitVariation;
    await api.put('/panier/modifier', payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  async retirerProduit(idPanierProduit: number, token?: string): Promise<void> {
    if (!token) throw new Error('Utilisateur non authentifié');
    await api.delete(`/panier/retirer/${idPanierProduit}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  async viderPanier(token?: string): Promise<void> {
    if (!token) throw new Error('Utilisateur non authentifié');
    await api.delete('/panier/vider', {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  async getNombreProduits(token?: string): Promise<number> {
    if (!token) throw new Error('Utilisateur non authentifié');
    const response = await api.get('/panier/count', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.count;
  }
}

export default new PanierService();