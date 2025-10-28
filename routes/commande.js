const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');
const CommandeController = require('../controllers/commandeController');

// ============================================
// ROUTES ADMIN (nécessitent authentification)
// ============================================
router.get('/stats', authMiddleware, adminMiddleware, CommandeController.getCommandeStats);
router.get('/', authMiddleware, adminMiddleware, CommandeController.getAllCommandes);
router.delete('/:id', authMiddleware, adminMiddleware, CommandeController.deleteCommande);

// ============================================
// ROUTES CLIENT AUTHENTIFIÉ
// ============================================
router.get('/client', authMiddleware, CommandeController.getCommandesByClient);

// ============================================
// 🆕 ROUTES PUBLIQUES (connecté OU non-connecté)
// ============================================
// Créer une commande (authentifié ou guest)
router.post('/', CommandeController.createCommande);

// Calculer panier (authentifié ou guest)
router.post('/calculer-panier', CommandeController.calculerPanier);

// Valider code promo (authentifié ou guest)
router.post('/valider-code-promo', CommandeController.validerCodePromo);

// ============================================
// ROUTES GUEST (commandes invités)
// ============================================
router.post('/guest', CommandeController.createCommandeGuest);
router.get('/guest/:id', CommandeController.getCommandeByIdGuest);
router.put('/guest/:id/cancel', CommandeController.cancelCommandeGuest);

// ============================================
// ROUTES MIXTES (authentifié avec :id ou guest avec token)
// ============================================
// Récupérer une commande (si authentifié = route protégée, si guest = via token)
router.get('/:id', authMiddleware, CommandeController.getCommandeById);

// Mettre à jour une commande (si authentifié = route protégée, si guest = via token)
router.put('/:id', authMiddleware, CommandeController.updateCommande);

module.exports = router;