// middleware/auth.js
const jwt = require('jsonwebtoken');
const { Utilisateur } = require('../models');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Token manquant, accès refusé' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Vérifier si l'utilisateur existe toujours
        const user = await Utilisateur.findByPk(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'Token invalide, utilisateur non trouvé' });
        }

        // Ajouter les informations utilisateur à la requête
        req.user = {
            idUtilisateur: decoded.userId,
            role: decoded.role
        };
        
        next();
    } catch (error) {
        console.error('Erreur d\'authentification:', error);
        res.status(401).json({ message: 'Token invalide' });
    }
};

// Middleware pour vérifier le rôle admin
const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès refusé: droits administrateur requis' });
    }
    next();
};

module.exports = { authMiddleware, adminMiddleware };