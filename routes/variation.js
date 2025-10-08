const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const ProduitVariationController = require('../controllers/produitVariationController');


router.post('/produit-variations', ProduitVariationController.create);
router.get('/produit-variations', ProduitVariationController.getAll);
router.get('/produit-variations/:id', ProduitVariationController.getById);
router.put('/produit-variations/:id', ProduitVariationController.edit);
router.delete('/produit-variations/:id', ProduitVariationController.delete);

module.exports = router;