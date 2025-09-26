const express = require('express');
const router = express.Router();
const CouleurController = require('../controllers/couleurController');
const { authMiddleware } = require('../middlewares/auth');


router.post('/', CouleurController.create);
router.get('/', CouleurController.getAll);
router.get('/:id', CouleurController.getById);
router.put('/:id', CouleurController.edit);
router.delete('/:id', CouleurController.delete);

module.exports = router;
