const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const CommandeController = require('../controllers/commandeController');

// Routes Commande
router.get('/stats', CommandeController.getCommandeStats);

router.post('/', CommandeController.createCommande);
router.get('/', CommandeController.getAllCommandes);
router.get('/:id', CommandeController.getCommandeById);
router.put('/:id', CommandeController.updateCommande);
router.delete('/:id', CommandeController.deleteCommande);
router.get('/client/:id', CommandeController.getCommandesByClient);
// Nouvelles routes pour les commandes avec promotions
router.post('/calculer-panier', CommandeController.calculerPanier);
router.post('/valider-code-promo', CommandeController.validerCodePromo);

module.exports = router;