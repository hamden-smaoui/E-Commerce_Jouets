const express = require('express');
const router = express.Router();
const StoreInfoController = require('../controllers/storeInfoController');
const { authMiddleware } = require('../middlewares/auth');

// Routes protégées par authentification
router.post('/', authMiddleware, StoreInfoController.createStoreInfo);
router.get('/', authMiddleware, StoreInfoController.getStoreInfo);
router.put('/:id', authMiddleware, StoreInfoController.updateStoreInfo);
router.delete('/:id', authMiddleware, StoreInfoController.deleteStoreInfo);

module.exports = router;