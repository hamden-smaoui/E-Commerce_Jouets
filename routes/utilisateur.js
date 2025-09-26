const express = require('express');
const router = express.Router();
const UtilisateurController = require('../controllers/utilisateurController');
const { authMiddleware } = require('../middlewares/auth');


// Routes Utilisateur
router.post('/', UtilisateurController.createUtilisateur);
router.get('/', UtilisateurController.getAllUtilisateurs);
router.get('/:id', UtilisateurController.getUtilisateurById);
router.put('/:id', UtilisateurController.updateUtilisateur);
router.delete('/:id', UtilisateurController.deleteUtilisateur);
module.exports = router;