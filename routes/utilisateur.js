const express = require('express');
const router = express.Router();
const UtilisateurController = require('../controllers/utilisateurController');
const { authMiddleware,adminMiddleware } = require('../middlewares/auth');


// Routes Utilisateur
router.post('/',authMiddleware ,adminMiddleware, UtilisateurController.createUtilisateur);
router.get('/',authMiddleware ,adminMiddleware, UtilisateurController.getAllUtilisateurs);
router.get('/:id',authMiddleware , UtilisateurController.getUtilisateurById);
router.put('/:id', authMiddleware ,UtilisateurController.updateUtilisateur);
router.delete('/:id',authMiddleware ,adminMiddleware, UtilisateurController.deleteUtilisateur);
module.exports = router;