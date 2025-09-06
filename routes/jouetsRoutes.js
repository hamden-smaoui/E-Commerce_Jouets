const express = require('express');
const router = express.Router();
const UtilisateurController = require('../controllers/utilisateurController');
const CategorieController = require('../controllers/categorieController');
const ProduitController = require('../controllers/produitController');
const CommandeController = require('../controllers/commandeController');
const LigneCommandeController = require('../controllers/ligneCommandeController');
const FactureController = require('../controllers/factureController');
const TypeController = require('../controllers/typeController');
const MarqueController = require('../controllers/marqueController');
const FournisseurController = require('../controllers/fournisseurController');
const PromotionController = require('../controllers/promotionController');
const CodePromoController = require('../controllers/codePromoController');

module.exports = router;

// Routes Utilisateur
router.post('/utilisateurs', UtilisateurController.createUtilisateur);
router.get('/utilisateurs', UtilisateurController.getAllUtilisateurs);
router.get('/utilisateurs/:id', UtilisateurController.getUtilisateurById);
router.put('/utilisateurs/:id', UtilisateurController.updateUtilisateur);
router.delete('/utilisateurs/:id', UtilisateurController.deleteUtilisateur);

// Routes Catégorie
router.post('/categories', CategorieController.createCategorie);
router.get('/categories', CategorieController.getAllCategories);
router.get('/categories/:id', CategorieController.getCategorieById);
router.put('/categories/:id', CategorieController.updateCategorie);
router.delete('/categories/:id', CategorieController.deleteCategorie);

// Routes Type
router.post('/types', TypeController.createType);
router.get('/types', TypeController.getAllTypes);
router.get('/types/:id', TypeController.getTypeById);
router.put('/types/:id', TypeController.updateType);
router.delete('/types/:id', TypeController.deleteType);

// Routes Marque
router.post('/marques', MarqueController.createMarque);
router.get('/marques', MarqueController.getAllMarques);
router.get('/marques/:id', MarqueController.getMarqueById);
router.put('/marques/:id', MarqueController.updateMarque);
router.delete('/marques/:id', MarqueController.deleteMarque);

router.post('/fournisseurs', FournisseurController.createFournisseur);
router.get('/fournisseurs', FournisseurController.getAllFournisseurs);
router.get('/fournisseurs/:id', FournisseurController.getFournisseurById);
router.put('/fournisseurs/:id', FournisseurController.updateFournisseur);
router.delete('/fournisseurs/:id', FournisseurController.deleteFournisseur);

// Routes Produit
router.post('/produits', ProduitController.createProduit);
router.get('/produits', ProduitController.getAllProduits);
router.get('/produits/:id', ProduitController.getProduitById);
router.put('/produits/:id', ProduitController.updateProduit);
router.delete('/produits/:id', ProduitController.deleteProduit);
router.delete('/images/:imageId', ProduitController.deleteImage);
router.get('/best-sellers', ProduitController.getTop10BestSellingProduits);
router.get('/search', ProduitController.searchProduits);
router.get('/search-suggestions', ProduitController.getSearchSuggestions); 
// Routes Commande
router.get('/commandes/stats', CommandeController.getCommandeStats);

router.post('/commandes', CommandeController.createCommande);
router.get('/commandes', CommandeController.getAllCommandes);
router.get('/commandes/:id', CommandeController.getCommandeById);
router.put('/commandes/:id', CommandeController.updateCommande);
router.delete('/commandes/:id', CommandeController.deleteCommande);
router.get('/commandes/client/:id', CommandeController.getCommandesByClient);
// Nouvelles routes pour les commandes avec promotions
router.post('/commandes/calculer-panier', CommandeController.calculerPanier);
router.post('/commandes/valider-code-promo', CommandeController.validerCodePromo);

// Routes LigneCommande
router.post('/lignes-commandes', LigneCommandeController.createLigneCommande);
router.get('/lignes-commandes', LigneCommandeController.getAllLignesCommandes);
router.get('/lignes-commandes/:id', LigneCommandeController.getLigneCommandeById);
router.put('/lignes-commandes/:id', LigneCommandeController.updateLigneCommande);
router.delete('/lignes-commandes/:id', LigneCommandeController.deleteLigneCommande);

// Routes Facture
router.post('/factures', FactureController.createFacture);
router.get('/factures', FactureController.getAllFactures);
router.get('/factures/:id', FactureController.getFactureById);
router.put('/factures/:id', FactureController.updateFacture);
router.delete('/factures/:id', FactureController.deleteFacture);


// Routes Promotion
router.post('/promotions', PromotionController.createPromotion);
router.get('/promotions', PromotionController.getAllPromotions);
router.get('/promotions/:id', PromotionController.getPromotionById);
router.put('/promotions/:id', PromotionController.updatePromotion);
router.delete('/promotions/:id', PromotionController.deletePromotion);
router.post('/promotions/appliquer', PromotionController.appliquerPromotion);

// Nouvelles routes promotions
router.get('/promotions/actives/list', PromotionController.getPromotionsActives);
router.get('/promotions/stats/utilisation', PromotionController.getStatsUtilisation);
router.patch('/promotions/:id/toggle', PromotionController.togglePromotion);
router.post('/promotions/:id/dupliquer', PromotionController.dupliquerPromotion);
router.get('/promotions/produit/:idProduit', PromotionController.getPromotionsPourProduit);
router.post('/promotions/calculer-prix/:idProduit', PromotionController.calculerPrixProduit);


// Routes CodePromo
router.post('/codes-promo', CodePromoController.createCodePromo);
router.get('/codes-promo', CodePromoController.getAllCodesPromo);
router.get('/codes-promo/:id', CodePromoController.getCodePromoById);
router.put('/codes-promo/:id', CodePromoController.updateCodePromo);
router.delete('/codes-promo/:id', CodePromoController.deleteCodePromo);

// Routes spéciales codes promo
router.get('/codes-promo/valider/:code', CodePromoController.validerCode);
router.post('/codes-promo/generer', CodePromoController.genererCodesPromo);
router.get('/codes-promo/stats/utilisation', CodePromoController.getStatsCodesPromo);
router.get('/codes-promo/export', CodePromoController.exporterCodesPromo);
router.patch('/codes-promo/:id/toggle', CodePromoController.toggleCodePromo);
router.post('/codes-promo/dupliquer', CodePromoController.dupliquerCodesPromo);
module.exports = router;