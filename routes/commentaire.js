const express = require('express');
const router = express.Router();
const CommentaireController = require('../controllers/commentaireController');
const { authMiddleware } = require('../middlewares/auth');

router.post('/', authMiddleware, CommentaireController.createCommentaire);
router.get('/produit/:idProduit', CommentaireController.getCommentairesByProduit);
router.put('/:idCommentaire', authMiddleware, CommentaireController.updateCommentaire);
router.delete('/:idCommentaire', authMiddleware, CommentaireController.deleteCommentaire);
router.get('/mes-commentaires', authMiddleware, CommentaireController.getCommentairesByUtilisateur);

module.exports = router;