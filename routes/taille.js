const express = require('express');
const router = express.Router();
const { authMiddleware,adminMiddleware   } = require('../middlewares/auth');
const TailleController = require('../controllers/tailleController');

router.post('/',authMiddleware ,adminMiddleware, TailleController.create);
router.get('/', authMiddleware ,adminMiddleware,TailleController.getAll);
router.get('/:id',authMiddleware ,adminMiddleware, TailleController.getById);
router.put('/:id', authMiddleware ,adminMiddleware,TailleController.edit);
router.delete('/:id',authMiddleware ,adminMiddleware, TailleController.delete);

module.exports = router;
