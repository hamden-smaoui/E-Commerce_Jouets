const express = require('express');
const router = express.Router();
const PromotionController = require('../controllers/promotionController');
const { authMiddleware,adminMiddleware } = require('../middlewares/auth');

// Routes Promotion
router.post('/',authMiddleware ,adminMiddleware, PromotionController.createPromotion);
router.get('/', authMiddleware ,adminMiddleware,PromotionController.getAllPromotions);
router.get('/:id',authMiddleware ,adminMiddleware, PromotionController.getPromotionById);
router.put('/:id',authMiddleware ,adminMiddleware, PromotionController.updatePromotion);
router.delete('/:id',authMiddleware ,adminMiddleware, PromotionController.deletePromotion);
router.post('/appliquer',authMiddleware ,adminMiddleware, PromotionController.appliquerPromotion);

// Nouvelles routes promotions
router.get('/actives/list',authMiddleware ,adminMiddleware, PromotionController.getPromotionsActives);
router.get('/stats/utilisation',authMiddleware ,adminMiddleware, PromotionController.getStatsUtilisation);
router.patch('/:id/toggle',authMiddleware ,adminMiddleware, PromotionController.togglePromotion);
router.post('/:id/dupliquer',authMiddleware ,adminMiddleware, PromotionController.dupliquerPromotion);
router.get('/produit/:idProduit', PromotionController.getPromotionsPourProduit);
router.post('/calculer-prix/:idProduit',authMiddleware ,adminMiddleware, PromotionController.calculerPrixProduit);

module.exports = router;
