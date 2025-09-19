const express = require('express');
const router = express.Router();
const FactureController = require('../controllers/factureController');


// Routes Facture
router.post('/', FactureController.createFacture);
router.get('/', FactureController.getAllFactures);
router.get('/:id', FactureController.getFactureById);
router.put('/:id', FactureController.updateFacture);
router.delete('/:id', FactureController.deleteFacture);
// Générer un PDF pour une facture
router.get('/:id/pdf', FactureController.generatePDF);

// Récupérer les statistiques des factures
router.get('/statsfactures', FactureController.getFactureStats);
// Dans ton fichier de routes
router.post('/commandes/:idCommande/facture', FactureController.createFactureFromCommande);

module.exports = router;


