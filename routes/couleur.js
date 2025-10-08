const express = require('express');
const router = express.Router();
const CouleurController = require('../controllers/couleurController');
const { authMiddleware ,adminMiddleware } = require('../middlewares/auth');


router.post('/',authMiddleware,adminMiddleware, CouleurController.create);
router.get('/',authMiddleware,adminMiddleware, CouleurController.getAll);
router.get('/:id',authMiddleware,adminMiddleware, CouleurController.getById);
router.put('/:id',authMiddleware,adminMiddleware, CouleurController.edit);
router.delete('/:id',authMiddleware,adminMiddleware, CouleurController.delete);

module.exports = router;
