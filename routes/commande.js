const express = require('express');
const router = express.Router();
const { authMiddleware,adminMiddleware } = require('../middlewares/auth');
const CommandeController = require('../controllers/commandeController');

// Routes Commande
router.get('/stats',authMiddleware,adminMiddleware, CommandeController.getCommandeStats);
router.get('/client',authMiddleware, CommandeController.getCommandesByClient);

router.post('/',authMiddleware, CommandeController.createCommande);
router.get('/',authMiddleware,adminMiddleware, CommandeController.getAllCommandes);
router.get('/:id',authMiddleware, CommandeController.getCommandeById);
router.put('/:id',authMiddleware, CommandeController.updateCommande);
router.delete('/:id',authMiddleware,adminMiddleware, CommandeController.deleteCommande);
// Nouvelles routes pour les commandes avec promotions
router.post('/calculer-panier', authMiddleware,CommandeController.calculerPanier);
router.post('/valider-code-promo',authMiddleware, CommandeController.validerCodePromo);
router.post('/guest', CommandeController.createCommandeGuest);

// Récupérer une commande guest avec token
router.get('/guest/:id', CommandeController.getCommandeByIdGuest);
router.put('/guest/:id/cancel', CommandeController.cancelCommandeGuest);

module.exports = router;