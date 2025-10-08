const { CodePromo, PromotionUtilisation } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

class CodePromoController {
    static async createCodePromo(req, res, next) {
        try {
            const { code, valeurPourcentage, utilisationMax, actif = true } = req.body;
            const codeExistant = await CodePromo.findOne({ where: { code: code.toUpperCase() } });
            if (codeExistant) {
                const error = new Error('Ce code promo existe déjà');
                error.code = "VALIDATION_ERROR";
                return next(error);
            }
            const codePromo = await CodePromo.create({
                code: code.toUpperCase(),
                valeurPourcentage,
                utilisationMax,
                actif
            });
            res.status(201).json({
                message: 'Code promo créé avec succès',
                data: codePromo
            });
        } catch (error) {
            next(error);
        }
    }

    static async getAllCodesPromo(req, res, next) {
        try {
            const { page = 1, limit = 10, actif, search } = req.query;
            const where = {};
            if (actif !== undefined) where.actif = actif === 'true';
            if (search) where.code = { [Op.like]: `%${search.toUpperCase()}%` };
            const offset = (page - 1) * limit;

            const { count, rows: codesPromo } = await CodePromo.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset,
                order: [['createdAt', 'DESC']]
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
            next(error);
        }
    }

    static async getCodePromoById(req, res, next) {
        try {
            const codePromo = await CodePromo.findByPk(req.params.id);
            if (!codePromo) {
                const error = new Error('Code promo non trouvé');
                error.code = "NOT_FOUND";
                return next(error);
            }
            res.status(200).json({
                message: 'Code promo récupéré avec succès',
                data: codePromo
            });
        } catch (error) {
            next(error);
        }
    }

