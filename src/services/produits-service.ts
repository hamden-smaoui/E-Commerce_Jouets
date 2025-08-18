// produits-service.ts
// Base URL for the API
const API_BASE_URL = 'http://localhost:3001/api/jouets';

// Interface for Categorie as included in the backend response
interface Categorie {
  idCategorie: number;
  nom: string;
}

// Interface for Marque as included in the backend response
interface Marque {
  idMarque: number;
  nom: string;
}

// Interface for Fournisseur as included in the backend response
interface Fournisseur {
  idFournisseur: number;
  nom: string;
}

// Interface for Type as included in the backend response
interface Type {
  idType: number;
  nom: string;
}

// Interface for images
export interface ImageData {
  idImage?: number;
  rang: number;
  url: string;
}

// Updated Produit interface to include idFournisseur
export interface Produit {
  idProduit: number;
  nom: string;
  description: string;
  prix: number;
  quantiteStock: number;
  idCategorie: number;
  idMarque: number;
  idFournisseur: number; // Added
  idType: number | null;
  trancheAge: string | null;
}

// Updated ProduitFormData interface to include idFournisseur
export interface ProduitFormData {
  idProduit?: number | null;
  nom: string;
  description: string;
  prix: number;
  quantiteStock: number;
  idCategorie: number;
  idMarque: number;
  idFournisseur: number; // Added
  idType: number | null;
  trancheAge: string | null;
  images?: File[]; // Files to upload
  imageRangs?: number[]; // Ranks corresponding to images
}

// Updated ProduitResponse interface to include fournisseur
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
  }; // Added
  type?: {
    idType: number;
    nom: string;
  };
  images?: ImageData[];
}

class ProduitsService {
  // Create a new produit with images
  async createProduit(produitData: ProduitFormData): Promise<ProduitResponse> {
    try {
      const formData = new FormData();

      // Add product data
      formData.append('nom', produitData.nom);
      formData.append('description', produitData.description);
      formData.append('prix', produitData.prix.toString());
      formData.append('quantiteStock', produitData.quantiteStock.toString());
      formData.append('idCategorie', produitData.idCategorie.toString());
      formData.append('idMarque', produitData.idMarque.toString());
      formData.append('idFournisseur', produitData.idFournisseur.toString()); // Added
      if (produitData.idType) {
        formData.append('idType', produitData.idType.toString());
      }
      if (produitData.trancheAge) {
        formData.append('trancheAge', produitData.trancheAge);
      }

      // Add images with their ranks
      if (produitData.images && produitData.images.length > 0) {
        produitData.images.forEach((image, index) => {
          formData.append('images', image);
          // Rank will be handled by the order in the array on the backend
        });
      }

      const response = await fetch(`${API_BASE_URL}/produits`, {
        method: 'POST',
        body: formData, // No Content-Type header for FormData
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

  // Get all produits with their images and associations
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

  // Get a produit by ID with its images and associations
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

  // Update a produit with images
  async updateProduit(id: number, produitData: ProduitFormData): Promise<ProduitResponse> {
    try {
      const formData = new FormData();
      
      // Ajouter les données du produit
      formData.append('nom', produitData.nom);
      formData.append('description', produitData.description);
      formData.append('prix', produitData.prix.toString());
      formData.append('quantiteStock', produitData.quantiteStock.toString());
      formData.append('idCategorie', produitData.idCategorie.toString());
      formData.append('idMarque', produitData.idMarque.toString());
      formData.append('idFournisseur', produitData.idFournisseur.toString())
      if (produitData.idType) {
        formData.append('idType', produitData.idType.toString());
      }
      if (produitData.trancheAge) {
        formData.append('trancheAge', produitData.trancheAge);
      }

      // Ajouter les images avec leurs rangs
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

  // Delete a produit
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
}

export default new ProduitsService();