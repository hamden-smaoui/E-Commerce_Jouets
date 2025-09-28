const { Commande, Utilisateur, LigneCommande, Facture, Produit, Image, Promotion, ProduitVariation, Couleur, Taille, Age } = require('../models');
const PromotionService = require('../services/PromotionService');
const CommandeService = require('../services/CommandeService');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

class CommandeController {
// Dans CommandeController.createCommande()
 async createCommande(req, res) {
        const transaction = await sequelize.transaction();
        let isTransactionCommitted = false;
        try {
            const resultat = await CommandeService.creerCommande(req.body, transaction);
            await transaction.commit();
            isTransactionCommitted = true;

            // On enrichit la commande avec la variation dans chaque ligne
            const commandeComplete = await CommandeService.obtenirCommandeComplete(
                resultat.commande.idCommande
            );

            res.status(201).json({
                message: 'Commande et facture créées avec succès',
                data: commandeComplete,
                calculDetails: {
                    montantOriginal: resultat.montants.montantOriginal,
                    montantProduits: resultat.montants.montantProduits,
                    reductionProduits: resultat.montants.montantOriginal - resultat.montants.montantProduits,
                    reductionCodePromo: resultat.resultatsPromo.reductionCodePromo,
                    montantFinal: resultat.resultatsPromo.montantFinal,
                    fraisLivraison: resultat.montants.fraisLivraisonFinal,
                    montantTotal: resultat.montants.montantTotalAvecLivraison,
                    economiesTotal: resultat.montants.montantOriginal - resultat.resultatsPromo.montantFinal
                },
                promotions: {
                    promotionsProduits: resultat.lignesAvecPromotions
                        .filter(ligne => ligne.idPromotionAppliquee)
                        .map(ligne => ({
                            idProduit: ligne.idProduit,
                            idProduitVariation: ligne.idProduitVariation,
                            reduction: ligne.reductionUnitaire * ligne.quantite
                        })),
                    promotionGlobale: resultat.resultatsPromo.promotionGlobale ? {
                        nom: resultat.resultatsPromo.promotionGlobale.nom,
                        reduction: resultat.resultatsPromo.reductionCodePromo
                    } : null
                }
            });

        } catch (error) {
             console.error('ERREUR CREATE COMMANDE:', error);
            if (!isTransactionCommitted && !transaction.finished) {
                try { await transaction.rollback(); } catch (rollbackError) {}
            }
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
                        attributes: [
                            'idLigneCommande',
                            'idProduit',
                            'idProduitVariation',
                            'quantite',
                            'prixUnitaire',
                            'prixUnitaireOriginal',
                            'prixUnitaireFinal',
                            'sousTotal',
                            'reductionUnitaire',
                            'idPromotionAppliquee'
                        ],
                        include: [
                            {
                                model: Produit,
                                as: 'produit',
                                attributes: ['idProduit', 'nom', 'prix'],
                                include: [{
                                    model: Image,
                                    as: 'images',
                                    attributes: ['url', 'rang'],
                                    order: [['rang', 'ASC']]
                                }]
                            },
                            {
                                model: ProduitVariation,
                                as: 'variation',
                                include: [
                                    { model: Couleur, as: 'couleur' },
                                    { model: Taille, as: 'taille' },
                                    { model: Age, as: 'age' }
                                ]
                            },
                            {
                                model: Promotion, as: 'promotionAppliquee', attributes: ['idPromotion', 'nom', 'description', 'typePromotion'], required: false
                            }
                        ]
                    },
                    {
                        model: Promotion,
                        as: 'promotionGlobale',
                        attributes: ['idPromotion', 'nom', 'description', 'typePromotion'],
                        required: false
                    }
                ]
            });
            if (!commande) return res.status(404).json({ message: 'Commande non trouvée' });

            // Calculs enrichis
            const commandeEnrichie = {
                ...commande.toJSON(),
                calculDetails: {
                    montantOriginal: commande.montantOriginal,
                    montantFinal: commande.montantTotal - (commande.fraisLivraison || 0),
                    fraisLivraison: commande.fraisLivraison || 0,
                    montantTotal: commande.montantTotal,
                    economiesTotal: commande.montantReduction || 0,
                    economiesProduits: commande.lignesCommandes?.reduce((total, ligne) =>
                        total + ((ligne.reductionUnitaire || 0) * ligne.quantite), 0) || 0,
                    economiesCodePromo: (commande.montantReduction || 0) -
                        (commande.lignesCommandes?.reduce((total, ligne) =>
                            total + ((ligne.reductionUnitaire || 0) * ligne.quantite), 0) || 0)
                }
            };
            res.status(200).json(commandeEnrichie);
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la récupération de la commande',
                error: error.message
            });
        }
    }

 async updateCommande(req, res) {
    const transaction = await sequelize.transaction();
    let isTransactionCommitted = false;

    try {
        const commande = await Commande.findByPk(req.params.id, {
            include: [{ model: LigneCommande, as: 'lignesCommandes' }]
        });
        if (!commande) {
            return res.status(404).json({ message: 'Commande non trouvée' });
        }

        // Vérifier si le statut change de non-"annulée" à "annulée"
        const nouveauStatut = req.body.statut;
        if (
            nouveauStatut === 'annulée' &&
            commande.statut !== 'annulée'
        ) {
            // Pour chaque ligne de commande, restituer la quantité au stock de la VARIATION
            for (const ligne of commande.lignesCommandes) {
                // ✅ Correction : restaurer le stock de la variation, pas du produit
                const variation = await ProduitVariation.findByPk(ligne.idProduitVariation, { transaction });
                if (variation) {
                    variation.quantiteStock += ligne.quantite;
                    await variation.save({ transaction });
                }
            }
        }

        await commande.update(req.body, { transaction });

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
                    include: [
                        {
                            model: Produit,
                            as: 'produit',
                            attributes: ['idProduit', 'nom']
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
                },
                {
                    model: Facture,
                    as: 'facture',
                    attributes: ['idFacture', 'statut']
                }
            ],
            transaction
        });

        await transaction.commit();
        isTransactionCommitted = true;

        res.status(200).json({
            message: 'Commande mise à jour avec succès',
            data: commandeComplete
        });
    } catch (error) {
        if (!isTransactionCommitted && !transaction.finished) {
            try { await transaction.rollback(); } catch (e) {}
        }
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
            
            await commande.destroy(); 
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
        console.log('User from token:', req.user);
        const idClient = req.user.idUtilisateur;

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