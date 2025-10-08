const express = require('express');
const router = express.Router();
const { authMiddleware ,adminMiddleware } = require('../middlewares/auth');
const LigneCommandeController = require('../controllers/ligneCommandeController');
// Routes LigneCommande
router.post('/lignes-commandes',authMiddleware ,adminMiddleware, LigneCommandeController.createLigneCommande);
router.get('/lignes-commandes',authMiddleware ,adminMiddleware, LigneCommandeController.getAllLignesCommandes);
router.get('/lignes-commandes/:id',authMiddleware ,adminMiddleware, LigneCommandeController.getLigneCommandeById);
router.put('/lignes-commandes/:id',authMiddleware ,adminMiddleware, LigneCommandeController.updateLigneCommande);
router.delete('/lignes-commandes/:id',authMiddleware ,adminMiddleware, LigneCommandeController.deleteLigneCommande);

module.exports = router;