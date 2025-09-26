const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const AgeController = require('../controllers/ageController');

router.post('/', AgeController.create);
router.get('/', AgeController.getAll);
router.get('/:id', AgeController.getById);
router.put('/:id', AgeController.edit);
router.delete('/:id', AgeController.delete);

module.exports = router;