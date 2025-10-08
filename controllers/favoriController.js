const { Favori, Utilisateur, Produit, Image, Marque, Categorie } = require('../models');

class FavoriController {
    async addFavori(req, res, next) {
        try {
            const { idUtilisateur, idProduit } = req.body;
            const utilisateur = await Utilisateur.findByPk(idUtilisateur);
            const produit = await Produit.findByPk(idProduit);
            if (!utilisateur || !produit) {
                const error = new Error('Utilisateur ou produit non trouvé');
                error.code = "NOT_FOUND";
                return next(error);
            }
            const existingFavori = await Favori.findOne({
                where: { idUtilisateur, idProduit }
            });
            if (existingFavori) {
                const error = new Error('Ce produit est déjà dans les favoris de l\'utilisateur');
                error.code = "VALIDATION_ERROR";
                return next(error);
            }
            const favori = await Favori.create({ idUtilisateur, idProduit });
            res.status(201).json({
                message: 'Favori ajouté avec succès',
                data: favori
            });
        } catch (error) {
            next(error);
        }
    }

   async getAllFavorisByUser(req, res, next) {
    try {
        const { idUtilisateur } = req.params;
        const favoris = await Favori.findAll({
            where: { idUtilisateur },
            include: [{
                model: Produit,
                as: 'produit',
                attributes: [
                    'idProduit',
                    'nom',
                    'prix',
                    'description',
                    'quantiteStock',
                    'idMarque',
                    'idCategorie'
                ],
                include: [
                    { 
                        model: Image, 
                        as: 'images', 
                        attributes: ['idImage', 'url', 'rang'],
                        order: [['rang', 'ASC']]
                    },
                    { model: Marque, as: 'marque', attributes: ['idMarque', 'nom'] },
                    { model: Categorie, as: 'categorie', attributes: ['idCategorie', 'nom'] },
                    // AJOUT ICI : variations
                    {
                        model: require('../models').ProduitVariation, // adapte le chemin si besoin
                        as: 'variations',
                        attributes: [
                            'idProduitVariation',
                            'idProduit',
                            'idCouleur',
                            'idTaille',
                            'idAge',
                            'quantiteStock'
                        ]
                    }
                ]
            }]
        });
        // ... reste inchangé ...
        const formattedFavoris = favoris.map(favori => ({
            idFavori: favori.idFavori,
            idUtilisateur: favori.idUtilisateur,
            idProduit: favori.idProduit,
            produit: {
                idProduit: favori.produit.idProduit,
                nom: favori.produit.nom,
                prix: favori.produit.prix,
                description: favori.produit.description,
                quantiteStock: favori.produit.quantiteStock,
                images: favori.produit.images || [],
                marque: favori.produit.marque ? {
                    idMarque: favori.produit.marque.idMarque,
                    nom: favori.produit.marque.nom
                } : null,
                categorie: favori.produit.categorie ? {
                    idCategorie: favori.produit.categorie.idCategorie,
                    nom: favori.produit.categorie.nom
                } : null,
                variations: favori.produit.variations || [] // AJOUT ICI
            }
        }));
        res.status(200).json(formattedFavoris);
    } catch (error) {
        next(error);
    }
}

    async deleteFavori(req, res, next) {
        try {
            const { idFavori } = req.params;
            const favori = await Favori.findByPk(idFavori);
            if (!favori) {
                const error = new Error('Favori non trouvé');
                error.code = "NOT_FOUND";
                return next(error);
            }
            await favori.destroy();
            res.status(200).json({ 
                message: 'Favori supprimé avec succès' 
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteAllFavorisByUser(req, res, next) {
        try {
            const { idUtilisateur } = req.params;
            const utilisateur = await Utilisateur.findByPk(idUtilisateur);
            if (!utilisateur) {
                const error = new Error('Utilisateur non trouvé');
                error.code = "NOT_FOUND";
                return next(error);
            }
            const deletedCount = await Favori.destroy({
                where: { idUtilisateur }
            });
            res.status(200).json({ 
                message: `${deletedCount} favori(s) supprimé(s) avec succès pour l'utilisateur`
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new FavoriController();