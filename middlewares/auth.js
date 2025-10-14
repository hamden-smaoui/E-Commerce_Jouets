const jwt = require('jsonwebtoken');
const { Utilisateur } = require('../models');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Token manquant, accès refusé' });
        }

        const token = authHeader.replace('Bearer ', '');

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expiré' });
            }
            return res.status(401).json({ message: 'Token invalide' });
        }

        // Vérifier si l'utilisateur existe toujours
        const user = await Utilisateur.findByPk(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'Utilisateur non trouvé' });
        }

        // Vérification du tokenVersion pour la révocation après changement mot de passe
        if (
            typeof decoded.tokenVersion !== 'undefined' &&
            decoded.tokenVersion !== user.tokenVersion
        ) {
            return res.status(401).json({ message: 'Token révoqué, veuillez vous reconnecter' });
        }

        // Ajouter les informations utilisateur à la requête
        req.user = {
            userId: decoded.userId, // ✅ Utilisé dans getProfile, updateProfile, changePassword
            idUtilisateur: decoded.userId, // ✅ Compatibilité avec l'ancien code
            role: decoded.role,
            email: decoded.email
        };
        
        next();
    } catch (error) {
        console.error('Erreur d\'authentification:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Middleware pour vérifier le rôle admin
const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Non authentifié' });
    }
    
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès refusé: droits administrateur requis' });
    }
    next();
};

module.exports = { authMiddleware, adminMiddleware };