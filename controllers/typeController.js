const { Type, Categorie, CategorieType } = require('../models');

class TypeController {
    async createType(req, res, next) {
        try {
            const { nom, description, categorieIds = [] } = req.body;
            const type = await Type.create({ nom, description });
            
            // Associer les catégories si fournies
            if (categorieIds.length > 0) {
                await type.addCategories(categorieIds);
            }

            res.status(201).json({
                message: 'Type créé avec succès',
                data: type
            });
        } catch (error) {
            error.message = 'Erreur lors de la création du type : ' + error.message;
            error.code = "VALIDATION_ERROR";
            next(error);
        }
    }

    async getAllTypes(req, res, next) {
        try {
            const types = await Type.findAll({
                include: [{
                    model: Categorie,
                    as: 'categories',
                    attributes: ['idCategorie', 'nom'],
                    through: { attributes: [] }
                }]
            });
            res.status(200).json(types);
        } catch (error) {
            error.message = 'Erreur lors de la récupération des types : ' + error.message;
            error.code = "FETCH_ERROR";
            next(error);
        }
    }

    async getTypeById(req, res, next) {
        try {
            const type = await Type.findByPk(req.params.id, {
                include: [{
                    model: Categorie,
                    as: 'categories',
                    attributes: ['idCategorie', 'nom'],
                    through: { attributes: [] }
                }]
            });
            if (!type) {
                const error = new Error('Type non trouvé');
                error.code = "NOT_FOUND";
                return next(error);
            }
            res.status(200).json(type);
        } catch (error) {
            error.message = 'Erreur lors de la récupération du type : ' + error.message;
            error.code = "FETCH_ERROR";
            next(error);
        }
    }

    async updateType(req, res, next) {
        try {
            const { nom, description, categorieIds = [] } = req.body;
            const type = await Type.findByPk(req.params.id);
            if (!type) {
                const error = new Error('Type non trouvé');
                error.code = "NOT_FOUND";
                return next(error);
            }
            await type.update({ nom, description });
            await type.setCategories(categorieIds);

            res.status(200).json({
                message: 'Type mis à jour avec succès',
                data: type
            });
        } catch (error) {
            error.message = 'Erreur lors de la mise à jour du type : ' + error.message;
            error.code = "UPDATE_ERROR";
            next(error);
        }
    }

    async deleteType(req, res, next) {
        try {
            const type = await Type.findByPk(req.params.id);
            if (!type) {
                const error = new Error('Type non trouvé');
                error.code = "NOT_FOUND";
                return next(error);
            }
            await CategorieType.destroy({ where: { idType: req.params.id } });
            await type.destroy();
            res.status(200).json({ message: 'Type supprimé avec succès' });
        } catch (error) {
            error.message = 'Erreur lors de la suppression du type : ' + error.message;
            error.code = "DELETE_ERROR";
            next(error);
        }
    }
}

module.exports = new TypeController();