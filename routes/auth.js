const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/auth');
const { sensitiveLimiter } = require('../middlewares/rateLimit');

// Routes publiques
router.post('/register', sensitiveLimiter, AuthController.register);
router.post('/login', sensitiveLimiter, AuthController.login);
router.post('/forgot-password', sensitiveLimiter, AuthController.forgotPassword);
router.post('/reset-password', sensitiveLimiter, AuthController.resetPassword);
router.post('/refresh-token', AuthController.refreshToken);

// Routes OAuth
router.post('/google-auth', AuthController.googleAuth);
router.post('/facebook-auth', AuthController.facebookAuth);

// Routes protégées
router.get('/profile', authMiddleware, AuthController.getProfile);
router.put('/profile', authMiddleware, AuthController.updateProfile);
router.put('/change-password', authMiddleware, AuthController.changePassword);
router.post('/logout', AuthController.logout);
// Après les autres routes
router.post('/refresh-token-from-session', AuthController.refreshTokenFromSession);
module.exports = router;