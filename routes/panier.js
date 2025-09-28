const express = require('express');
const router = express.Router();
const PanierController = require('../controllers/panierController');
const { authMiddleware } = require('../middlewares/auth');

// Routes protégées par authentification
router.get('/', authMiddleware, PanierController.getPanier);
router.post('/ajouter', authMiddleware, PanierController.ajouterProduit);
router.put('/modifier', authMiddleware, PanierController.modifierQuantite);
router.delete('/retirer/:idPanierProduit', authMiddleware, PanierController.retirerProduit);
router.delete('/vider', authMiddleware, PanierController.viderPanier);
router.get('/count', authMiddleware, PanierController.getNombreProduits);

module.exports = router; 