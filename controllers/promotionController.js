const { 
    Promotion, 
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
    static async createPromotion(req, res, next) {
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
                types = []
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

            res.status(201).json({
                message: 'Promotion créée avec succès',
                data: promotion
            });
        } catch (error) {
            next(error);
        }
    }

    static async appliquerPromotion(req, res, next) {
        try {
            const { panierData, idUtilisateur } = req.body;
            const resultat = await PromotionService.appliquerPromotionCommande({
                ...panierData,
                idClient: idUtilisateur
            });
            if (resultat.error || !resultat.promotion) {
                const error = new Error(resultat.error || 'Aucune promotion applicable');
                error.code = "VALIDATION_ERROR";
                return next(error);
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
            next(error);
        }
    }

    static async getAllPromotions(req, res, next) {
        try {
            const promotions = await Promotion.findAll({
                include: [
                    { model: Produit, as: 'produits', through: { attributes: [] } },
                    { model: Categorie, as: 'categories', through: { attributes: [] } },
                    { model: Marque, as: 'marques', through: { attributes: [] } },
                    { model: Type, as: 'types', through: { attributes: [] } }
                ]
            });
            res.status(200).json(promotions);
        } catch (error) {
            next(error);
        }
    }

    static async getPromotionById(req, res, next) {
        try {
            const promotion = await Promotion.findByPk(req.params.id, {
                include: [
                    { model: Produit, as: 'produits', through: { attributes: [] } },
                    { model: Categorie, as: 'categories', through: { attributes: [] } },
                    { model: Marque, as: 'marques', through: { attributes: [] } },
                    { model: Type, as: 'types', through: { attributes: [] } }
                ]
            });
            if (!promotion) {
                const error = new Error('Promotion non trouvée');
                error.code = "NOT_FOUND";
                return next(error);
            }
            res.status(200).json({
                message: 'Promotion récupérée avec succès',
                data: promotion
            });
        } catch (error) {
            next(error);
        }
    }

    static async updatePromotion(req, res, next) {
        try {
            const promotion = await Promotion.findByPk(req.params.id);
            if (!promotion) {
                const error = new Error('Promotion non trouvée');
                error.code = "NOT_FOUND";
                return next(error);
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
                types = []
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

            res.status(200).json({
                message: 'Promotion mise à jour avec succès',
                data: promotion
            });
        } catch (error) {
            next(error);
        }
    }

    static async deletePromotion(req, res, next) {
        try {
            const promotion = await Promotion.findByPk(req.params.id);
            if (!promotion) {
                const error = new Error('Promotion non trouvée');
                error.code = "NOT_FOUND";
                return next(error);
            }

            await PromotionProduit.destroy({ where: { idPromotion: promotion.idPromotion } });
            await PromotionCategorie.destroy({ where: { idPromotion: promotion.idPromotion } });
            await PromotionMarque.destroy({ where: { idPromotion: promotion.idPromotion } });
            await PromotionType.destroy({ where: { idPromotion: promotion.idPromotion } });
            await PromotionUtilisation.destroy({ where: { idPromotion: promotion.idPromotion } });

            await promotion.destroy();

            res.status(200).json({
                message: 'Promotion supprimée avec succès'
            });
        } catch (error) {
            next(error);
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
    const err = new Error('Erreur lors de la récupération des statistiques');
    err.code = "SERVER_ERROR";
    return next(err);
}
    }

    // Activer/Désactiver une promotion
    static async togglePromotion(req, res) {
        try {
            const promotion = await Promotion.findByPk(req.params.id);
            if (!promotion) {
    const error = new Error('Promotion non trouvée');
    error.code = "NOT_FOUND";
    return next(error);
}

            await promotion.update({ actif: !promotion.actif });

            res.status(200).json({
                message: `Promotion ${promotion.actif ? 'activée' : 'désactivée'}`,
                data: promotion
            });
        }catch (error) {
    const err = new Error('Erreur lors de la modification du statut');
    err.code = "SERVER_ERROR";
    return next(err);
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
    const error = new Error('Promotion non trouvée');
    error.code = "NOT_FOUND";
    return next(error);
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
    const err = new Error('Erreur lors de la duplication');
    err.code = "SERVER_ERROR";
    return next(err);
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
        } 
        catch (error) {
    const err = new Error('Erreur lors de la récupération des promotions actives');
    err.code = "SERVER_ERROR";
    return next(err);
}
    }

    // Nouvelle méthode pour récupérer les promotions d'un produit
    static async getPromotionsPourProduit(req, res) {
        try {
            const { idProduit } = req.params;
            const promotions = await PromotionService.getPromotionsActives(parseInt(idProduit));
            res.status(200).json({
                message: 'Promotions récupérées avec succès',
                data: promotions
            });
        } 
         catch (error) {
    const err = new Error('Erreur lors de la récupération des promotions');
    err.code = "SERVER_ERROR";
    return next(err);
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
        } 
         catch (error) {
    const err = new Error('Erreur lors du calcul du prix');
    err.code = "SERVER_ERROR";
    return next(err);
}
    }
}

module.exports = PromotionController;