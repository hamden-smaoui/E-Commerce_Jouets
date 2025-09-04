// controllers/AuthController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Utilisateur } = require('../models');

class AuthController {
    // Inscription
    async register(req, res) {
        try {
            const { prenom, nom, email, motDePasse, telephone, role = 'client' } = req.body;

            // Vérification si l'email existe déjà
            const existingUser = await Utilisateur.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({
                    message: 'Un utilisateur avec cet email existe déjà'
                });
            }

            // Hashage du mot de passe
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(motDePasse, saltRounds);

            // Création de l'utilisateur
            const newUser = await Utilisateur.create({
                prenom,
                nom,
                email,
                motDePasse: hashedPassword,
                telephone,
                role
            });

            // Génération du token JWT
            const token = jwt.sign(
                { 
                    userId: newUser.idUtilisateur,
                    email: newUser.email,
                    role: newUser.role
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            // Retourner les données sans le mot de passe
            const userResponse = {
                idUtilisateur: newUser.idUtilisateur,
                prenom: newUser.prenom,
                nom: newUser.nom,
                email: newUser.email,
                telephone: newUser.telephone,
                role: newUser.role
            };

            res.status(201).json({
                message: 'Inscription réussie',
                token,
                user: userResponse
            });

        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de l\'inscription',
                error: error.message
            });
        }
    }

    // Connexion
    async login(req, res) {
        try {
            const { email, motDePasse } = req.body;

            // Vérification si l'utilisateur existe
            const user = await Utilisateur.findOne({ where: { email } });
            if (!user) {
                return res.status(400).json({
                    message: 'Email ou mot de passe incorrect'
                });
            }

            // Vérification du mot de passe
            const isValidPassword = await bcrypt.compare(motDePasse, user.motDePasse);
            if (!isValidPassword) {
                return res.status(400).json({
                    message: 'Email ou mot de passe incorrect'
                });
            }

            // Génération du token JWT
            const token = jwt.sign(
                {
                    userId: user.idUtilisateur,
                    email: user.email,
                    role: user.role
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            // Retourner les données sans le mot de passe
            const userResponse = {
                idUtilisateur: user.idUtilisateur,
                prenom: user.prenom,
                nom: user.nom,
                email: user.email,
                telephone: user.telephone,
                role: user.role
            };

            res.status(200).json({
                message: 'Connexion réussie',
                token,
                user: userResponse
            });

        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la connexion',
                error: error.message
            });
        }
    }

    // Profil utilisateur (nécessite authentification)
    async getProfile(req, res) {
        try {
            const user = await Utilisateur.findByPk(req.user.userId, {
                attributes: { exclude: ['motDePasse'] }
            });

            if (!user) {
                return res.status(404).json({
                    message: 'Utilisateur non trouvé'
                });
            }

            res.status(200).json({
                user
            });

        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la récupération du profil',
                error: error.message
            });
        }
    }

    // Mise à jour du profil
    async updateProfile(req, res) {
       
        try {
            const { prenom, nom, telephone, adresseRue, adresseVille, adresseCodePostal, adressePays } = req.body;
            
            const user = await Utilisateur.findByPk(req.user.idUtilisateur);
            if (!user) {
                return res.status(404).json({
                    message: 'Utilisateur non trouvé'
                });
            }

            await user.update({
                prenom,
                nom,
                telephone,
                adresseRue,
                adresseVille,
                adresseCodePostal,
                adressePays
            });

            const updatedUser = await Utilisateur.findByPk(req.user.idUtilisateur, {
                attributes: { exclude: ['motDePasse'] }
            });

            res.status(200).json({
                message: 'Profil mis à jour avec succès',
                user: updatedUser
            });

        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la mise à jour du profil',
                error: error.message
            });
        }
    }

    // Changement de mot de passe
    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            
            const user = await Utilisateur.findByPk(req.user.userId);
            if (!user) {
                return res.status(404).json({
                    message: 'Utilisateur non trouvé'
                });
            }

            // Vérification de l'ancien mot de passe
            const isValidPassword = await bcrypt.compare(currentPassword, user.motDePasse);
            if (!isValidPassword) {
                return res.status(400).json({
                    message: 'Mot de passe actuel incorrect'
                });
            }

            // Hashage du nouveau mot de passe
            const saltRounds = 12;
            const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

            await user.update({ motDePasse: hashedNewPassword });

            res.status(200).json({
                message: 'Mot de passe modifié avec succès'
            });

        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors du changement de mot de passe',
                error: error.message
            });
        }
    }
}

module.exports = new AuthController();