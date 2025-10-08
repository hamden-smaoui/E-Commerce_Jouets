const express = require('express');
const router = express.Router();
const FactureController = require('../controllers/factureController');
const { authMiddleware,adminMiddleware } = require('../middlewares/auth');

// Routes Facture
router.post('/',authMiddleware,adminMiddleware, FactureController.createFacture);
router.get('/statsfactures',authMiddleware,adminMiddleware, FactureController.getFactureStats);
router.get('/',authMiddleware,adminMiddleware, FactureController.getAllFactures);
router.get('/:id',authMiddleware,adminMiddleware, FactureController.getFactureById);
router.put('/:id',authMiddleware,adminMiddleware, FactureController.updateFacture);
router.delete('/:id',authMiddleware,adminMiddleware, FactureController.deleteFacture);
// Générer un PDF pour une facture
router.get('/:id/pdf',authMiddleware,adminMiddleware, FactureController.generatePDF);

// Récupérer les statistiques des factures
router.post('/commandes/:idCommande/facture',authMiddleware,adminMiddleware, FactureController.createFactureFromCommande.bind(FactureController));

module.exports = router;


