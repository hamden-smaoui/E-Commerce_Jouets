import api from './api';

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

// Nouveaux interfaces pour les variations
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
  genre: 'fille' | 'garçon' | 'enfant';
}

// Nouveau format pour les données du formulaire
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
  genre: 'fille' | 'garçon' | 'enfant';
  images?: File[];
  imageRangs?: number[];
  variants?: {
    idCouleur: number;
    idTaille?: number;
    idAge?: number;
    quantiteStock: number;
  }[];
}

export interface BestSellingProduit extends ProduitResponse {
  totalVendu: number;
}

export interface ProduitResponse extends Produit {
  categorie?: Categorie;
  marque?: Marque;
  fournisseur?: Fournisseur;
  type?: Type;
  images?: ImageData[];
  variations?: ProduitVariation[];
}

class ProduitsService {
  async createProduit(produitData: ProduitFormData, token?: string): Promise<ProduitResponse> {
    const headers: any = { 'Content-Type': 'multipart/form-data' };
    if (token) headers.Authorization = `Bearer ${token}`;
    const formData = new FormData();
    formData.append('nom', produitData.nom);
    formData.append('description', produitData.description);
    formData.append('prix', produitData.prix.toString());
    formData.append('quantiteStock', produitData.quantiteStock.toString());
    formData.append('idCategorie', produitData.idCategorie.toString());
    formData.append('idMarque', produitData.idMarque.toString());
    formData.append('idFournisseur', produitData.idFournisseur.toString());
    if (produitData.idType) formData.append('idType', produitData.idType.toString());
    formData.append('genre', produitData.genre);
    if (produitData.variants?.length) formData.append('variants', JSON.stringify(produitData.variants));
    if (produitData.images?.length) produitData.images.forEach(img => formData.append('images', img));

    const response = await api.post<{ data: ProduitResponse }>('/produits', formData, { headers });
    return response.data.data;
  }

  async getAllProduits(token?: string): Promise<ProduitResponse[]> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<ProduitResponse[]>('/produits', { headers });
    return response.data;
  }

  async getProduitById(id: number, token?: string): Promise<ProduitResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<ProduitResponse>(`/produits/${id}`, { headers });
    return response.data;
  }

  async updateProduit(id: number, produitData: ProduitFormData, token?: string): Promise<ProduitResponse> {
    const headers: any = { 'Content-Type': 'multipart/form-data' };
    if (token) headers.Authorization = `Bearer ${token}`;
    const formData = new FormData();
    formData.append('nom', produitData.nom);
    formData.append('description', produitData.description);
    formData.append('prix', produitData.prix.toString());
    formData.append('quantiteStock', produitData.quantiteStock.toString());
    formData.append('idCategorie', produitData.idCategorie.toString());
    formData.append('idMarque', produitData.idMarque.toString());
    formData.append('idFournisseur', produitData.idFournisseur.toString());
    if (produitData.idType) formData.append('idType', produitData.idType.toString());
    formData.append('genre', produitData.genre);
    if (produitData.variants?.length) formData.append('variants', JSON.stringify(produitData.variants));
    if (produitData.images?.length) produitData.images.forEach(img => formData.append('images', img));

    const response = await api.put<{ data: ProduitResponse }>(`/produits/${id}`, formData, { headers });
    return response.data.data;
  }

  async deleteProduit(id: number, token?: string): Promise<void> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await api.delete(`/produits/${id}`, { headers });
  }

  async getTop10BestSellingProduits(token?: string): Promise<BestSellingProduit[]> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<{ data: BestSellingProduit[] }>('/produits/best-sellers', { headers });
    return response.data.data;
  }

  async deleteImage(imageId: number, token?: string): Promise<void> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await api.delete(`/produits/images/${imageId}`, { headers });
  }
}

export default new ProduitsService();