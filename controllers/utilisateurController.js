// controllers/UtilisateurController.js
const bcrypt = require('bcryptjs');
const { Utilisateur, Commande } = require('../models');

class UtilisateurController {
    async createUtilisateur(req, res) {
        try {
            const { motDePasse, ...userData } = req.body;
            
            // Hasher le mot de passe si fourni
            if (motDePasse) {
                const saltRounds = 12;
                userData.motDePasse = await bcrypt.hash(motDePasse, saltRounds);
            }
            
            const utilisateur = await Utilisateur.create(userData);
            
            // Retourner sans le mot de passe
            const userResponse = {
                ...utilisateur.toJSON(),
                motDePasse: undefined
            };
            
            res.status(201).json({
                message: 'Utilisateur créé avec succès',
                data: userResponse
            });
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la création de l\'utilisateur',
                error: error.message
            });
        }
    }

    async getAllUtilisateurs(req, res) {
        try {
            const utilisateurs = await Utilisateur.findAll({
                attributes: { exclude: ['motDePasse'] },
                include: [{
                    model: Commande,
                    as: 'commandes',
                    attributes: ['idCommande', 'dateCommande', 'statut']
                }]
            });
            res.status(200).json(utilisateurs);
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la récupération des utilisateurs',
                error: error.message
            });
        }
    }

    async getUtilisateurById(req, res) {
        try {
            const utilisateur = await Utilisateur.findByPk(req.params.id, {
                attributes: { exclude: ['motDePasse'] },
                include: [{
                    model: Commande,
                    as: 'commandes',
                    attributes: ['idCommande', 'dateCommande', 'statut']
                }]
            });
            if (!utilisateur) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }
            res.status(200).json(utilisateur);
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la récupération de l\'utilisateur',
                error: error.message
            });
        }
    }

    async updateUtilisateur(req, res) {
        try {
            const { motDePasse, ...updateData } = req.body;
            
            const utilisateur = await Utilisateur.findByPk(req.params.id);
            if (!utilisateur) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }
            
            // Hasher le nouveau mot de passe si fourni
            if (motDePasse) {
                const saltRounds = 12;
                updateData.motDePasse = await bcrypt.hash(motDePasse, saltRounds);
            }
            
            await utilisateur.update(updateData);
            
            // Retourner sans le mot de passe
            const updatedUser = await Utilisateur.findByPk(req.params.id, {
                attributes: { exclude: ['motDePasse'] }
            });
            
            res.status(200).json({
                message: 'Utilisateur mis à jour avec succès',
                data: updatedUser
            });
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la mise à jour de l\'utilisateur',
                error: error.message
            });
        }
    }

    async deleteUtilisateur(req, res) {
        try {
            const utilisateur = await Utilisateur.findByPk(req.params.id);
            if (!utilisateur) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }
            await utilisateur.destroy();
            res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la suppression de l\'utilisateur',
                error: error.message
            });
        }
    }
}

module.exports = new UtilisateurController();