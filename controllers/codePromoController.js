const { CodePromo, Promotion, PromotionUtilisation, Utilisateur } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

class CodePromoController {
    
    // Créer un code promo
    static async createCodePromo(req, res) {
        try {
            const {
                code,
                idPromotion,
                utilisationMax,
                actif = true
            } = req.body;

            // Vérifier que la promotion existe
            const promotion = await Promotion.findByPk(idPromotion);
            if (!promotion) {
                return res.status(404).json({
                    message: 'Promotion non trouvée'
                });
            }

            // Vérifier l'unicité du code
            const codeExistant = await CodePromo.findOne({
                where: { code: code.toUpperCase() }
            });

            if (codeExistant) {
                return res.status(400).json({
                    message: 'Ce code promo existe déjà'
                });
            }

            const codePromo = await CodePromo.create({
                code: code.toUpperCase(),
                idPromotion,
                utilisationMax,
                actif
            });

            res.status(201).json({
                message: 'Code promo créé avec succès',
                data: codePromo
            });

        } catch (error) {
            console.error('Erreur création code promo:', error);
            res.status(500).json({
                message: 'Erreur lors de la création du code promo',
                error: error.message
            });
        }
    }

    // Lister tous les codes promo
    static async getAllCodesPromo(req, res) {
        try {
            const { 
                page = 1, 
                limit = 10, 
                actif, 
                idPromotion,
                search 
            } = req.query;
            
            const where = {};
            if (actif !== undefined) where.actif = actif === 'true';
            if (idPromotion) where.idPromotion = idPromotion;
            if (search) {
                where.code = { [Op.like]: `%${search.toUpperCase()}%` };
            }

            const offset = (page - 1) * limit;

            const { count, rows: codesPromo } = await CodePromo.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset,
                order: [['createdAt', 'DESC']],
                include: [{
                    model: Promotion,
                    as: 'promotion',
                    attributes: [
                        'idPromotion', 
                        'nom', 
                        'typePromotion', 
                        'valeurPromotion',
                        'dateDebut',
                        'dateFin',
                        'actif'
                    ]
                }]
            });

