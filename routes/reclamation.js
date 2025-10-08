const express = require('express');
const router = express.Router();
const ReclamationController = require('../controllers/reclamationController');
const { authMiddleware,adminMiddleware } = require('../middlewares/auth');

// Routes protégées par authentification
router.post('/', ReclamationController.createReclamation);
router.get('/', authMiddleware ,adminMiddleware, ReclamationController.getAllReclamations);
router.get('/:id', authMiddleware ,adminMiddleware, ReclamationController.getReclamationById);
router.put('/:id', authMiddleware ,adminMiddleware, ReclamationController.updateReclamation);
router.delete('/:id', authMiddleware ,adminMiddleware, ReclamationController.deleteReclamation);
router.get('/user/:idUtilisateur', authMiddleware, ReclamationController.getReclamationsByUser);

module.exports = router;