const express = require('express');
const router = express.Router();
const AvisController = require('../controllers/avisController');
const { authMiddleware } = require('../middlewares/auth');

// Routes pour les Avis
router.post('/', authMiddleware, AvisController.createOrUpdateAvis);
router.get('/produit/:idProduit', AvisController.getAvisByProduit);
router.get('/statistiques/:idProduit', AvisController.getAvisStatistiques);
router.get('/mon-avis/:idProduit', authMiddleware, AvisController.getMonAvis);
router.delete('/:idAvis', authMiddleware, AvisController.deleteAvis);


module.exports = router;