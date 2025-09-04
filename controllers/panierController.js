const { Panier, PanierProduit, Produit, Image } = require('../models');

class PanierController {
    async getPanier(req, res) {
  try {
    const { idUtilisateur } = req.user;

    let panier = await Panier.findOne({
      where: { idUtilisateur },
      include: [
        {
          model: PanierProduit,
          as: 'produits', // Use the correct alias from the association
          include: [
            {
              model: Produit,
              as: 'produit', // Use the correct alias from the association
              include: [
                {
                  model: Image,
                  as: 'images',
                  attributes: ['idImage', 'url', 'rang']
                }
              ]
            }
          ]
        }
      ]
    });

    if (!panier) {
      // Create an empty cart if it doesn't exist
      panier = await Panier.create({ idUtilisateur });
    }

    res.status(200).json({
      message: 'Panier récupéré avec succès',
      data: panier
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la récupération du panier',
      error: error.message
    });
  }
}

    async ajouterProduit(req, res) {
        try {
            const { idUtilisateur } = req.user;
            const { idProduit, quantite = 1 } = req.body;

            // Vérifier que le produit existe et a du stock
            const produit = await Produit.findByPk(idProduit);
            if (!produit) {
                return res.status(404).json({ message: 'Produit non trouvé' });
            }

            if (produit.quantiteStock < quantite) {
                return res.status(400).json({ 
                    message: 'Stock insuffisant',
                    stockDisponible: produit.quantiteStock
                });
            }

            // Récupérer ou créer le panier
            let panier = await Panier.findOne({ where: { idUtilisateur } });
            if (!panier) {
                panier = await Panier.create({ idUtilisateur });
            }

            // Vérifier si le produit est déjà dans le panier
            let panierProduit = await PanierProduit.findOne({
                where: { 
                    idPanier: panier.idPanier,
                    idProduit 
                }
            });

            if (panierProduit) {
                // Mettre à jour la quantité
                const nouvelleQuantite = panierProduit.quantite + quantite;
                
                if (nouvelleQuantite > produit.quantiteStock) {
                    return res.status(400).json({ 
                        message: 'Stock insuffisant',
                        stockDisponible: produit.quantiteStock,
                        quantiteActuelle: panierProduit.quantite
                    });
                }

                await panierProduit.update({ quantite: nouvelleQuantite });
            } else {
                // Ajouter le produit au panier
                panierProduit = await PanierProduit.create({
                    idPanier: panier.idPanier,
                    idProduit,
                    quantite
                });
            }

            res.status(200).json({
                message: 'Produit ajouté au panier avec succès',
                data: panierProduit
            });
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de l\'ajout du produit',
                error: error.message
            });
        }
    }

    async modifierQuantite(req, res) {
        try {
            const { idUtilisateur } = req.user;
            const { idProduit, quantite } = req.body;

            if (quantite < 1) {
                return res.status(400).json({ message: 'La quantité doit être au moins 1' });
            }

            const panier = await Panier.findOne({ where: { idUtilisateur } });
            if (!panier) {
                return res.status(404).json({ message: 'Panier non trouvé' });
            }

            const panierProduit = await PanierProduit.findOne({
                where: { 
                    idPanier: panier.idPanier,
                    idProduit 
                },
                include: [
                    {
                        model: Produit,
                        as: 'produit'
                    }
                ]
            });

            if (!panierProduit) {
                return res.status(404).json({ message: 'Produit non trouvé dans le panier' });
            }

            if (quantite > panierProduit.produit.quantiteStock) {
                return res.status(400).json({ 
                    message: 'Stock insuffisant',
                    stockDisponible: panierProduit.produit.quantiteStock
                });
            }

            await panierProduit.update({ quantite });

            res.status(200).json({
                message: 'Quantité mise à jour avec succès',
                data: panierProduit
            });
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la modification de la quantité',
                error: error.message
            });
        }
    }

    async retirerProduit(req, res) {
        try {
            const { idUtilisateur } = req.user;
            const { idProduit } = req.params;

            const panier = await Panier.findOne({ where: { idUtilisateur } });
            if (!panier) {
                return res.status(404).json({ message: 'Panier non trouvé' });
            }

            const deleted = await PanierProduit.destroy({
                where: { 
                    idPanier: panier.idPanier,
                    idProduit 
                }
            });

            if (deleted === 0) {
                return res.status(404).json({ message: 'Produit non trouvé dans le panier' });
            }

            res.status(200).json({
                message: 'Produit retiré du panier avec succès'
            });
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la suppression du produit',
                error: error.message
            });
        }
    }

    async viderPanier(req, res) {
        try {
            const { idUtilisateur } = req.user;

            const panier = await Panier.findOne({ where: { idUtilisateur } });
            if (!panier) {
                return res.status(404).json({ message: 'Panier non trouvé' });
            }

            await PanierProduit.destroy({
                where: { idPanier: panier.idPanier }
            });

            res.status(200).json({
                message: 'Panier vidé avec succès'
            });
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors du vidage du panier',
                error: error.message
            });
        }
    }

    async getNombreProduits(req, res) {
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
            res.status(500).json({
                message: 'Erreur lors du comptage des produits',
                error: error.message
            });
        }
    }
}

module.exports = new PanierController();