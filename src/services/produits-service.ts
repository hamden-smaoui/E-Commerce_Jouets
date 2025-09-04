const API_BASE_URL = 'http://localhost:3001/api/jouets';

interface Categorie {
  idCategorie: number;
  nom: string;
}

interface Marque {
  idMarque: number;
  nom: string;
}

interface Fournisseur {
  idFournisseur: number;
  nom: string;
}

interface Type {
  idType: number;
  nom: string;
}

export interface ImageData {
  idImage: number;
  rang: number;
  url: string;
}

export interface Produit {
  idProduit: number;
  nom: string;
  description: string;
  prix: number;
  quantiteStock: number;
  idCategorie: number;
  idMarque: number;
  idFournisseur: number;
  idType: number | null;
  minAge: string | null;
  maxAge: string | null;
  typeAge: 'mois' | 'ans';
  genre: 'fille' | 'garçon' | 'enfant';
}

export interface ProduitFormData {
  idProduit?: number | null;
  nom: string;
  description: string;
  prix: number;
  quantiteStock: number;
  idCategorie: number;
  idMarque: number;
  idFournisseur: number;
  idType: number | null;
  minAge: string | null;
  maxAge: string | null;
  typeAge: 'mois' | 'ans';
  genre: 'fille' | 'garçon' | 'enfant';
  images?: File[];
  imageRangs?: number[];
}

export interface BestSellingProduit extends ProduitResponse {
  totalVendu: number;
}

export interface ProduitResponse extends Produit {
  categorie?: {
    idCategorie: number;
    nom: string;
  };
  marque?: {
    idMarque: number;
    nom: string;
  };
  fournisseur?: {
    idFournisseur: number;
    nom: string;
  };
  type?: {
    idType: number;
    nom: string;
  };
  images?: ImageData[];
}

class ProduitsService {
  async createProduit(produitData: ProduitFormData): Promise<ProduitResponse> {
    try {
      const formData = new FormData();

      formData.append('nom', produitData.nom);
      formData.append('description', produitData.description);
      formData.append('prix', produitData.prix.toString());
      formData.append('quantiteStock', produitData.quantiteStock.toString());
      formData.append('idCategorie', produitData.idCategorie.toString());
      formData.append('idMarque', produitData.idMarque.toString());
      formData.append('idFournisseur', produitData.idFournisseur.toString());
      if (produitData.idType) {
        formData.append('idType', produitData.idType.toString());
      }
      if (produitData.minAge) {
        formData.append('minAge', produitData.minAge);
      }
      if (produitData.maxAge) {
        formData.append('maxAge', produitData.maxAge);
      }
      formData.append('typeAge', produitData.typeAge);
      formData.append('genre', produitData.genre);

      if (produitData.images && produitData.images.length > 0) {
        produitData.images.forEach((image) => {
          formData.append('images', image);
        });
      }

      const response = await fetch(`${API_BASE_URL}/produits`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create produit');
      }

      const data = await response.json();
      return data.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error creating produit: ${message}`);
    }
  }

  async getAllProduits(): Promise<ProduitResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/produits`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch produits');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching produits: ${message}`);
    }
  }

  async getProduitById(id: number): Promise<ProduitResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/produits/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch produit');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching produit: ${message}`);
    }
  }

  async updateProduit(id: number, produitData: ProduitFormData): Promise<ProduitResponse> {
    try {
      const formData = new FormData();

      formData.append('nom', produitData.nom);
      formData.append('description', produitData.description);
      formData.append('prix', produitData.prix.toString());
      formData.append('quantiteStock', produitData.quantiteStock.toString());
      formData.append('idCategorie', produitData.idCategorie.toString());
      formData.append('idMarque', produitData.idMarque.toString());
      formData.append('idFournisseur', produitData.idFournisseur.toString());
      if (produitData.idType) {
        formData.append('idType', produitData.idType.toString());
      }
      if (produitData.minAge) {
        formData.append('minAge', produitData.minAge);
      }
      if (produitData.maxAge) {
        formData.append('maxAge', produitData.maxAge);
      }
      formData.append('typeAge', produitData.typeAge);
      formData.append('genre', produitData.genre);

      if (produitData.images && produitData.images.length > 0) {
        produitData.images.forEach((image) => {
          formData.append('images', image);
        });
      }

      const response = await fetch(`${API_BASE_URL}/produits/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update produit');
      }

      const data = await response.json();
      return data.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error updating produit: ${message}`);
    }
  }

  async deleteProduit(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/produits/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete produit');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error deleting produit: ${message}`);
    }
  }

  async getTop10BestSellingProduits(): Promise<BestSellingProduit[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/best-sellers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch best selling products');
      }

      const data = await response.json();
      return data.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching best selling products: ${message}`);
    }
  }
}

export default new ProduitsService();