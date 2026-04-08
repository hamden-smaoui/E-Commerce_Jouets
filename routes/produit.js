const express = require('express');
const router = express.Router();
const { authMiddleware,adminMiddleware } = require('../middlewares/auth');
const ProduitController = require('../controllers/produitController');


// Routes Produit
router.post('/',authMiddleware ,adminMiddleware, ProduitController.createProduit);
router.get('/search', ProduitController.searchProduits);
router.get('/search-suggestions', ProduitController.getSearchSuggestions);
router.get('/best-sellers', ProduitController.getTop10BestSellingProduits);
router.get('/', ProduitController.getAllProduits);
router.get('/:id', ProduitController.getProduitById);
router.put('/:id',authMiddleware ,adminMiddleware, ProduitController.updateProduit);
router.delete('/:id',authMiddleware ,adminMiddleware, ProduitController.deleteProduit);
router.delete('/images/:imageId',authMiddleware ,adminMiddleware, ProduitController.deleteImage);
 router.get('/age/:ageId', ProduitController.getProduitsByAge);
router.get('/search/stats/age', ProduitController.getSearchStatsByAge);
router.patch('/:id/toggle-active', authMiddleware, adminMiddleware, ProduitController.toggleActive);

module.exports = router;