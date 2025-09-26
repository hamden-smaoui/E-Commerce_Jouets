const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const ProduitController = require('../controllers/produitController');


// Routes Produit
router.post('/', ProduitController.createProduit);
router.get('/search', ProduitController.searchProduits);
router.get('/search-suggestions', ProduitController.getSearchSuggestions);
router.get('/best-sellers', ProduitController.getTop10BestSellingProduits);
router.get('/', ProduitController.getAllProduits);
router.get('/:id', ProduitController.getProduitById);
router.put('/:id', ProduitController.updateProduit);
router.delete('/:id', ProduitController.deleteProduit);
router.delete('/images/:imageId', ProduitController.deleteImage);
 

module.exports = router;