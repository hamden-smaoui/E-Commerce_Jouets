const express = require('express');
const router = express.Router();
const FavoriController = require('../controllers/favoriController');
const { authMiddleware } = require('../middlewares/auth');

// Routes protégées par authentification
router.get('/user/:idUtilisateur', authMiddleware, FavoriController.getAllFavorisByUser);
router.post('/', authMiddleware, FavoriController.addFavori);
router.delete('/:idFavori', authMiddleware, FavoriController.deleteFavori);
router.delete('/user/:idUtilisateur',authMiddleware, FavoriController.deleteAllFavorisByUser);
module.exports = router;
