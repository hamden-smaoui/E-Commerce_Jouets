const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const LigneCommandeController = require('../controllers/ligneCommandeController');
// Routes LigneCommande
router.post('/lignes-commandes', LigneCommandeController.createLigneCommande);
router.get('/lignes-commandes', LigneCommandeController.getAllLignesCommandes);
router.get('/lignes-commandes/:id', LigneCommandeController.getLigneCommandeById);
router.put('/lignes-commandes/:id', LigneCommandeController.updateLigneCommande);
router.delete('/lignes-commandes/:id', LigneCommandeController.deleteLigneCommande);

module.exports = router;