const { Facture, Commande } = require('../models');

class FactureController {
    async createFacture(req, res) {
        try {
            const facture = await Facture.create(req.body);
            res.status(201).json({
                message: 'Facture créée avec succès',
                data: facture
            });
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la création de la facture',
                error: error.message
            });
        }
    }

    async getAllFactures(req, res) {
        try {
            const factures = await Facture.findAll({
                include: [{
                    model: Commande,
                    as: 'commande',
                    attributes: ['idCommande', 'dateCommande', 'montantTotal']
                }]
            });
            res.status(200).json(factures);
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la récupération des factures',
                error: error.message
            });
        }
    }

    async getFactureById(req, res) {
        try {
            const facture = await Facture.findByPk(req.params.id, {
                include: [{
                    model: Commande,
                    as: 'commande',
                    attributes: ['idCommande', 'dateCommande', 'montantTotal']
                }]
            });
            if (!facture) {
                return res.status(404).json({ message: 'Facture non trouvée' });
            }
            res.status(200).json(facture);
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la récupération de la facture',
                error: error.message
            });
        }
    }

    async updateFacture(req, res) {
        try {
            const facture = await Facture.findByPk(req.params.id);
            if (!facture) {
                return res.status(404).json({ message: 'Facture non trouvée' });
            }
            await facture.update(req.body);
            res.status(200).json({
                message: 'Facture mise à jour avec succès',
                data: facture
            });
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la mise à jour de la facture',
                error: error.message
            });
        }
    }

    async deleteFacture(req, res) {
        try {
            const facture = await Facture.findByPk(req.params.id);
            if (!facture) {
                return res.status(404).json({ message: 'Facture non trouvée' });
            }
            await facture.destroy();
            res.status(200).json({ message: 'Facture supprimée avec succès' });
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la suppression de la facture',
                error: error.message
            });
        }
    }
}

module.exports = new FactureController();