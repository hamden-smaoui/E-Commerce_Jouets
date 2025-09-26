const express = require('express');
const router = express.Router();
const TypeController = require('../controllers/typeController');
const { authMiddleware } = require('../middlewares/auth');

// Routes Type
router.post('/', TypeController.createType);
router.get('/', TypeController.getAllTypes);
router.get('/:id', TypeController.getTypeById);
router.put('/:id', TypeController.updateType);
router.delete('/:id', TypeController.deleteType);


module.exports = router;