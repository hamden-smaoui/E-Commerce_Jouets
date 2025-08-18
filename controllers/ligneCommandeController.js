const { LigneCommande, Commande, Produit } = require('../models');

class LigneCommandeController {
    async createLigneCommande(req, res) {
        try {
            const ligneCommande = await LigneCommande.create(req.body);
            res.status(201).json({
                message: 'Ligne de commande créée avec succès',
                data: ligneCommande
            });
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la création de la ligne de commande',
                error: error.message
            });
        }
    }

    async getAllLignesCommandes(req, res) {
        try {
            const lignesCommandes = await LigneCommande.findAll({
                include: [
                    {
                        model: Commande,
                        as: 'commande',
                        attributes: ['idCommande', 'dateCommande']
                    },
                    {
                        model: Produit,
                        as: 'produit',
                        attributes: ['idProduit', 'nom']
                    }
                ]
            });
            res.status(200).json(lignesCommandes);
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la récupération des lignes de commande',
                error: error.message
            });
        }
    }

    async getLigneCommandeById(req, res) {
        try {
            const ligneCommande = await LigneCommande.findByPk(req.params.id, {
                include: [
                    {
                        model: Commande,
                        as: 'commande',
                        attributes: ['idCommande', 'dateCommande']
                    },
                    {
                        model: Produit,
                        as: 'produit',
                        attributes: ['idProduit', 'nom']
                    }
                ]
            });
            if (!ligneCommande) {
                return res.status(404).json({ message: 'Ligne de commande non trouvée' });
            }
            res.status(200).json(ligneCommande);
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la récupération de la ligne de commande',
                error: error.message
            });
        }
    }

    async updateLigneCommande(req, res) {
        try {
            const ligneCommande = await LigneCommande.findByPk(req.params.id);
            if (!ligneCommande) {
                return res.status(404).json({ message: 'Ligne de commande non trouvée' });
            }
            await ligneCommande.update(req.body);
            res.status(200).json({
                message: 'Ligne de commande mise à jour avec succès',
                data: ligneCommande
            });
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la mise à jour de la ligne de commande',
                error: error.message
            });
        }
    }

    async deleteLigneCommande(req, res) {
        try {
            const ligneCommande = await LigneCommande.findByPk(req.params.id);
            if (!ligneCommande) {
                return res.status(404).json({ message: 'Ligne de commande non trouvée' });
            }
            await ligneCommande.destroy();
            res.status(200).json({ message: 'Ligne de commande supprimée avec succès' });
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la suppression de la ligne de commande',
                error: error.message
            });
        }
    }
}

module.exports = new LigneCommandeController();