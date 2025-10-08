// utils/promotionValidation.ts
import { PromotionFormData } from '@/services/promotions-service';

export const validatePromotionData = (data: PromotionFormData): string[] => {
  const errors: string[] = [];

  // Validation des dates
  const dateDebut = new Date(data.dateDebut);
  const dateFin = new Date(data.dateFin);
  const maintenant = new Date();

  if (dateFin <= dateDebut) {
    errors.push('La date de fin doit être postérieure à la date de début');
  }

  if (dateDebut < maintenant && data.idPromotion === null) {
    errors.push('La date de début ne peut pas être dans le passé pour une nouvelle promotion');
  }

  // Validation des valeurs
  if (data.valeurPromotion <= 0) {
    errors.push('La valeur de la promotion doit être positive');
  }

  if (data.typePromotion === 'pourcentage' && data.valeurPromotion > 100) {
    errors.push('Le pourcentage ne peut pas dépasser 100%');
  }

  // Validation selon le type d'application
  switch (data.typeApplication) {
    case 'produit':
      if (!data.produits || data.produits.length === 0) {
        errors.push('Sélectionnez au moins un produit');
      }
      break;
    case 'categorie':
      if (!data.categories || data.categories.length === 0) {
        errors.push('Sélectionnez au moins une catégorie');
      }
      break;
    case 'marque':
      if (!data.marques || data.marques.length === 0) {
        errors.push('Sélectionnez au moins une marque');
      }
      break;
    case 'type':
      if (!data.types || data.types.length === 0) {
        errors.push('Sélectionnez au moins un type');
      }
      break;
  }

  

  return errors;
};

export const validateCodePromo = (code: string): string[] => {
  const errors: string[] = [];

  if (!code || code.trim().length === 0) {
    errors.push('Le code ne peut pas être vide');
  }

  if (code.length < 3 || code.length > 20) {
    errors.push('Le code doit contenir entre 3 et 20 caractères');
  }

  if (!/^[A-Z0-9-_]+$/.test(code)) {
    errors.push('Le code ne peut contenir que des lettres majuscules, chiffres, tirets et underscores');
  }

  return errors;
};