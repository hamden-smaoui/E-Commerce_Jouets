const { 
    Promotion, 
    CodePromo, 
    PromotionProduit, 
    PromotionCategorie,
    PromotionMarque,
    PromotionType,
    PromotionUtilisation,
    Produit,
    Categorie,
    Marque,
    Type 
} = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

const PromotionService = require('../services/PromotionService');

class PromotionController {
    
    // Créer une promotion
    static async createPromotion(req, res) {
        try {
            const {
                nom,
                description,
                typePromotion,
                valeurPromotion,
                typeApplication,
                conditionMinimum,
                quantiteMinimum,
                dateDebut,
                dateFin,
                utilisationMax,
                utilisationParClient,
                produits = [],
                categories = [],
                marques = [],
                types = [],
                codesPromo = []
            } = req.body;

            const promotion = await Promotion.create({
                nom,
                description,
                typePromotion,
                valeurPromotion,
                typeApplication,
                conditionMinimum,
                quantiteMinimum,
                dateDebut,
                dateFin,
                utilisationMax,
                utilisationParClient
            });

            if (typeApplication === 'produit' && produits.length > 0) {
                const promotionProduits = produits.map(idProduit => ({
                    idPromotion: promotion.idPromotion,
                    idProduit
                }));
                await PromotionProduit.bulkCreate(promotionProduits);
            }

            if (typeApplication === 'categorie' && categories.length > 0) {
                const promotionCategories = categories.map(idCategorie => ({
                    idPromotion: promotion.idPromotion,
                    idCategorie
                }));
                await PromotionCategorie.bulkCreate(promotionCategories);
            }

            if (typeApplication === 'marque' && marques.length > 0) {
                const promotionMarques = marques.map(idMarque => ({
                    idPromotion: promotion.idPromotion,
                    idMarque
                }));
                await PromotionMarque.bulkCreate(promotionMarques);
            }

            if (typeApplication === 'type' && types.length > 0) {
                const promotionTypes = types.map(idType => ({
                    idPromotion: promotion.idPromotion,
                    idType
                }));
                await PromotionType.bulkCreate(promotionTypes);
            }

            if (codesPromo.length > 0) {
                const codes = codesPromo.map(codeData => ({
                    ...codeData,
                    idPromotion: promotion.idPromotion
                }));
                await CodePromo.bulkCreate(codes);
            }

            res.status(201).json({
                message: 'Promotion créée avec succès',
                data: promotion
            });

        } catch (error) {
            console.error('Erreur création promotion:', error);
            res.status(500).json({
                message: 'Erreur lors de la création de la promotion',
                error: error.message
            });
        }
    }

    // Appliquer une promotion en utilisant le service
    static async appliquerPromotion(req, res) {
        try {
            const { codePromo, panierData, idUtilisateur } = req.body;

            // Utiliser le service pour appliquer la promotion
            const resultat = await PromotionService.appliquerPromotionCommande({
                ...panierData,
                idClient: idUtilisateur
            }, codePromo);

            if (resultat.error || !resultat.promotion) {
                return res.status(400).json({
                    message: resultat.error || 'Aucune promotion applicable'
                });
            }

            res.status(200).json({
                message: 'Promotion applicable',
                promotion: {
                    id: resultat.promotion.idPromotion,
                    nom: resultat.promotion.nom,
                    description: resultat.promotion.description,
                    typePromotion: resultat.promotion.typePromotion,
                    reduction: resultat.montantReduction,
                    montantFinal: resultat.montantFinal
                }
            });

        } catch (error) {
            console.error('Erreur application promotion:', error);
            res.status(500).json({
                message: 'Erreur lors de l\'application de la promotion',
                error: error.message
            });
        }
    }

    // Lister toutes les promotions
    static async getAllPromotions(req, res) {
        try {
            const promotions = await Promotion.findAll({
                include: [
                    {
                        model: CodePromo,
                        as: 'codesPromo'
                    },
                    {
                        model: Produit,
                        as: 'produits',
                        through: { attributes: [] }
                    },
                    {
                        model: Categorie,
                        as: 'categories',
                        through: { attributes: [] }
                    },
                    {
                        model: Marque,
                        as: 'marques',
                        through: { attributes: [] }
                    },
                    {
                        model: Type,
                        as: 'types',
                        through: { attributes: [] }
                    }
                ]
            });

            res.status(200).json(promotions);
        } catch (error) {
            console.error('Erreur récupération promotions:', error);
            res.status(500).json({
                message: 'Erreur lors de la récupération des promotions',
                error: error.message
            });
        }
    }

