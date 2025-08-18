const { Categorie, Type, CategorieType, Produit } = require('../models');

class CategorieController {
    async createCategorie(req, res) {
        try {
            const { nom, description, typeIds = [] } = req.body;
            const categorie = await Categorie.create({ nom, description });
            
            // Associer les types si fournis
            if (typeIds.length > 0) {
                await categorie.addTypes(typeIds);
            }

            res.status(201).json({
                message: 'Catégorie créée avec succès',
                data: categorie
            });
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la création de la catégorie',
                error: error.message
            });
        }
    }

    async getAllCategories(req, res) {
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
                        attributes: ['idType', 'nom'],
                        through: { attributes: [] } // Exclure les attributs de la table de jonction
                    }
                ]
            });
            res.status(200).json(categories);
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la récupération des catégories',
                error: error.message
            });
        }
    }

    async getCategorieById(req, res) {
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
                        attributes: ['idType', 'nom'],
                        through: { attributes: [] }
                    }
                ]
            });
            if (!categorie) {
                return res.status(404).json({ message: 'Catégorie non trouvée' });
            }
            res.status(200).json(categorie);
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la récupération de la catégorie',
                error: error.message
            });
        }
    }

    async updateCategorie(req, res) {
        try {
            const { nom, description, typeIds = [] } = req.body;
            const categorie = await Categorie.findByPk(req.params.id);
            if (!categorie) {
                return res.status(404).json({ message: 'Catégorie non trouvée' });
            }
            await categorie.update({ nom, description });
            
            // Mettre à jour les associations avec les types
            await categorie.setTypes(typeIds);

            res.status(200).json({
                message: 'Catégorie mise à jour avec succès',
                data: categorie
            });
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la mise à jour de la catégorie',
                error: error.message
            });
        }
    }

    async deleteCategorie(req, res) {
        try {
            const categorie = await Categorie.findByPk(req.params.id);
            if (!categorie) {
                return res.status(404).json({ message: 'Catégorie non trouvée' });
            }
            // Supprimer les associations dans la table de jonction
            await CategorieType.destroy({ where: { idCategorie: req.params.id } });
            await categorie.destroy();
            res.status(200).json({ message: 'Catégorie supprimée avec succès' });
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la suppression de la catégorie',
                error: error.message
            });
        }
    }
}

module.exports = new CategorieController();