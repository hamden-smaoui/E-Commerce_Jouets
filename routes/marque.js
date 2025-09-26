const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const MarqueController = require('../controllers/marqueController');


// Routes Marque
router.post('/', MarqueController.createMarque);
router.get('/', MarqueController.getAllMarques);
router.get('/:id', MarqueController.getMarqueById);
router.put('/:id', MarqueController.updateMarque);
router.delete('/:id', MarqueController.deleteMarque);

module.exports = router;