const { Commande, Utilisateur, LigneCommande, Facture, Produit, Image, Promotion, ProduitVariation, Couleur, Taille, Age } = require('../models');
const PromotionService = require('../services/PromotionService');
const CommandeService = require('../services/CommandeService');
const sequelize = require('../config/database');
const { Op } = require('sequelize');
const validator = require('validator');

function validateClientData(clientData) {
  if (!clientData.clientPrenom || !validator.isLength(clientData.clientPrenom, { min: 2, max: 50 }) || !validator.matches(clientData.clientPrenom, /^[A-Za-zÀ-ÿ\s\-]+$/))
    return "Prénom invalide";
  if (!clientData.clientNom || !validator.isLength(clientData.clientNom, { min: 2, max: 50 }) || !validator.matches(clientData.clientNom, /^[A-Za-zÀ-ÿ\s\-]+$/))
    return "Nom invalide";
  if (!clientData.clientTelephone || !validator.isLength(clientData.clientTelephone, { min: 6, max: 20 }))
    return "Téléphone invalide";
  if (clientData.clientEmail && !validator.isEmail(clientData.clientEmail))
    return "Email invalide";
  if (!clientData.clientAdresseRue || !validator.isLength(clientData.clientAdresseRue, { min: 4, max: 100 }))
    return "Adresse rue invalide";
  if (!clientData.clientAdresseVille || !validator.isLength(clientData.clientAdresseVille, { min: 2, max: 50 }))
    return "Adresse ville invalide";
  if (!clientData.clientAdresseCodePostal || !validator.isLength(clientData.clientAdresseCodePostal, { min: 2, max: 12 }))
    return "Code postal invalide";
  if (!clientData.clientAdressePays || !validator.isLength(clientData.clientAdressePays, { min: 2, max: 50 }))
    return "Pays invalide";
  if (clientData.notesLivraison && !validator.isLength(clientData.notesLivraison, { max: 300 }))
    return "Notes de livraison trop longues";
  return null;
}

class CommandeController {
  async createCommande(req, res, next) {
    const transaction = await sequelize.transaction();
    let isTransactionCommitted = false;
    try {
      // Nettoyage des champs client
      const clientData = { ...req.body };
      Object.keys(clientData).forEach(field => {
        if (typeof clientData[field] === "string") {
          clientData[field] = validator.escape(clientData[field].trim());
        }
      });

      // Validation
      const validationError = validateClientData(clientData);
      if (validationError) {
        await transaction.rollback();
        const error = new Error(validationError);
        error.code = "VALIDATION_ERROR";
        return next(error);
      }

      // Création commande
      const resultat = await CommandeService.creerCommande(clientData, transaction);
      await transaction.commit();
      isTransactionCommitted = true;

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
      if (!isTransactionCommitted && !transaction.finished) {
        try { await transaction.rollback(); } catch (rollbackError) {}
      }
      next(error);
    }
  }

  async calculerPanier(req, res, next) {
    try {
      const { lignesCommandes, codePromo, idClient, fraisLivraison = 0 } = req.body;
      if (!lignesCommandes || lignesCommandes.length === 0) {
        const error = new Error('Panier vide');
        error.code = "VALIDATION_ERROR";
        return next(error);
      }
      const montantTotal = lignesCommandes.reduce((total, ligne) => total + (ligne.quantite * ligne.prixUnitaire), 0);
      const donneesCommande = { idClient, montantTotal, lignesCommandes, fraisLivraison };
      const promotionResult = await PromotionService.appliquerPromotionCommande(donneesCommande, codePromo);
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
      next(error);
    }
  }

  async validerCodePromo(req, res, next) {
    try {
      const { codePromo, lignesCommandes, idClient } = req.body;
      if (!codePromo) {
        const error = new Error('Code promo requis');
        error.code = "VALIDATION_ERROR";
        return next(error);
      }
      const montantTotal = lignesCommandes.reduce((total, ligne) => total + (ligne.quantite * ligne.prixUnitaire), 0);
      const donneesCommande = { idClient, montantTotal, lignesCommandes };
      const promotionResult = await PromotionService.appliquerPromotionCommande(donneesCommande, codePromo);
      if (promotionResult.error) {
        const error = new Error(promotionResult.error);
        error.code = "VALIDATION_ERROR";
        return next(error);
      }
      if (!promotionResult.promotion) {
        const error = new Error('Code promo invalide ou non applicable');
        error.code = "NOT_FOUND";
        return next(error);
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
      next(error);
    }
  }

  async getAllCommandes(req, res, next) {
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
      next(error);
    }
  }

  async getCommandeById(req, res, next) {
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
      if (!commande) {
        const error = new Error('Commande non trouvée');
        error.code = "NOT_FOUND";
        return next(error);
      }
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
      next(error);
    }
  }

  async updateCommande(req, res, next) {
    const transaction = await sequelize.transaction();
    let isTransactionCommitted = false;
    try {
      const commande = await Commande.findByPk(req.params.id, {
        include: [{ model: LigneCommande, as: 'lignesCommandes' }]
      });
      if (!commande) {
        await transaction.rollback();
        const error = new Error('Commande non trouvée');
        error.code = "NOT_FOUND";
        return next(error);
      }
      const nouveauStatut = req.body.statut;
      if (nouveauStatut === 'annulée' && commande.statut !== 'annulée') {
        for (const ligne of commande.lignesCommandes) {
          const variation = await ProduitVariation.findByPk(ligne.idProduitVariation, { transaction });
          if (variation) {
            variation.quantiteStock += ligne.quantite;
            await variation.save({ transaction });
          }
        }
      }
      await commande.update(req.body, { transaction });
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
      next(error);
    }
  }

  async deleteCommande(req, res, next) {
    try {
      const commande = await Commande.findByPk(req.params.id, {
        include: [{ model: LigneCommande, as: 'lignesCommandes' }]
      });
      if (!commande) {
        const error = new Error('Commande non trouvée');
        error.code = "NOT_FOUND";
        return next(error);
      }
      await commande.destroy();
      res.status(200).json({ message: 'Commande supprimée avec succès' });
    } catch (error) {
      next(error);
    }
  }

  async getCommandesByClient(req, res, next) {
    try {
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
      next(error);
    }
  }

  async getCommandeStats(req, res, next) {
    try {
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
      next(error);
    }
  }
}

module.exports = new CommandeController();