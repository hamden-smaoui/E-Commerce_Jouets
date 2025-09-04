const { Reclamation, Utilisateur } = require('../models');

class ReclamationController {
    // Créer une réclamation
async createReclamation(req, res) {
    try {
        const { sujet, message, idUtilisateur, nom, prenom, email, telephone } = req.body;
console.log(req.body);
        let reclamationData = {
            sujet,
            message,
            telephone,
        };

        if (idUtilisateur) {
            // Utilisateur connecté
            const utilisateur = await Utilisateur.findByPk(idUtilisateur);
            if (!utilisateur) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }
            reclamationData.idUtilisateur = idUtilisateur;
        } else {
            // Utilisateur non connecté - créer un utilisateur temporaire ou stocker les infos
            if (!nom || !prenom || !email || !telephone) {
                return res.status(400).json({ 
                    message: 'Les informations personnelles sont requises pour les utilisateurs non connectés' 
                });
            }
            
            // Option 1: Créer un utilisateur temporaire
            const tempUser = await Utilisateur.create({
                nom,
                prenom,
                email,
                telephone,
                role: 'client'
            });
            reclamationData.idUtilisateur = tempUser.idUtilisateur;
        }

        const reclamation = await Reclamation.create(reclamationData);

        res.status(201).json({
            message: 'Réclamation créée avec succès',
            data: reclamation,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de la création de la réclamation',
            error: error.message,
        });
    }
}

    // Récupérer toutes les réclamations
    async getAllReclamations(req, res) {
        try {
            const reclamations = await Reclamation.findAll({
                include: [{
                    model: Utilisateur,
                    as: 'utilisateur',
                    attributes: ['idUtilisateur', 'prenom', 'nom', 'email', 'telephone'],
                }],
            });
            res.status(200).json(reclamations);
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la récupération des réclamations',
                error: error.message,
            });
        }
    }

    // Récupérer une réclamation par ID
    async getReclamationById(req, res) {
        try {
            const reclamation = await Reclamation.findByPk(req.params.id, {
                include: [{
                    model: Utilisateur,
                    as: 'utilisateur',
                    attributes: ['idUtilisateur', 'prenom', 'nom', 'email', 'telephone'],
                }],
            });
            if (!reclamation) {
                return res.status(404).json({ message: 'Réclamation non trouvée' });
            }
            res.status(200).json(reclamation);
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la récupération de la réclamation',
                error: error.message,
            });
        }
    }

    // Mettre à jour une réclamation
    async updateReclamation(req, res) {
        try {
            const { sujet, message, statut } = req.body;
            const reclamation = await Reclamation.findByPk(req.params.id);
            if (!reclamation) {
                return res.status(404).json({ message: 'Réclamation non trouvée' });
            }

            await reclamation.update({ sujet, message, statut });

            res.status(200).json({
                message: 'Réclamation mise à jour avec succès',
                data: reclamation,
            });
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la mise à jour de la réclamation',
                error: error.message,
            });
        }
    }

    // Supprimer une réclamation
    async deleteReclamation(req, res) {
        try {
            const reclamation = await Reclamation.findByPk(req.params.id);
            if (!reclamation) {
                return res.status(404).json({ message: 'Réclamation non trouvée' });
            }
            await reclamation.destroy();
            res.status(200).json({ message: 'Réclamation supprimée avec succès' });
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la suppression de la réclamation',
                error: error.message,
            });
        }
    }

    // Récupérer les réclamations par utilisateur
    async getReclamationsByUser(req, res) {
        try {
            const utilisateur = await Utilisateur.findByPk(req.params.idUtilisateur);
            if (!utilisateur) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }

            const reclamations = await Reclamation.findAll({
                where: { idUtilisateur: req.params.idUtilisateur },
                include: [{
                    model: Utilisateur,
                    as: 'utilisateur',
                    attributes: ['idUtilisateur', 'prenom', 'nom', 'email'],
                }],
            });

            res.status(200).json(reclamations);
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la récupération des réclamations de l\'utilisateur',
                error: error.message,
            });
        }
    }
}

module.exports = new ReclamationController();