    // Récupérer une promotion par ID
    static async getPromotionById(req, res) {
        try {
            const promotion = await Promotion.findByPk(req.params.id, {
                include: [
                    {
                        model: CodePromo,
                        as: 'codesPromo'
                    },
                    {
                        model: Produit,
                        as: 'produits',
                        through: { attributes: [] }
                    },
                    {
                        model: Categorie,
                        as: 'categories',
                        through: { attributes: [] }
                    },
                    {
                        model: Marque,
                        as: 'marques',
                        through: { attributes: [] }
                    },
                    {
                        model: Type,
                        as: 'types',
                        through: { attributes: [] }
                    }
                ]
            });

            if (!promotion) {
                return res.status(404).json({
                    message: 'Promotion non trouvée'
                });
            }

            res.status(200).json({
                message: 'Promotion récupérée avec succès',
                data: promotion
            });
        } catch (error) {
            console.error('Erreur récupération promotion par ID:', error);
            res.status(500).json({
                message: 'Erreur lors de la récupération de la promotion',
                error: error.message
            });
        }
    }

    // Mettre à jour une promotion
    static async updatePromotion(req, res) {
        try {
            const promotion = await Promotion.findByPk(req.params.id);
            if (!promotion) {
                return res.status(404).json({
                    message: 'Promotion non trouvée'
                });
            }

            const {
                nom,
                description,
                typePromotion,
                valeurPromotion,
                typeApplication,
                conditionMinimum,
                quantiteMinimum,
                dateDebut,
                dateFin,
                utilisationMax,
                utilisationParClient,
                produits = [],
                categories = [],
                marques = [],
                types = [],
                codesPromo = []
            } = req.body;

            await promotion.update({
                nom,
                description,
                typePromotion,
                valeurPromotion,
                typeApplication,
                conditionMinimum,
                quantiteMinimum,
                dateDebut,
                dateFin,
                utilisationMax,
                utilisationParClient
            });

            await PromotionProduit.destroy({ where: { idPromotion: promotion.idPromotion } });
            await PromotionCategorie.destroy({ where: { idPromotion: promotion.idPromotion } });
            await PromotionMarque.destroy({ where: { idPromotion: promotion.idPromotion } });
            await PromotionType.destroy({ where: { idPromotion: promotion.idPromotion } });
            await CodePromo.destroy({ where: { idPromotion: promotion.idPromotion } });

            if (typeApplication === 'produit' && produits.length > 0) {
                const promotionProduits = produits.map(idProduit => ({
                    idPromotion: promotion.idPromotion,
                    idProduit
                }));
                await PromotionProduit.bulkCreate(promotionProduits);
            }

            if (typeApplication === 'categorie' && categories.length > 0) {
                const promotionCategories = categories.map(idCategorie => ({
                    idPromotion: promotion.idPromotion,
                    idCategorie
                }));
                await PromotionCategorie.bulkCreate(promotionCategories);
            }

            if (typeApplication === 'marque' && marques.length > 0) {
                const promotionMarques = marques.map(idMarque => ({
                    idPromotion: promotion.idPromotion,
                    idMarque
                }));
                await PromotionMarque.bulkCreate(promotionMarques);
            }

            if (typeApplication === 'type' && types.length > 0) {
                const promotionTypes = types.map(idType => ({
                    idPromotion: promotion.idPromotion,
                    idType
                }));
                await PromotionType.bulkCreate(promotionTypes);
            }

            if (codesPromo.length > 0) {
                const codes = codesPromo.map(codeData => ({
                    ...codeData,
                    idPromotion: promotion.idPromotion
                }));
                await CodePromo.bulkCreate(codes);
            }

            res.status(200).json({
                message: 'Promotion mise à jour avec succès',
                data: promotion
            });
        } catch (error) {
            console.error('Erreur mise à jour promotion:', error);
            res.status(500).json({
                message: 'Erreur lors de la mise à jour de la promotion',
                error: error.message
            });
        }
    }

