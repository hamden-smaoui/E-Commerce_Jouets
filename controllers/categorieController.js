const { Categorie, Type, CategorieType, Produit } = require('../models');

class CategorieController {
    async createCategorie(req, res, next) {
        try {
            const { nom, description, typeIds = [] } = req.body;
            const categorie = await Categorie.create({ nom, description });
            if (typeIds.length > 0) await categorie.addTypes(typeIds);

            res.status(201).json({
                message: 'Catégorie créée avec succès',
                data: categorie
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllCategories(req, res, next) {
        try {
            const categories = await Categorie.findAll({
                include: [
                    {
                        model: Produit,
                        as: 'produits',
                        attributes: ['idProduit', 'nom', 'prix']
                    },
                    {
                        model: Type,
                        as: 'types',
                        attributes: ['idType', 'nom','description'],
                        through: { attributes: [] }
                    }
                ]
            });
            res.status(200).json(categories);
        } catch (error) {
            next(error);
        }
    }

    async getCategorieById(req, res, next) {
        try {
            const categorie = await Categorie.findByPk(req.params.id, {
                include: [
                    {
                        model: Produit,
                        as: 'produits',
                        attributes: ['idProduit', 'nom', 'prix']
                    },
                    {
                        model: Type,
                        as: 'types',
                        attributes: ['idType', 'nom','description'],
                        through: { attributes: [] }
                    }
                ]
            });
            if (!categorie) {
                const error = new Error('Catégorie non trouvée');
                error.code = "NOT_FOUND";
                return next(error);
            }
            res.status(200).json(categorie);
        } catch (error) {
            next(error);
        }
    }

    async updateCategorie(req, res, next) {
        try {
            const { nom, description, typeIds = [] } = req.body;
            const categorie = await Categorie.findByPk(req.params.id);
            if (!categorie) {
                const error = new Error('Catégorie non trouvée');
                error.code = "NOT_FOUND";
                return next(error);
            }
            await categorie.update({ nom, description });
            await categorie.setTypes(typeIds);

            res.status(200).json({
                message: 'Catégorie mise à jour avec succès',
                data: categorie
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteCategorie(req, res, next) {
        try {
            const categorie = await Categorie.findByPk(req.params.id);
            if (!categorie) {
                const error = new Error('Catégorie non trouvée');
                error.code = "NOT_FOUND";
                return next(error);
            }
            await CategorieType.destroy({ where: { idCategorie: req.params.id } });
            await categorie.destroy();
            res.status(200).json({ message: 'Catégorie supprimée avec succès' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CategorieController();