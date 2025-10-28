import { CartItem, Produit, ProduitVariation } from '@/services/panier-service';

export interface LocalCartItem {
  idProduit: number;
  idProduitVariation?: number;
  quantite: number;
  prixUnitaire: number;
  produit: Produit;
  variation?: ProduitVariation;
  addedAt: string;
}

export interface LocalCart {
  items: LocalCartItem[];
  lastUpdated: string;
}

const CART_STORAGE_KEY = 'bambyjoy_cart';

/**
 * Récupérer le panier depuis localStorage
 */
export function getLocalCart(): LocalCart {
  if (typeof window === 'undefined') {
    return { items: [], lastUpdated: new Date().toISOString() };
  }

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) {
      return { items: [], lastUpdated: new Date().toISOString() };
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Erreur lors de la lecture du panier local:', error);
    return { items: [], lastUpdated: new Date().toISOString() };
  }
}

/**
 * Sauvegarder le panier dans localStorage
 */
export function saveLocalCart(cart: LocalCart): void {
  if (typeof window === 'undefined') return;

  try {
    cart.lastUpdated = new Date().toISOString();
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du panier local:', error);
  }
}

/**
 * Ajouter un produit au panier local
 */
export function addToLocalCart(
  idProduit: number,
  quantite: number,
  prixUnitaire: number,
  produit: Produit,
  idProduitVariation?: number,
  variation?: ProduitVariation
): void {
  const cart = getLocalCart();

  // Vérifier si le produit existe déjà
  const existingItemIndex = cart.items.findIndex(
    (item) =>
      item.idProduit === idProduit &&
      item.idProduitVariation === idProduitVariation
  );

  if (existingItemIndex !== -1) {
    // Produit existe → Augmenter la quantité
    cart.items[existingItemIndex].quantite += quantite;
  } else {
    // Nouveau produit → Ajouter
    cart.items.push({
      idProduit,
      idProduitVariation,
      quantite,
      prixUnitaire,
      produit,
      variation,
      addedAt: new Date().toISOString(),
    });
  }

  saveLocalCart(cart);
}

/**
 * Modifier la quantité d'un produit dans le panier local
 */
export function updateLocalCartQuantity(
  idProduit: number,
  quantite: number,
  idProduitVariation?: number
): void {
  const cart = getLocalCart();

  const itemIndex = cart.items.findIndex(
    (item) =>
      item.idProduit === idProduit &&
      item.idProduitVariation === idProduitVariation
  );

  if (itemIndex !== -1) {
    if (quantite <= 0) {
      // Supprimer si quantité = 0
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantite = quantite;
    }
    saveLocalCart(cart);
  }
}

/**
 * Retirer un produit du panier local
 */
export function removeFromLocalCart(
  idProduit: number,
  idProduitVariation?: number
): void {
  const cart = getLocalCart();

  cart.items = cart.items.filter(
    (item) =>
      !(
        item.idProduit === idProduit &&
        item.idProduitVariation === idProduitVariation
      )
  );

  saveLocalCart(cart);
}

/**
 * Vider complètement le panier local
 */
export function clearLocalCart(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_STORAGE_KEY);
}

/**
 * Obtenir le nombre total d'articles dans le panier local
 */
export function getLocalCartItemCount(): number {
  const cart = getLocalCart();
  return cart.items.reduce((sum, item) => sum + item.quantite, 0);
}

/**
 * Calculer le prix total du panier local
 */
export function getLocalCartTotal(): number {
  const cart = getLocalCart();
  return cart.items.reduce(
    (sum, item) => sum + item.prixUnitaire * item.quantite,
    0
  );
}