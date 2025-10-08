const bcrypt = require('bcryptjs');
const { Utilisateur, Commande } = require('../models');

class UtilisateurController {
    async createUtilisateur(req, res, next) {
        try {
            const { motDePasse, ...userData } = req.body;
            if (motDePasse) {
                const saltRounds = 12;
                userData.motDePasse = await bcrypt.hash(motDePasse, saltRounds);
            }
            const utilisateur = await Utilisateur.create(userData);
            const userResponse = {
                ...utilisateur.toJSON(),
                motDePasse: undefined
            };
            res.status(201).json({
                message: 'Utilisateur créé avec succès',
                data: userResponse
            });
        } catch (error) {
            error.message = 'Erreur lors de la création de l\'utilisateur : ' + error.message;
            error.code = "VALIDATION_ERROR";
            next(error);
        }
    }

    async getAllUtilisateurs(req, res, next) {
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
            error.message = 'Erreur lors de la récupération des utilisateurs : ' + error.message;
            error.code = "FETCH_ERROR";
            next(error);
        }
    }

    async getUtilisateurById(req, res, next) {
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
                const error = new Error('Utilisateur non trouvé');
                error.code = "NOT_FOUND";
                return next(error);
            }
            res.status(200).json(utilisateur);
        } catch (error) {
            error.message = 'Erreur lors de la récupération de l\'utilisateur : ' + error.message;
            error.code = "FETCH_ERROR";
            next(error);
        }
    }

    async updateUtilisateur(req, res, next) {
        try {
            const { motDePasse, ...updateData } = req.body;
            const utilisateur = await Utilisateur.findByPk(req.params.id);
            if (!utilisateur) {
                const error = new Error('Utilisateur non trouvé');
                error.code = "NOT_FOUND";
                return next(error);
            }
            if (motDePasse) {
                const saltRounds = 12;
                updateData.motDePasse = await bcrypt.hash(motDePasse, saltRounds);
            }
            await utilisateur.update(updateData);
            const updatedUser = await Utilisateur.findByPk(req.params.id, {
                attributes: { exclude: ['motDePasse'] }
            });
            res.status(200).json({
                message: 'Utilisateur mis à jour avec succès',
                data: updatedUser
            });
        } catch (error) {
            error.message = 'Erreur lors de la mise à jour de l\'utilisateur : ' + error.message;
            error.code = "UPDATE_ERROR";
            next(error);
        }
    }

    async deleteUtilisateur(req, res, next) {
        try {
            const utilisateur = await Utilisateur.findByPk(req.params.id);
            if (!utilisateur) {
                const error = new Error('Utilisateur non trouvé');
                error.code = "NOT_FOUND";
                return next(error);
            }
            await utilisateur.destroy();
            res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
        } catch (error) {
            error.message = 'Erreur lors de la suppression de l\'utilisateur : ' + error.message;
            error.code = "DELETE_ERROR";
            next(error);
        }
    }
}

module.exports = new UtilisateurController();