const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const FournisseurController = require('../controllers/fournisseurController');



router.post('/', FournisseurController.createFournisseur);
router.get('/', FournisseurController.getAllFournisseurs);
router.get('/:id', FournisseurController.getFournisseurById);
router.put('/:id', FournisseurController.updateFournisseur);
router.delete('/:id', FournisseurController.deleteFournisseur);

module.exports = router;