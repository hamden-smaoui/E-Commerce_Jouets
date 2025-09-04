const express = require('express');
const router = express.Router();
const ReclamationController = require('../controllers/reclamationController');
const { authMiddleware } = require('../middlewares/auth');

// Routes protégées par authentification
router.post('/', authMiddleware, ReclamationController.createReclamation);
router.get('/', authMiddleware, ReclamationController.getAllReclamations);
router.get('/:id', authMiddleware, ReclamationController.getReclamationById);
router.put('/:id', authMiddleware, ReclamationController.updateReclamation);
router.delete('/:id', authMiddleware, ReclamationController.deleteReclamation);
router.get('/user/:idUtilisateur', authMiddleware, ReclamationController.getReclamationsByUser);

module.exports = router;