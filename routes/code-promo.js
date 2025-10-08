
const express = require('express');
const router = express.Router();
const { authMiddleware,adminMiddleware } = require('../middlewares/auth');
const CodePromoController = require('../controllers/codePromoController');


// Routes CodePromo
router.post('/',authMiddleware,adminMiddleware, CodePromoController.createCodePromo);
router.get('/',authMiddleware,adminMiddleware, CodePromoController.getAllCodesPromo);
router.get('/:id',authMiddleware,adminMiddleware, CodePromoController.getCodePromoById);
router.put('/:id',authMiddleware,adminMiddleware, CodePromoController.updateCodePromo);
router.delete('/:id',authMiddleware,adminMiddleware, CodePromoController.deleteCodePromo);

// Routes spéciales codes promo
router.get('/valider/:code',authMiddleware, CodePromoController.validerCode);
router.post('/generer',authMiddleware,adminMiddleware, CodePromoController.genererCodesPromo);
router.get('/stats/utilisation', authMiddleware,adminMiddleware,CodePromoController.getStatsCodesPromo);
router.get('/export',authMiddleware,adminMiddleware, CodePromoController.exporterCodesPromo);
router.patch('/:id/toggle', authMiddleware,adminMiddleware,CodePromoController.toggleCodePromo);

module.exports = router;