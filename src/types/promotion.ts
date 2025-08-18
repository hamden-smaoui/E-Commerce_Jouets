// types/promotion.ts
export type TypePromotion = 'pourcentage' | 'montant_fixe' | 'livraison_gratuite';
export type TypeApplication = 'produit' | 'categorie' | 'type' | 'marque' | 'panier' | 'global';

export interface BasePromotion {
  idPromotion: number;
  nom: string;
  description: string | null;
  typePromotion: TypePromotion;
  valeurPromotion: number;
  typeApplication: TypeApplication;
  conditionMinimum: number | null;
  quantiteMinimum: number | null;
  dateDebut: string;
  dateFin: string;
  actif: boolean;
  utilisationMax: number | null;
  utilisationParClient: number | null;
  utilisationActuelle: number;
  createdAt: string;
  updatedAt: string;
}

export interface BaseCodePromo {
  idCodePromo: number;
  code: string;
  idPromotion: number;
  actif: boolean;
  utilisationMax: number | null;
  utilisationActuelle: number;
  createdAt: string;
  updatedAt: string;
}