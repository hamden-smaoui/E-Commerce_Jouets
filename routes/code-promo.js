
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const CodePromoController = require('../controllers/codePromoController');


// Routes CodePromo
router.post('/', CodePromoController.createCodePromo);
router.get('/', CodePromoController.getAllCodesPromo);
router.get('/:id', CodePromoController.getCodePromoById);
router.put('/:id', CodePromoController.updateCodePromo);
router.delete('/:id', CodePromoController.deleteCodePromo);

// Routes spéciales codes promo
router.get('/valider/:code', CodePromoController.validerCode);
router.post('/generer', CodePromoController.genererCodesPromo);
router.get('/stats/utilisation', CodePromoController.getStatsCodesPromo);
router.get('/export', CodePromoController.exporterCodesPromo);
router.patch('/:id/toggle', CodePromoController.toggleCodePromo);

module.exports = router;