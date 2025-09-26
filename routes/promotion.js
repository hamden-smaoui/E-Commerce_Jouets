const express = require('express');
const router = express.Router();
const PromotionController = require('../controllers/promotionController');
const { authMiddleware } = require('../middlewares/auth');

// Routes Promotion
router.post('/', PromotionController.createPromotion);
router.get('/', PromotionController.getAllPromotions);
router.get('/:id', PromotionController.getPromotionById);
router.put('/:id', PromotionController.updatePromotion);
router.delete('/:id', PromotionController.deletePromotion);
router.post('/appliquer', PromotionController.appliquerPromotion);

// Nouvelles routes promotions
router.get('/actives/list', PromotionController.getPromotionsActives);
router.get('/stats/utilisation', PromotionController.getStatsUtilisation);
router.patch('/:id/toggle', PromotionController.togglePromotion);
router.post('/:id/dupliquer', PromotionController.dupliquerPromotion);
router.get('/produit/:idProduit', PromotionController.getPromotionsPourProduit);
router.post('/calculer-prix/:idProduit', PromotionController.calculerPrixProduit);

module.exports = router;
