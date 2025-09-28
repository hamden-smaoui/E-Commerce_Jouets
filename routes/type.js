const express = require('express');
const router = express.Router();
const TypeController = require('../controllers/typeController');
const { authMiddleware,adminMiddleware } = require('../middlewares/auth');


router.post('/',authMiddleware ,adminMiddleware, TypeController.createType);
router.get('/', TypeController.getAllTypes);
router.get('/:id',authMiddleware ,adminMiddleware, TypeController.getTypeById);
router.put('/:id',authMiddleware ,adminMiddleware, TypeController.updateType);
router.delete('/:id',authMiddleware ,adminMiddleware, TypeController.deleteType);


module.exports = router;