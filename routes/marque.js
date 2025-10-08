const express = require('express');
const router = express.Router();
const { authMiddleware ,adminMiddleware } = require('../middlewares/auth');
const MarqueController = require('../controllers/marqueController');


// Routes Marque
router.post('/',authMiddleware ,adminMiddleware, MarqueController.createMarque);
router.get('/' , MarqueController.getAllMarques);
router.get('/:id',authMiddleware ,adminMiddleware, MarqueController.getMarqueById);
router.put('/:id',authMiddleware ,adminMiddleware, MarqueController.updateMarque);
router.delete('/:id',authMiddleware ,adminMiddleware, MarqueController.deleteMarque);

module.exports = router;