            res.status(200).json({
                data: codesPromo,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: count,
                    totalPages: Math.ceil(count / limit)
                }
            });

        } catch (error) {
            console.error('Erreur récupération codes promo:', error);
            res.status(500).json({
                message: 'Erreur lors de la récupération des codes promo',
                error: error.message
            });
        }
    }

    // Récupérer un code promo par ID
    static async getCodePromoById(req, res) {
        try {
            const codePromo = await CodePromo.findByPk(req.params.id, {
                include: [{
                    model: Promotion,
                    as: 'promotion'
                }]
            });

            if (!codePromo) {
                return res.status(404).json({
                    message: 'Code promo non trouvé'
                });
            }

            res.status(200).json({
                message: 'Code promo récupéré avec succès',
                data: codePromo
            });

        } catch (error) {
            console.error('Erreur récupération code promo par ID:', error);
            res.status(500).json({
                message: 'Erreur lors de la récupération du code promo',
                error: error.message
            });
        }
    }

    // Valider un code promo
    static async validerCode(req, res) {
        try {
            const { code } = req.params;
            const { idUtilisateur, montantPanier } = req.query;

            const codePromo = await CodePromo.findOne({
                where: { 
                    code: code.toUpperCase(),
                    actif: true 
                },
                include: [{
                    model: Promotion,
                    as: 'promotion',
                    where: {
                        actif: true,
                        dateDebut: { [Op.lte]: new Date() },
                        dateFin: { [Op.gte]: new Date() }
                    }
                }]
            });

            if (!codePromo) {
                return res.status(404).json({
                    message: 'Code promo invalide ou expiré',
                    valide: false
                });
            }

            // Vérifier les limites d'utilisation
            if (codePromo.utilisationMax && 
                codePromo.utilisationActuelle >= codePromo.utilisationMax) {
                return res.status(400).json({
                    message: 'Code promo épuisé',
                    valide: false
                });
            }

            // Vérifier la limite par utilisateur si fourni
            if (idUtilisateur && codePromo.promotion.utilisationParClient) {
                const utilisationsUtilisateur = await PromotionUtilisation.count({
                    where: {
                        idPromotion: codePromo.promotion.idPromotion,
                        idUtilisateur: idUtilisateur
                    }
                });

                if (utilisationsUtilisateur >= codePromo.promotion.utilisationParClient) {
                    return res.status(400).json({
                        message: 'Limite d\'utilisation atteinte pour ce client',
                        valide: false
                    });
                }
            }

            // Vérifier les conditions de montant minimum
            if (montantPanier && codePromo.promotion.conditionMinimum) {
                if (parseFloat(montantPanier) < codePromo.promotion.conditionMinimum) {
                    return res.status(400).json({
                        message: `Montant minimum requis: ${codePromo.promotion.conditionMinimum}dt`,
                        valide: false,
                        montantMinimum: codePromo.promotion.conditionMinimum
                    });
                }
            }

            res.status(200).json({
                message: 'Code promo valide',
                valide: true,
                data: {
                    codePromo: codePromo.code,
                    promotion: {
                        nom: codePromo.promotion.nom,
                        description: codePromo.promotion.description,
                        typePromotion: codePromo.promotion.typePromotion,
                        valeurPromotion: codePromo.promotion.valeurPromotion,
                        typeApplication: codePromo.promotion.typeApplication
                    }
                }
            });

        } catch (error) {
            console.error('Erreur validation code promo:', error);
            res.status(500).json({
                message: 'Erreur lors de la validation du code promo',
                error: error.message
            });
        }
    }

    // Mettre à jour un code promo
    static async updateCodePromo(req, res) {
        try {
            const codePromo = await CodePromo.findByPk(req.params.id);
            
            if (!codePromo) {
                return res.status(404).json({
                    message: 'Code promo non trouvé'
                });
            }

            const { code, utilisationMax, actif } = req.body;
            
            // Vérifier l'unicité du code si modifié
            if (code && code.toUpperCase() !== codePromo.code) {
                const codeExistant = await CodePromo.findOne({
                    where: { 
                        code: code.toUpperCase(),
                        idCodePromo: { [Op.ne]: codePromo.idCodePromo }
                    }
                });

                if (codeExistant) {
                    return res.status(400).json({
                        message: 'Ce code promo existe déjà'
                    });
                }
            }

            await codePromo.update({
                code: code ? code.toUpperCase() : codePromo.code,
                utilisationMax: utilisationMax !== undefined ? utilisationMax : codePromo.utilisationMax,
                actif: actif !== undefined ? actif : codePromo.actif
            });

            res.status(200).json({
                message: 'Code promo mis à jour avec succès',
                data: codePromo
            });

        } catch (error) {
            console.error('Erreur mise à jour code promo:', error);
            res.status(500).json({
                message: 'Erreur lors de la mise à jour du code promo',
                error: error.message
            });
        }
    }

    // Supprimer un code promo
    static async deleteCodePromo(req, res) {
        try {
            const codePromo = await CodePromo.findByPk(req.params.id);
            
            if (!codePromo) {
                return res.status(404).json({
                    message: 'Code promo non trouvé'
                });
            }

            // Vérifier s'il y a des utilisations
            const utilisations = await PromotionUtilisation.count({
                where: { idCodePromo: codePromo.idCodePromo }
            });

            if (utilisations > 0) {
                // Ne pas supprimer, juste désactiver
                await codePromo.update({ actif: false });
                return res.status(200).json({
                    message: 'Code promo désactivé (utilisations existantes)'
                });
            }

            await codePromo.destroy();

            res.status(200).json({
                message: 'Code promo supprimé avec succès'
            });

        } catch (error) {
            console.error('Erreur suppression code promo:', error);
            res.status(500).json({
                message: 'Erreur lors de la suppression du code promo',
                error: error.message
            });
        }
    }

    // Générer des codes promo en masse
    static async genererCodesPromo(req, res) {
        try {
            const {
                idPromotion,
                nombreCodes,
                prefixe = 'PROMO',
                longueur = 8,
                utilisationMax = 1
            } = req.body;

            // Vérifier que la promotion existe
            const promotion = await Promotion.findByPk(idPromotion);
            if (!promotion) {
                return res.status(404).json({
                    message: 'Promotion non trouvée'
                });
            }

            const codes = [];
            const codesExistants = new Set();

            // Récupérer les codes existants pour éviter les doublons
            const codesDB = await CodePromo.findAll({
                attributes: ['code']
            });
            codesDB.forEach(c => codesExistants.add(c.code));
            // Générer les codes
           for (let i = 0; i < nombreCodes; i++) {
               let nouveauCode;
               let tentatives = 0;
               
               do {
                   const suffixe = Math.random().toString(36).substring(2, longueur).toUpperCase();
                   nouveauCode = `${prefixe}${suffixe}`;
                   tentatives++;
                   
                   if (tentatives > 100) {
                       throw new Error('Impossible de générer des codes uniques');
                   }
               } while (codesExistants.has(nouveauCode));

               codes.push({
                   code: nouveauCode,
                   idPromotion,
                   utilisationMax,
                   actif: true
               });
               
               codesExistants.add(nouveauCode);
           }

           // Créer les codes en base
           const codesCreated = await CodePromo.bulkCreate(codes);

           res.status(201).json({
               message: `${nombreCodes} codes promo générés avec succès`,
               data: codesCreated
           });

       } catch (error) {
           console.error('Erreur génération codes promo:', error);
           res.status(500).json({
               message: 'Erreur lors de la génération des codes promo',
               error: error.message
           });
       }
   }

   // Statistiques d'utilisation des codes promo
   static async getStatsCodesPromo(req, res) {
       try {
           const { idPromotion, dateDebut, dateFin } = req.query;
           
           let whereClause = {};
           let whereUtilisation = {};
           
           if (idPromotion) {
               whereClause.idPromotion = idPromotion;
               whereUtilisation.idPromotion = idPromotion;
           }
           
           if (dateDebut || dateFin) {
               whereUtilisation.createdAt = {};
               if (dateDebut) whereUtilisation.createdAt[Op.gte] = new Date(dateDebut);
               if (dateFin) whereUtilisation.createdAt[Op.lte] = new Date(dateFin);
           }

           // Statistiques générales des codes
           const statsGenerales = await CodePromo.findAll({
               where: whereClause,
               attributes: [
                   [sequelize.fn('COUNT', sequelize.col('idCodePromo')), 'totalCodes'],
                   [sequelize.fn('COUNT', sequelize.literal('CASE WHEN actif = true THEN 1 END')), 'codesActifs'],
                   [sequelize.fn('SUM', sequelize.col('utilisationActuelle')), 'totalUtilisations'],
                   [sequelize.fn('AVG', sequelize.col('utilisationActuelle')), 'utilisationMoyenne']
               ],
               raw: true
           });

           // Top codes les plus utilisés
           const topCodes = await CodePromo.findAll({
               where: {
                   ...whereClause,
                   utilisationActuelle: { [Op.gt]: 0 }
               },
               order: [['utilisationActuelle', 'DESC']],
               limit: 10,
               include: [{
                   model: Promotion,
                   as: 'promotion',
                   attributes: ['nom', 'typePromotion']
               }]
           });

           // Utilisation par période
           const utilisationParPeriode = await PromotionUtilisation.findAll({
               where: {
                   ...whereUtilisation,
                   idCodePromo: { [Op.ne]: null }
               },
               attributes: [
                   [sequelize.fn('DATE', sequelize.col('PromotionUtilisation.createdAt')), 'date'],
                   [sequelize.fn('COUNT', sequelize.col('idUtilisation')), 'utilisations'],
                   [sequelize.fn('SUM', sequelize.col('montantReduction')), 'totalReduction']
               ],
               group: [sequelize.fn('DATE', sequelize.col('PromotionUtilisation.createdAt'))],
               order: [[sequelize.fn('DATE', sequelize.col('PromotionUtilisation.createdAt')), 'ASC']]
           });

           res.status(200).json({
               message: 'Statistiques des codes promo récupérées',
               data: {
                   generales: statsGenerales[0] || {},
                   topCodes,
                   utilisationParPeriode
               }
           });

       } catch (error) {
           console.error('Erreur statistiques codes promo:', error);
           res.status(500).json({
               message: 'Erreur lors de la récupération des statistiques',
               error: error.message
           });
       }
   }

   // Exporter codes promo
   static async exporterCodesPromo(req, res) {
       try {
           const { idPromotion, format = 'json' } = req.query;
           
           const where = {};
           if (idPromotion) where.idPromotion = idPromotion;

           const codes = await CodePromo.findAll({
               where,
               include: [{
                   model: Promotion,
                   as: 'promotion',
                   attributes: ['nom', 'typePromotion', 'valeurPromotion']
               }],
               order: [['createdAt', 'DESC']]
           });

           if (format === 'csv') {
               // Générer CSV
               const csvHeader = 'Code,Promotion,Type,Valeur,Utilisations Max,Utilisations Actuelles,Actif,Date Création\n';
               const csvData = codes.map(code => 
                   `${code.code},${code.promotion.nom},${code.promotion.typePromotion},${code.promotion.valeurPromotion},${code.utilisationMax || 'Illimité'},${code.utilisationActuelle},${code.actif ? 'Oui' : 'Non'},${code.createdAt.toISOString().split('T')[0]}`
               ).join('\n');

               res.setHeader('Content-Type', 'text/csv');
               res.setHeader('Content-Disposition', 'attachment; filename="codes-promo.csv"');
               res.send(csvHeader + csvData);
           } else {
               res.status(200).json({
                   message: 'Codes promo exportés',
                   data: codes
               });
           }

       } catch (error) {
           console.error('Erreur export codes promo:', error);
           res.status(500).json({
               message: 'Erreur lors de l\'export des codes promo',
               error: error.message
           });
       }
   }

   // Activer/désactiver un code promo
   static async toggleCodePromo(req, res) {
       try {
           const codePromo = await CodePromo.findByPk(req.params.id);
           
           if (!codePromo) {
               return res.status(404).json({
                   message: 'Code promo non trouvé'
               });
           }

           await codePromo.update({ actif: !codePromo.actif });

           res.status(200).json({
               message: `Code promo ${codePromo.actif ? 'activé' : 'désactivé'}`,
               data: codePromo
           });

       } catch (error) {
           console.error('Erreur toggle code promo:', error);
           res.status(500).json({
               message: 'Erreur lors de la modification du statut',
               error: error.message
           });
       }
   }

   // Dupliquer des codes promo pour une nouvelle promotion
   static async dupliquerCodesPromo(req, res) {
       try {
           const { idPromotionSource, idPromotionCible, codesIds } = req.body;

           // Vérifier que les promotions existent
           const [promotionSource, promotionCible] = await Promise.all([
               Promotion.findByPk(idPromotionSource),
               Promotion.findByPk(idPromotionCible)
           ]);

           if (!promotionSource || !promotionCible) {
               return res.status(404).json({
                   message: 'Promotion source ou cible non trouvée'
               });
           }

           // Récupérer les codes à dupliquer
           const codesSource = await CodePromo.findAll({
               where: {
                   idCodePromo: { [Op.in]: codesIds },
                   idPromotion: idPromotionSource
               }
           });

           if (codesSource.length === 0) {
               return res.status(404).json({
                   message: 'Aucun code promo trouvé à dupliquer'
               });
           }

           // Créer les nouveaux codes
           const nouveauCodes = codesSource.map(code => ({
               code: `${code.code}_COPY_${Date.now()}`,
               idPromotion: idPromotionCible,
               utilisationMax: code.utilisationMax,
               actif: code.actif
           }));

           const codesCrees = await CodePromo.bulkCreate(nouveauCodes);

           res.status(201).json({
               message: `${codesCrees.length} codes promo dupliqués avec succès`,
               data: codesCrees
           });

       } catch (error) {
           console.error('Erreur duplication codes promo:', error);
           res.status(500).json({
               message: 'Erreur lors de la duplication des codes promo',
               error: error.message
           });
       }
   }
}

module.exports = CodePromoController;