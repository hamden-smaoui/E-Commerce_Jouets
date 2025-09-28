const express = require('express');
const router = express.Router();
const CategorieController = require('../controllers/categorieController');
const { authMiddleware,adminMiddleware } = require('../middlewares/auth');

// Routes Catégorie
router.post('/', authMiddleware,adminMiddleware, CategorieController.createCategorie);
router.get('/', CategorieController.getAllCategories);
router.get('/:id', authMiddleware,adminMiddleware,CategorieController.getCategorieById);
router.put('/:id', authMiddleware,adminMiddleware, CategorieController.updateCategorie);
router.delete('/:id', authMiddleware,adminMiddleware, CategorieController.deleteCategorie);


module.exports = router;
