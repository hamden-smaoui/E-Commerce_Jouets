const { Favori, Utilisateur, Produit, Image, Marque, Categorie } = require('../models');

class FavoriController {
    async addFavori(req, res) {
        try {
            const { idUtilisateur, idProduit } = req.body;
            
            const utilisateur = await Utilisateur.findByPk(idUtilisateur);
            const produit = await Produit.findByPk(idProduit);
            
            if (!utilisateur || !produit) {
                return res.status(404).json({ 
                    message: 'Utilisateur ou produit non trouvé' 
                });
            }

            const existingFavori = await Favori.findOne({
                where: { idUtilisateur, idProduit }
            });
            
            if (existingFavori) {
                return res.status(400).json({ 
                    message: 'Ce produit est déjà dans les favoris de l\'utilisateur' 
                });
            }

            const favori = await Favori.create({ idUtilisateur, idProduit });
            
            res.status(201).json({
                message: 'Favori ajouté avec succès',
                data: favori
            });
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de l\'ajout du favori',
                error: error.message
            });
        }
    }

     async getAllFavorisByUser(req, res) {
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
                            order: [['rang', 'ASC']] // Order by rang
                        },
                        { model: Marque, as: 'marque', attributes: ['idMarque', 'nom'] },
                        { model: Categorie, as: 'categorie', attributes: ['idCategorie', 'nom'] }
                    ]
                }]
            });
            
            if (!favoris.length) {
                return res.status(200).json([]); // Return empty array instead of 404
            }
            
            // Map response to match frontend expectations
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
                    } : null
                }
            }));
            
            res.status(200).json(formattedFavoris);
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la récupération des favoris',
                error: error.message
            });
        }
    }


    async deleteFavori(req, res) {
        try {
            const { idFavori } = req.params;
            
            const favori = await Favori.findByPk(idFavori);
            if (!favori) {
                return res.status(404).json({ 
                    message: 'Favori non trouvé' 
                });
            }
            
            await favori.destroy();
            res.status(200).json({ 
                message: 'Favori supprimé avec succès' 
            });
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la suppression du favori',
                error: error.message
            });
        }
    }

    async deleteAllFavorisByUser(req, res) {
        try {
            const { idUtilisateur } = req.params;
            
            const utilisateur = await Utilisateur.findByPk(idUtilisateur);
            if (!utilisateur) {
                return res.status(404).json({ 
                    message: 'Utilisateur non trouvé' 
                });
            }

            const deletedCount = await Favori.destroy({
                where: { idUtilisateur }
            });

            res.status(200).json({ 
                message: `${deletedCount} favori(s) supprimé(s) avec succès pour l'utilisateur`
            });
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la suppression des favoris',
                error: error.message
            });
        }
    }
}

module.exports = new FavoriController();