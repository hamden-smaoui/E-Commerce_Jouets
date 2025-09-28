const express = require('express');
const router = express.Router();
const { authMiddleware ,adminMiddleware } = require('../middlewares/auth');
const FournisseurController = require('../controllers/fournisseurController');



router.post('/',authMiddleware ,adminMiddleware, FournisseurController.createFournisseur);
router.get('/',authMiddleware ,adminMiddleware, FournisseurController.getAllFournisseurs);
router.get('/:id',authMiddleware ,adminMiddleware, FournisseurController.getFournisseurById);
router.put('/:id',authMiddleware ,adminMiddleware, FournisseurController.updateFournisseur);
router.delete('/:id',authMiddleware ,adminMiddleware, FournisseurController.deleteFournisseur);

module.exports = router;