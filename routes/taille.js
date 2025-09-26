const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const TailleController = require('../controllers/tailleController');

router.post('/', TailleController.create);
router.get('/', TailleController.getAll);
router.get('/:id', TailleController.getById);
router.put('/:id', TailleController.edit);
router.delete('/:id', TailleController.delete);

module.exports = router;
