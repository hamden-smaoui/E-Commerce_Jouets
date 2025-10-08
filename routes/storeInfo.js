const express = require('express');
const router = express.Router();
const StoreInfoController = require('../controllers/storeInfoController');
const { authMiddleware,adminMiddleware } = require('../middlewares/auth');

// Routes protégées par authentification
router.post('/', authMiddleware ,adminMiddleware, StoreInfoController.createStoreInfo);
router.get('/', StoreInfoController.getStoreInfo);
router.put('/:id', authMiddleware ,adminMiddleware, StoreInfoController.updateStoreInfo);
router.delete('/:id', authMiddleware ,adminMiddleware, StoreInfoController.deleteStoreInfo);

module.exports = router;