    // Supprimer une promotion
    static async deletePromotion(req, res) {
        try {
            const promotion = await Promotion.findByPk(req.params.id);
            if (!promotion) {
                return res.status(404).json({
                    message: 'Promotion non trouvée'
                });
            }

            await PromotionProduit.destroy({ where: { idPromotion: promotion.idPromotion } });
            await PromotionCategorie.destroy({ where: { idPromotion: promotion.idPromotion } });
            await PromotionMarque.destroy({ where: { idPromotion: promotion.idPromotion } });
            await PromotionType.destroy({ where: { idPromotion: promotion.idPromotion } });
            await CodePromo.destroy({ where: { idPromotion: promotion.idPromotion } });
            await PromotionUtilisation.destroy({ where: { idPromotion: promotion.idPromotion } });

            await promotion.destroy();

            res.status(200).json({
                message: 'Promotion supprimée avec succès'
            });
        } catch (error) {
            console.error('Erreur suppression promotion:', error);
            res.status(500).json({
                message: 'Erreur lors de la suppression de la promotion',
                error: error.message
            });
        }
    }

    // Obtenir les statistiques d'utilisation
    static async getStatsUtilisation(req, res) {
        try {
            const { dateDebut, dateFin } = req.query;
            const whereClause = {};
            
            if (dateDebut || dateFin) {
                whereClause.createdAt = {};
                if (dateDebut) whereClause.createdAt[Op.gte] = new Date(dateDebut);
                if (dateFin) whereClause.createdAt[Op.lte] = new Date(dateFin);
            }

            const statsGenerales = await PromotionUtilisation.findAll({
                where: whereClause,
                attributes: [
                    [sequelize.fn('COUNT', sequelize.col('idUtilisation')), 'totalUtilisations'],
                    [sequelize.fn('SUM', sequelize.col('montantReduction')), 'totalReductions'],
                    [sequelize.fn('AVG', sequelize.col('montantReduction')), 'reductionMoyenne']
                ],
                raw: true
            });

            const topPromotions = await PromotionUtilisation.findAll({
                where: whereClause,
                attributes: [
                    'idPromotion',
                    [sequelize.fn('COUNT', sequelize.col('PromotionUtilisation.idUtilisation')), 'utilisations'],
                    [sequelize.fn('SUM', sequelize.col('montantReduction')), 'totalReduction']
                ],
                include: [{
                    model: Promotion,
                    as: 'promotion',
                    attributes: ['nom', 'typePromotion', 'typeApplication']
                }],
                group: ['idPromotion', 'promotion.idPromotion'],
                order: [[sequelize.fn('COUNT', sequelize.col('PromotionUtilisation.idUtilisation')), 'DESC']],
                limit: 10
            });

            const repartitionType = await PromotionUtilisation.findAll({
                where: whereClause,
                attributes: [
                    [sequelize.fn('COUNT', sequelize.col('PromotionUtilisation.idUtilisation')), 'count']
                ],
                include: [{
                    model: Promotion,
                    as: 'promotion',
                    attributes: ['typeApplication']
                }],
                group: ['promotion.typeApplication']
            });

            res.status(200).json({
                message: 'Statistiques récupérées',
                data: {
                    generales: statsGenerales[0] || {},
                    topPromotions,
                    repartitionType
                }
            });

        } catch (error) {
            console.error('Erreur statistiques promotions:', error);
            res.status(500).json({
                message: 'Erreur lors de la récupération des statistiques',
                error: error.message
            });
        }
    }

    // Activer/Désactiver une promotion
    static async togglePromotion(req, res) {
        try {
            const promotion = await Promotion.findByPk(req.params.id);
            if (!promotion) {
                return res.status(404).json({
                    message: 'Promotion non trouvée'
                });
            }

            await promotion.update({ actif: !promotion.actif });

            res.status(200).json({
                message: `Promotion ${promotion.actif ? 'activée' : 'désactivée'}`,
                data: promotion
            });
        } catch (error) {
            console.error('Erreur toggle promotion:', error);
            res.status(500).json({
                message: 'Erreur lors de la modification du statut',
                error: error.message
            });
        }
    }

