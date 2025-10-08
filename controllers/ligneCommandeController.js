const { LigneCommande, Commande, Produit, ProduitVariation, Couleur, Taille, Age } = require('../models');

class LigneCommandeController {
    async createLigneCommande(req, res) {
        try {
            // On attend dans le body : idProduitVariation et quantite
            const { idProduitVariation, quantite } = req.body;
            const variation = await ProduitVariation.findByPk(idProduitVariation, {
                include: [
                    { model: Produit, as: 'produit' }
                ]
            });
            if (!variation) return res.status(404).json({ message: 'Variation non trouvée' });
            if (variation.quantiteStock < quantite) {
                return res.status(400).json({ message: 'Stock insuffisant pour cette variation' });
            }
            // On décrémente le stock de la variation
            variation.quantiteStock -= quantite;
            await variation.save();

            // Si besoin, récupère le produit lié
            const produit = variation.produit;

            // Crée la ligne commande avec infos de variation
            const ligneCommande = await LigneCommande.create({
                idCommande: req.body.idCommande,
                idProduit: variation.idProduit,
                idProduitVariation: variation.idProduitVariation,
                quantite: quantite,
                prixUnitaireOriginal: produit.prix,
                prixUnitaireFinal: produit.prix, // gérer les promotions selon tes règles
                prixUnitaire: produit.prix,
                sousTotal: produit.prix * quantite,
                reductionUnitaire: 0,
                idPromotionAppliquee: null
            });

            res.status(201).json({ message: 'Ligne de commande créée avec succès', data: ligneCommande });
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de la création de la ligne de commande', error: error.message });
        }
    }

    async getAllLignesCommandes(req, res) {
        try {
            const lignesCommandes = await LigneCommande.findAll({
                include: [
                    { model: Commande, as: 'commande', attributes: ['idCommande', 'dateCommande'] },
                    { model: Produit, as: 'produit', attributes: ['idProduit', 'nom'] },
                    { 
                        model: ProduitVariation, as: 'variation',
                        include: [
                            { model: Couleur, as: 'couleur' },
                            { model: Taille, as: 'taille' },
                            { model: Age, as: 'age' }
                        ]
                    }
                ]
            });
            res.status(200).json(lignesCommandes);
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de la récupération des lignes de commande', error: error.message });
        }
    }

    async getLigneCommandeById(req, res) {
        try {
            const ligneCommande = await LigneCommande.findByPk(req.params.id, {
                include: [
                    { model: Commande, as: 'commande', attributes: ['idCommande', 'dateCommande'] },
                    { model: Produit, as: 'produit', attributes: ['idProduit', 'nom'] },
                    { 
                        model: ProduitVariation, as: 'variation',
                        include: [
                            { model: Couleur, as: 'couleur' },
                            { model: Taille, as: 'taille' },
                            { model: Age, as: 'age' }
                        ]
                    }
                ]
            });
            if (!ligneCommande) return res.status(404).json({ message: 'Ligne de commande non trouvée' });
            res.status(200).json(ligneCommande);
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de la récupération de la ligne de commande', error: error.message });
        }
    }

    async updateLigneCommande(req, res) {
        try {
            const ligneCommande = await LigneCommande.findByPk(req.params.id);
            if (!ligneCommande) return res.status(404).json({ message: 'Ligne de commande non trouvée' });
            await ligneCommande.update(req.body);
            res.status(200).json({ message: 'Ligne de commande mise à jour avec succès', data: ligneCommande });
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de la mise à jour de la ligne de commande', error: error.message });
        }
    }

    async deleteLigneCommande(req, res) {
        try {
            const ligneCommande = await LigneCommande.findByPk(req.params.id);
            if (!ligneCommande) return res.status(404).json({ message: 'Ligne de commande non trouvée' });
            await ligneCommande.destroy();
            res.status(200).json({ message: 'Ligne de commande supprimée avec succès' });
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de la suppression de la ligne de commande', error: error.message });
        }
    }
}
module.exports = new LigneCommandeController();