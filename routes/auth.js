const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/auth');
const { sensitiveLimiter } = require('../middlewares/rateLimit');

// Sensitive endpoints protected
router.post('/register', sensitiveLimiter, AuthController.register);
router.post('/login', sensitiveLimiter, AuthController.login);
router.post('/forgot-password', sensitiveLimiter, AuthController.forgotPassword);
router.post('/reset-password', sensitiveLimiter, AuthController.resetPassword);

// Public/other endpoints
router.post('/google-auth', AuthController.googleAuth);
router.post('/facebook-auth', AuthController.facebookAuth);

// AJOUT : endpoint refresh token
router.post('/refresh-token', AuthController.refreshToken);

// AJOUT : endpoint logout
router.post('/logout', AuthController.logout);

router.get('/profile', authMiddleware, AuthController.getProfile);
router.put('/profile', authMiddleware, AuthController.updateProfile);
router.put('/change-password', authMiddleware, AuthController.changePassword);

module.exports = router;