    static async validerCode(req, res, next) {
        try {
            const { code } = req.params;
            const codePromo = await CodePromo.findOne({
                where: { code: code.toUpperCase(), actif: true }
            });
            if (!codePromo) {
                const error = new Error('Code promo invalide ou expiré');
                error.code = "VALIDATION_ERROR";
                return next(error);
            }
            if (codePromo.utilisationMax && codePromo.utilisationActuelle >= codePromo.utilisationMax) {
                const error = new Error('Code promo épuisé');
                error.code = "VALIDATION_ERROR";
                return next(error);
            }
            res.status(200).json({
                message: 'Code promo valide',
                valide: true,
                data: {
                    codePromo: codePromo.code,
                    valeurPourcentage: codePromo.valeurPourcentage
                }
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateCodePromo(req, res, next) {
        try {
            const codePromo = await CodePromo.findByPk(req.params.id);
            if (!codePromo) {
                const error = new Error('Code promo non trouvé');
                error.code = "NOT_FOUND";
                return next(error);
            }
            const { code, valeurPourcentage, utilisationMax, actif } = req.body;
            if (code && code.toUpperCase() !== codePromo.code) {
                const codeExistant = await CodePromo.findOne({
                    where: { code: code.toUpperCase(), idCodePromo: { [Op.ne]: codePromo.idCodePromo } }
                });
                if (codeExistant) {
                    const error = new Error('Ce code promo existe déjà');
                    error.code = "VALIDATION_ERROR";
                    return next(error);
                }
            }
            await codePromo.update({
                code: code ? code.toUpperCase() : codePromo.code,
                valeurPourcentage: valeurPourcentage !== undefined ? valeurPourcentage : codePromo.valeurPourcentage,
                utilisationMax: utilisationMax !== undefined ? utilisationMax : codePromo.utilisationMax,
                actif: actif !== undefined ? actif : codePromo.actif
            });
            res.status(200).json({
                message: 'Code promo mis à jour avec succès',
                data: codePromo
            });
        } catch (error) {
            next(error);
        }
    }

    static async deleteCodePromo(req, res, next) {
        try {
            const codePromo = await CodePromo.findByPk(req.params.id);
            if (!codePromo) {
                const error = new Error('Code promo non trouvé');
                error.code = "NOT_FOUND";
                return next(error);
            }
            const utilisations = await PromotionUtilisation.count({
                where: { idCodePromo: codePromo.idCodePromo }
            });
            if (utilisations > 0) {
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
            next(error);
        }
    }

    static async genererCodesPromo(req, res, next) {
        try {
            const { nombreCodes, prefixe = 'PROMO', longueur = 8, valeurPourcentage, utilisationMax = 1 } = req.body;
            const codes = [];
            const codesExistants = new Set();
            const codesDB = await CodePromo.findAll({ attributes: ['code'] });
            codesDB.forEach(c => codesExistants.add(c.code));

            for (let i = 0; i < nombreCodes; i++) {
                let nouveauCode;
                let tentatives = 0;
                do {
                    const suffixe = Math.random().toString(36).substring(2, longueur).toUpperCase();
                    nouveauCode = `${prefixe}${suffixe}`;
                    tentatives++;
                    if (tentatives > 100) throw new Error('Impossible de générer des codes uniques');
                } while (codesExistants.has(nouveauCode));

                codes.push({
                    code: nouveauCode,
                    valeurPourcentage,
                    utilisationMax,
                    actif: true
                });
                codesExistants.add(nouveauCode);
            }

            const codesCreated = await CodePromo.bulkCreate(codes);
            res.status(201).json({
                message: `${nombreCodes} codes promo générés avec succès`,
                data: codesCreated
            });
        } catch (error) {
            next(error);
        }
    }

    static async getStatsCodesPromo(req, res, next) {
        try {
            const { dateDebut, dateFin } = req.query;
            let whereUtilisation = {};
            if (dateDebut || dateFin) {
                whereUtilisation.createdAt = {};
                if (dateDebut) whereUtilisation.createdAt[Op.gte] = new Date(dateDebut);
                if (dateFin) whereUtilisation.createdAt[Op.lte] = new Date(dateFin);
            }
            const statsGenerales = await CodePromo.findAll({
                attributes: [
                    [sequelize.fn('COUNT', sequelize.col('idCodePromo')), 'totalCodes'],
                    [sequelize.fn('COUNT', sequelize.literal('CASE WHEN actif = true THEN 1 END')), 'codesActifs'],
                    [sequelize.fn('SUM', sequelize.col('utilisationActuelle')), 'totalUtilisations'],
                    [sequelize.fn('AVG', sequelize.col('utilisationActuelle')), 'utilisationMoyenne']
                ],
                raw: true
            });
            const topCodes = await CodePromo.findAll({
                where: { utilisationActuelle: { [Op.gt]: 0 } },
                order: [['utilisationActuelle', 'DESC']],
                limit: 10
            });
            const utilisationParPeriode = await PromotionUtilisation.findAll({
                where: { ...whereUtilisation, idCodePromo: { [Op.ne]: null } },
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
            next(error);
        }
    }

    static async exporterCodesPromo(req, res, next) {
        try {
            const { format = 'json' } = req.query;
            const codes = await CodePromo.findAll({ order: [['createdAt', 'DESC']] });
            if (format === 'csv') {
                const csvHeader = 'Code,Pourcentage,Utilisations Max,Utilisations Actuelles,Actif,Date Création\n';
                const csvData = codes.map(code => 
                    `${code.code},${code.valeurPourcentage},${code.utilisationMax || 'Illimité'},${code.utilisationActuelle},${code.actif ? 'Oui' : 'Non'},${code.createdAt.toISOString().split('T')[0]}`
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
            next(error);
        }
    }

    static async toggleCodePromo(req, res, next) {
        try {
            const codePromo = await CodePromo.findByPk(req.params.id);
            if (!codePromo) {
                const error = new Error('Code promo non trouvé');
                error.code = "NOT_FOUND";
                return next(error);
            }
            await codePromo.update({ actif: !codePromo.actif });
            res.status(200).json({
                message: `Code promo ${codePromo.actif ? 'activé' : 'désactivé'}`,
                data: codePromo
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = CodePromoController;