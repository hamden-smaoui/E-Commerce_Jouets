const express = require('express');
const router = express.Router();
const { authMiddleware,adminMiddleware } = require('../middlewares/auth');
const AgeController = require('../controllers/ageController');

router.post('/',authMiddleware,adminMiddleware, AgeController.create);
router.get('/',authMiddleware,adminMiddleware, AgeController.getAll);
router.get('/:id', authMiddleware,adminMiddleware,AgeController.getById);
router.put('/:id', authMiddleware,adminMiddleware,AgeController.edit);
router.delete('/:id',authMiddleware,adminMiddleware, AgeController.delete);

module.exports = router;