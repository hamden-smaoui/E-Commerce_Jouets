const { Panier, PanierProduit, Produit, Image, ProduitVariation, Couleur, Taille, Age } = require('../models');

class PanierController {
    async getPanier(req, res, next) {
        try {
            const { idUtilisateur } = req.user;
            let panier = await Panier.findOne({
                where: { idUtilisateur },
                include: [
                    {
                        model: PanierProduit,
                        as: 'produits',
                        include: [
                            {
                                model: Produit,
                                as: 'produit',
                                include: [
                                    {
                                        model: Image,
                                        as: 'images',
                                        attributes: ['idImage', 'url', 'rang']
                                    }
                                ]
                            },
                            {
                                model: ProduitVariation,
                                as: 'variation',
                                include: [
                                    { model: Couleur, as: 'couleur' },
                                    { model: Taille, as: 'taille' },
                                    { model: Age, as: 'age' }
                                ]
                            }
                        ]
                    }
                ]
            });

            if (!panier) {
                panier = await Panier.create({ idUtilisateur });
            }

            res.status(200).json({
                message: 'Panier récupéré avec succès',
                data: panier
            });
        } catch (error) {
            next(error);
        }
    }

    async ajouterProduit(req, res, next) {
        try {
            const { idUtilisateur } = req.user;
            const { idProduit, quantite = 1, idProduitVariation } = req.body;

            const produit = await Produit.findByPk(idProduit);
            if (!produit) {
                const error = new Error('Produit non trouvé');
                error.code = "NOT_FOUND";
                return next(error);
            }

            let stockDisponible;
            let variation = null;

            if (idProduitVariation) {
                variation = await ProduitVariation.findOne({
                    where: { idProduitVariation, idProduit }
                });

                if (!variation) {
                    const error = new Error('Variation de produit non trouvée');
                    error.code = "NOT_FOUND";
                    return next(error);
                }

                stockDisponible = variation.quantiteStock;
            } else {
                stockDisponible = produit.quantiteStock;
            }

            if (stockDisponible < quantite) {
                const error = new Error('Stock insuffisant');
                error.code = "VALIDATION_ERROR";
                error.stockDisponible = stockDisponible;
                return next(error);
            }

            let panier = await Panier.findOne({ where: { idUtilisateur } });
            if (!panier) {
                panier = await Panier.create({ idUtilisateur });
            }

            let panierProduit = await PanierProduit.findOne({
                where: { 
                    idPanier: panier.idPanier,
                    idProduit,
                    idProduitVariation: idProduitVariation || null
                }
            });

            if (panierProduit) {
                const nouvelleQuantite = panierProduit.quantite + quantite;
                if (nouvelleQuantite > stockDisponible) {
                    const error = new Error('Stock insuffisant');
                    error.code = "VALIDATION_ERROR";
                    error.stockDisponible = stockDisponible;
                    error.quantiteActuelle = panierProduit.quantite;
                    return next(error);
                }
                await panierProduit.update({ quantite: nouvelleQuantite });
            } else {
                panierProduit = await PanierProduit.create({
                    idPanier: panier.idPanier,
                    idProduit,
                    idProduitVariation: idProduitVariation || null,
                    quantite,
                    prixUnitaire: produit.prix
                });
            }

            res.status(200).json({
                message: 'Produit ajouté au panier avec succès',
                data: panierProduit
            });
        } catch (error) {
            next(error);
        }
    }

    async modifierQuantite(req, res, next) {
        try {
            const { idUtilisateur } = req.user;
            const { idProduit, quantite, idProduitVariation } = req.body;

            if (quantite < 1) {
                const error = new Error('La quantité doit être au moins 1');
                error.code = "VALIDATION_ERROR";
                return next(error);
            }

            const panier = await Panier.findOne({ where: { idUtilisateur } });
            if (!panier) {
                const error = new Error('Panier non trouvé');
                error.code = "NOT_FOUND";
                return next(error);
            }

            const panierProduit = await PanierProduit.findOne({
                where: { 
                    idPanier: panier.idPanier,
                    idProduit,
                    idProduitVariation: idProduitVariation || null
                },
                include: [
                    { model: Produit, as: 'produit' },
                    { model: ProduitVariation, as: 'variation' }
                ]
            });

            if (!panierProduit) {
                const error = new Error('Produit non trouvé dans le panier');
                error.code = "NOT_FOUND";
                return next(error);
            }

            let stockDisponible;
            if (panierProduit.variation) {
                stockDisponible = panierProduit.variation.quantiteStock;
            } else {
                stockDisponible = panierProduit.produit.quantiteStock;
            }

            if (quantite > stockDisponible) {
                const error = new Error('Stock insuffisant');
                error.code = "VALIDATION_ERROR";
                error.stockDisponible = stockDisponible;
                return next(error);
            }

            await panierProduit.update({ quantite });

            res.status(200).json({
                message: 'Quantité mise à jour avec succès',
                data: panierProduit
            });
        } catch (error) {
            next(error);
        }
    }

    async retirerProduit(req, res, next) {
        try {
            const { idUtilisateur } = req.user;
            const { idPanierProduit } = req.params;
            const panier = await Panier.findOne({ where: { idUtilisateur } });
            if (!panier) {
                const error = new Error('Panier non trouvé');
                error.code = "NOT_FOUND";
                return next(error);
            }
            const deleted = await PanierProduit.destroy({
                where: { idPanierProduit, idPanier: panier.idPanier }
            });
            if (deleted === 0) {
                const error = new Error('Produit non trouvé dans le panier');
                error.code = "NOT_FOUND";
                return next(error);
            }
            res.status(200).json({
                message: 'Produit retiré du panier avec succès'
            });
        } catch (error) {
            next(error);
        }
    }

    async viderPanier(req, res, next) {
        try {
            const { idUtilisateur } = req.user;
            const panier = await Panier.findOne({ where: { idUtilisateur } });
            if (!panier) {
                const error = new Error('Panier non trouvé');
                error.code = "NOT_FOUND";
                return next(error);
            }
            await PanierProduit.destroy({
                where: { idPanier: panier.idPanier }
            });
            res.status(200).json({
                message: 'Panier vidé avec succès'
            });
        } catch (error) {
            next(error);
        }
    }

    async getNombreProduits(req, res, next) {
        try {
            const { idUtilisateur } = req.user;
            const panier = await Panier.findOne({ where: { idUtilisateur } });
            if (!panier) {
                return res.status(200).json({ count: 0 });
            }
            const panierProduits = await PanierProduit.findAll({
                where: { idPanier: panier.idPanier },
                attributes: ['quantite']
            });
            const totalItems = panierProduits.reduce((sum, item) => sum + item.quantite, 0);
            res.status(200).json({ count: totalItems });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PanierController();