const { Utilisateur, Commande } = require('../models');

class UtilisateurController {
    async createUtilisateur(req, res) {
        try {
            const utilisateur = await Utilisateur.create(req.body);
            res.status(201).json({
                message: 'Utilisateur créé avec succès',
                data: utilisateur
            });
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la création de l’utilisateur',
                error: error.message
            });
        }
    }

    async getAllUtilisateurs(req, res) {
        try {
            const utilisateurs = await Utilisateur.findAll({
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
                message: 'Erreur lors de la récupération de l’utilisateur',
                error: error.message
            });
        }
    }

    async updateUtilisateur(req, res) {
        try {
            const utilisateur = await Utilisateur.findByPk(req.params.id);
            if (!utilisateur) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }
            await utilisateur.update(req.body);
            res.status(200).json({
                message: 'Utilisateur mis à jour avec succès',
                data: utilisateur
            });
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la mise à jour de l’utilisateur',
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
                message: 'Erreur lors de la suppression de l’utilisateur',
                error: error.message
            });
        }
    }
}

module.exports = new UtilisateurController();