    // Dupliquer une promotion
    static async dupliquerPromotion(req, res) {
        const transaction = await sequelize.transaction();
        
        try {
            const promotionOriginale = await Promotion.findByPk(req.params.id, {
                include: [
                    { model: Produit, as: 'produits', through: { attributes: [] } },
                    { model: Categorie, as: 'categories', through: { attributes: [] } },
                    { model: Marque, as: 'marques', through: { attributes: [] } },
                    { model: Type, as: 'types', through: { attributes: [] } }
                ]
            });

            if (!promotionOriginale) {
                await transaction.rollback();
                return res.status(404).json({
                    message: 'Promotion non trouvée'
                });
            }

            const nouvellePromotion = await Promotion.create({
                nom: `${promotionOriginale.nom} (Copie)`,
                description: promotionOriginale.description,
                typePromotion: promotionOriginale.typePromotion,
                valeurPromotion: promotionOriginale.valeurPromotion,
                typeApplication: promotionOriginale.typeApplication,
                conditionMinimum: promotionOriginale.conditionMinimum,
                quantiteMinimum: promotionOriginale.quantiteMinimum,
                dateDebut: new Date(),
                dateFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                utilisationMax: promotionOriginale.utilisationMax,
                utilisationParClient: promotionOriginale.utilisationParClient,
                actif: false
            }, { transaction });

            if (promotionOriginale.produits && promotionOriginale.produits.length > 0) {
                const associations = promotionOriginale.produits.map(produit => ({
                    idPromotion: nouvellePromotion.idPromotion,
                    idProduit: produit.idProduit
                }));
                await PromotionProduit.bulkCreate(associations, { transaction });
            }

            if (promotionOriginale.categories && promotionOriginale.categories.length > 0) {
                const associations = promotionOriginale.categories.map(categorie => ({
                    idPromotion: nouvellePromotion.idPromotion,
                    idCategorie: categorie.idCategorie
                }));
                await PromotionCategorie.bulkCreate(associations, { transaction });
            }

            if (promotionOriginale.marques && promotionOriginale.marques.length > 0) {
                const associations = promotionOriginale.marques.map(marque => ({
                    idPromotion: nouvellePromotion.idPromotion,
                    idMarque: marque.idMarque
                }));
                await PromotionMarque.bulkCreate(associations, { transaction });
            }

            if (promotionOriginale.types && promotionOriginale.types.length > 0) {
                const associations = promotionOriginale.types.map(type => ({
                    idPromotion: nouvellePromotion.idPromotion,
                    idType: type.idType
                }));
                await PromotionType.bulkCreate(associations, { transaction });
            }

            await transaction.commit();

            res.status(201).json({
                message: 'Promotion dupliquée avec succès',
                data: nouvellePromotion
            });

        } catch (error) {
            await transaction.rollback();
            console.error('Erreur duplication promotion:', error);
            res.status(500).json({
                message: 'Erreur lors de la duplication',
                error: error.message
            });
        }
    }
    // Nouvelle méthode pour obtenir les promotions actives
    static async getPromotionsActives(req, res) {
        try {
            const { idProduit } = req.query;
            const promotions = await PromotionService.getPromotionsActives(idProduit);

            res.status(200).json({
                message: 'Promotions actives récupérées avec succès',
                data: promotions
            });
        } catch (error) {
            console.error('Erreur récupération promotions actives:', error);
            res.status(500).json({
                message: 'Erreur lors de la récupération des promotions actives',
                error: error.message
            });
        }
    }
// Ajoutez cette nouvelle méthode dans PromotionController
static async getPromotionsPourProduit(req, res) {
    try {
        const { idProduit } = req.params;
        
        // Utiliser le service pour récupérer toutes les promotions applicables
        const promotions = await PromotionService.getPromotionsActives(parseInt(idProduit));
        
        res.status(200).json({
            message: 'Promotions récupérées avec succès',
            data: promotions
        });
    } catch (error) {
        console.error('Erreur récupération promotions produit:', error);
        res.status(500).json({
            message: 'Erreur lors de la récupération des promotions',
            error: error.message
        });
    }
}

// Nouvelle méthode pour calculer le prix avec promotions
static async calculerPrixProduit(req, res) {
    try {
        const { idProduit } = req.params;
        const { prix, quantite = 1 } = req.body;
        
        const resultat = await PromotionService.calculerPrixAvecPromotions(
            parseInt(idProduit), 
            parseFloat(prix), 
            parseInt(quantite)
        );
        
        res.status(200).json({
            message: 'Prix calculé avec succès',
            data: resultat
        });
    } catch (error) {
        console.error('Erreur calcul prix produit:', error);
        res.status(500).json({
            message: 'Erreur lors du calcul du prix',
            error: error.message
        });
    }
}
}

module.exports = PromotionController;