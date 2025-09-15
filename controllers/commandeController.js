const { Commande, Utilisateur, LigneCommande, Facture, Produit, Image } = require('../models');
const PromotionService = require('../services/PromotionService');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

class CommandeController {
// Dans CommandeController.createCommande()
async createCommande(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
        const { lignesCommandes, codePromo, fraisLivraison = 0, ...commandeData } = req.body;
        
        // Calculer le montant total basé sur les lignes de commande ORIGINALES
        let montantTotal = 0;
        if (lignesCommandes && lignesCommandes.length > 0) {
            montantTotal = lignesCommandes.reduce((total, ligne) => {
                return total + (ligne.quantite * ligne.prixUnitaire);
            }, 0);
        }

        // Préparer les données pour le service de promotion
        const donneesCommande = {
            ...commandeData,
            montantTotal,
            lignesCommandes,
            fraisLivraison: parseFloat(fraisLivraison) || 0
        };

        // Appliquer les promotions
        const promotionResult = await PromotionService.appliquerPromotionCommande(
            donneesCommande, 
            codePromo,
            transaction
        );

        // IMPORTANT : Calculer le montant final avec frais de livraison
        const montantFinalSansLivraison = promotionResult.montantFinal;
        const montantTotalAvecLivraison = montantFinalSansLivraison + (parseFloat(fraisLivraison) || 0);

        // NOUVEAU : Mettre à jour le profil utilisateur si connecté et si des infos manquent
        if (commandeData.idClient) {
            const utilisateur = await Utilisateur.findByPk(commandeData.idClient, { transaction });
            
            if (utilisateur) {
                const updateData = {};
                let shouldUpdate = false;

                // Vérifier et mettre à jour les champs d'adresse manquants
                if (!utilisateur.telephone && commandeData.clientTelephone) {
                    updateData.telephone = commandeData.clientTelephone;
                    shouldUpdate = true;
                }
                
                if (!utilisateur.adresseRue && commandeData.clientAdresseRue) {
                    updateData.adresseRue = commandeData.clientAdresseRue;
                    shouldUpdate = true;
                }
                
                if (!utilisateur.adresseVille && commandeData.clientAdresseVille) {
                    updateData.adresseVille = commandeData.clientAdresseVille;
                    shouldUpdate = true;
                }
                
                if (!utilisateur.adresseCodePostal && commandeData.clientAdresseCodePostal) {
                    updateData.adresseCodePostal = commandeData.clientAdresseCodePostal;
                    shouldUpdate = true;
                }
                
                if (!utilisateur.adressePays && commandeData.clientAdressePays) {
                    updateData.adressePays = commandeData.clientAdressePays;
                    shouldUpdate = true;
                }

                // Mettre à jour l'utilisateur si nécessaire
                if (shouldUpdate) {
                    await utilisateur.update(updateData, { transaction });
                    console.log('Profil utilisateur mis à jour avec les informations de commande');
                }
            }
        }

        // Créer la commande avec le montant final COMPLET
        const commande = await Commande.create({
            ...commandeData,
            montantTotal: montantTotalAvecLivraison,
            montantOriginal: montantTotal + (parseFloat(fraisLivraison) || 0),
            montantReduction: promotionResult.montantReduction,
            idPromotionUtilisee: promotionResult.promotion?.idPromotion || null,
            codePromoUtilise: codePromo || null
        }, { transaction });

        // Créer les lignes de commande avec prix ORIGINAUX
        if (lignesCommandes && lignesCommandes.length > 0) {
            const lignes = lignesCommandes.map(ligne => ({
                ...ligne,
                idCommande: commande.idCommande,
                prixUnitaire: ligne.prixUnitaire,
                sousTotal: ligne.quantite * ligne.prixUnitaire
            }));
            await LigneCommande.bulkCreate(lignes, { transaction });
        }

        // Créer une facture associée
        await Facture.create({
            idCommande: commande.idCommande,
            montantTotal: commande.montantTotal,
        }, { transaction });

        // Enregistrer l'utilisation de la promotion si applicable
        if (promotionResult.promotion) {
            await PromotionService.enregistrerUtilisation(
                promotionResult.promotion.idPromotion,
                commande.idCommande,
                commandeData.idClient,
                promotionResult.montantReduction,
                promotionResult.codePromo?.idCodePromo || null,
                transaction
            );
        }

        await transaction.commit();

        // Récupérer la commande créée
        const commandeComplete = await Commande.findByPk(commande.idCommande, {
            include: [
                {
                    model: Utilisateur,
                    as: 'client',
                    attributes: ['idUtilisateur', 'prenom', 'nom']
                },
                {
                    model: LigneCommande,
                    as: 'lignesCommandes',
                    include: [{
                        model: Produit,
                        as: 'produit',
                        attributes: ['idProduit', 'nom']
                    }]
                }
            ]
        });

        res.status(201).json({
            message: 'Commande créée avec succès',
            data: commandeComplete,
            calculDetails: {
                montantOriginal: montantTotal,
                montantReduction: promotionResult.montantReduction,
                montantProduits: montantFinalSansLivraison,
                fraisLivraison: parseFloat(fraisLivraison) || 0,
                montantTotal: montantTotalAvecLivraison
            },
            promotion: promotionResult.promotion ? {
                nom: promotionResult.promotion.nom,
                reduction: promotionResult.montantReduction,
                codePromo: codePromo || 'Automatique'
            } : null
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Create commande error:', error);
        res.status(500).json({
            message: 'Erreur lors de la création de la commande',
            error: error.message
        });
    }
}

    // Nouvelle méthode pour calculer le panier avec promotions
    async calculerPanier(req, res) {
        try {
            const { lignesCommandes, codePromo, idClient, fraisLivraison = 0 } = req.body;
            
            if (!lignesCommandes || lignesCommandes.length === 0) {
                return res.status(400).json({
                    message: 'Panier vide'
                });
            }

            // Calculer montant total
            const montantTotal = lignesCommandes.reduce((total, ligne) => {
                return total + (ligne.quantite * ligne.prixUnitaire);
            }, 0);

            // Préparer les données
            const donneesCommande = {
                idClient,
                montantTotal,
                lignesCommandes,
                fraisLivraison
            };

            // Appliquer les promotions
            const promotionResult = await PromotionService.appliquerPromotionCommande(
                donneesCommande, 
                codePromo
            );

            res.status(200).json({
                message: 'Calcul panier effectué',
                data: {
                    montantOriginal: montantTotal,
                    fraisLivraison,
                    montantReduction: promotionResult.montantReduction,
                    montantFinal: promotionResult.montantFinal + fraisLivraison,
                    promotion: promotionResult.promotion ? {
                        nom: promotionResult.promotion.nom,
                        description: promotionResult.promotion.description,
                        typePromotion: promotionResult.promotion.typePromotion
                    } : null,
                    codePromo: codePromo || null,
                    error: promotionResult.error || null
                }
            });

        } catch (error) {
            console.error('Calcul panier error:', error);
            res.status(500).json({
                message: 'Erreur lors du calcul du panier',
                error: error.message
            });
        }
    }

    // Méthode pour valider un code promo
    async validerCodePromo(req, res) {
        try {
            const { codePromo, lignesCommandes, idClient } = req.body;
            
            if (!codePromo) {
                return res.status(400).json({
                    message: 'Code promo requis'
                });
            }

            const montantTotal = lignesCommandes.reduce((total, ligne) => {
                return total + (ligne.quantite * ligne.prixUnitaire);
            }, 0);

            const donneesCommande = {
                idClient,
                montantTotal,
                lignesCommandes
            };

            const promotionResult = await PromotionService.appliquerPromotionCommande(
                donneesCommande, 
                codePromo
            );

            if (promotionResult.error) {
                return res.status(400).json({
                    message: promotionResult.error,
                    valide: false
                });
            }

            if (!promotionResult.promotion) {
                return res.status(404).json({
                    message: 'Code promo invalide ou non applicable',
                    valide: false
                });
            }

            res.status(200).json({
                message: 'Code promo valide',
                valide: true,
                reduction: promotionResult.montantReduction,
                promotion: {
                    nom: promotionResult.promotion.nom,
                    description: promotionResult.promotion.description
                }
            });

        } catch (error) {
            console.error('Validation code promo error:', error);
            res.status(500).json({
                message: 'Erreur lors de la validation du code promo',
                error: error.message
            });
        }
    }


    async getAllCommandes(req, res) {
        try {
            const { page = 1, limit = 10, statut, dateDebut, dateFin } = req.query;
            
            const where = {};
            if (statut) where.statut = statut;
            if (dateDebut || dateFin) {
                where.dateCommande = {};
                if (dateDebut) where.dateCommande[Op.gte] = new Date(dateDebut);
                if (dateFin) where.dateCommande[Op.lte] = new Date(dateFin);
            }

            const offset = (page - 1) * limit;

            const { count, rows: commandes } = await Commande.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset,
                order: [['dateCommande', 'DESC']],
                include: [
                    {
                        model: Utilisateur,
                        as: 'client',
                        attributes: ['idUtilisateur', 'prenom', 'nom']
                    },
                    {
                        model: LigneCommande,
                        as: 'lignesCommandes',
                        include: [{
                            model: Produit,
                            as: 'produit',
                            attributes: ['idProduit', 'nom'],
                            include: [{
                                model: Image,
                                as: 'images',
                                attributes: ['url', 'rang'],
                                limit: 1,
                                order: [['rang', 'ASC']]
                            }]
                        }]
                    },
                    {
                        model: Facture,
                        as: 'facture',
                        attributes: ['idFacture', 'statut']
                    }
                ]
            });

            res.status(200).json({
                data: commandes,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: count,
                    totalPages: Math.ceil(count / limit)
                }
            });
        } catch (error) {
            console.error('Get all commandes error:', error);
            res.status(500).json({
                message: 'Erreur lors de la récupération des commandes',
                error: error.message
            });
        }
    }

    async getCommandeById(req, res) {
        try {
            const commande = await Commande.findByPk(req.params.id, {
                include: [
                    {
                        model: Utilisateur,
                        as: 'client',
                        attributes: ['idUtilisateur', 'prenom', 'nom', 'email']
                    },
                    {
                        model: LigneCommande,
                        as: 'lignesCommandes',
                        include: [{
                            model: Produit,
                            as: 'produit',
                            attributes: ['idProduit', 'nom', 'prix'],
                            include: [{
                                model: Image,
                                as: 'images',
                                attributes: ['url', 'rang'],
                                order: [['rang', 'ASC']]
                            }]
                        }]
                    },
                    
                ]
            });
            if (!commande) {
                return res.status(404).json({ message: 'Commande non trouvée' });
            }
            res.status(200).json(commande);
        } catch (error) {
            console.error('Get commande by ID error:', error);
            res.status(500).json({
                message: 'Erreur lors de la récupération de la commande',
                error: error.message
            });
        }
    }

    async updateCommande(req, res) {
        try {
            const commande = await Commande.findByPk(req.params.id);
            if (!commande) {
                return res.status(404).json({ message: 'Commande non trouvée' });
            }

            await commande.update(req.body);

            // Récupérer la commande mise à jour avec les associations
            const commandeComplete = await Commande.findByPk(commande.idCommande, {
                include: [
                    {
                        model: Utilisateur,
                        as: 'client',
                        attributes: ['idUtilisateur', 'prenom', 'nom']
                    },
                    {
                        model: LigneCommande,
                        as: 'lignesCommandes',
                        include: [{
                            model: Produit,
                            as: 'produit',
                            attributes: ['idProduit', 'nom']
                        }]
                    },
                    {
                        model: Facture,
                        as: 'facture',
                        attributes: ['idFacture', 'statut']
                    }
                ]
            });

            res.status(200).json({
                message: 'Commande mise à jour avec succès',
                data: commandeComplete
            });
        } catch (error) {
            console.error('Update commande error:', error);
            res.status(500).json({
                message: 'Erreur lors de la mise à jour de la commande',
                error: error.message
            });
        }
    }

    async deleteCommande(req, res) {
        try {
            const commande = await Commande.findByPk(req.params.id, {
                include: [{ model: LigneCommande, as: 'lignesCommandes' }]
            });
            if (!commande) {
                return res.status(404).json({ message: 'Commande non trouvée' });
            }
            
            await commande.destroy(); // Les lignes de commande seront supprimées automatiquement si cascade est configuré
            res.status(200).json({ message: 'Commande supprimée avec succès' });
        } catch (error) {
            console.error('Delete commande error:', error);
            res.status(500).json({
                message: 'Erreur lors de la suppression de la commande',
                error: error.message
            });
        }
    }

    async getCommandesByClient(req, res) {
        try {
            const idClient = req.params.id;
            const commandes = await Commande.findAll({
                where: { idClient },
                order: [['dateCommande', 'DESC']],
                include: [
                    {
                        model: LigneCommande,
                        as: 'lignesCommandes',
                        include: [{
                            model: Produit,
                            as: 'produit',
                            attributes: ['idProduit', 'nom']
                        }]
                    },
                    {
                        model: Facture,
                        as: 'facture',
                        attributes: ['idFacture', 'statut']
                    }
                ]
            });
            res.status(200).json(commandes);
        } catch (error) {
            console.error('Get commandes by client error:', error);
            res.status(500).json({
                message: 'Erreur lors de la récupération des commandes par client',
                error: error.message
            });
        }
    }

    // Nouvelle méthode pour obtenir les statistiques des commandes
    async getCommandeStats(req, res) {
        try {
            const { Op } = require('sequelize');
            
            const stats = await Commande.findAll({
                attributes: [
                    'statut',
                    [sequelize.fn('COUNT', sequelize.col('idCommande')), 'count'],
                    [sequelize.fn('SUM', sequelize.col('montantTotal')), 'total']
                ],
                group: 'statut'
            });

            res.status(200).json(stats);
        } catch (error) {
            console.error('Get commande stats error:', error);
            res.status(500).json({
                message: 'Erreur lors de la récupération des statistiques',
                error: error.message
            });
        }
    }
}

module.exports = new CommandeController();