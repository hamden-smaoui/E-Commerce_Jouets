const { Type, Categorie, CategorieType, Produit } = require('../models');

class TypeController {
    async createType(req, res) {
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
            res.status(500).json({
                message: 'Erreur lors de la création du type',
                error: error.message
            });
        }
    }

    async getAllTypes(req, res) {
        try {
            const types = await Type.findAll({
                include: [{
                    model: Categorie,
                    as: 'categories',
                    attributes: ['idCategorie', 'nom'],
                    through: { attributes: [] } // Exclure les attributs de la table de jonction
                }]
            });
            res.status(200).json(types);
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la récupération des types',
                error: error.message
            });
        }
    }

    async getTypeById(req, res) {
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
                return res.status(404).json({ message: 'Type non trouvé' });
            }
            res.status(200).json(type);
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la récupération du type',
                error: error.message
            });
        }
    }

    async updateType(req, res) {
        try {
            const { nom, description, categorieIds = [] } = req.body;
            const type = await Type.findByPk(req.params.id);
            if (!type) {
                return res.status(404).json({ message: 'Type non trouvé' });
            }
            await type.update({ nom, description });
            
            // Mettre à jour les associations avec les catégories
            await type.setCategories(categorieIds);

            res.status(200).json({
                message: 'Type mis à jour avec succès',
                data: type
            });
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la mise à jour du type',
                error: error.message
            });
        }
    }

    async deleteType(req, res) {
        try {
            const type = await Type.findByPk(req.params.id);
            if (!type) {
                return res.status(404).json({ message: 'Type non trouvé' });
            }
            // Supprimer les associations dans la table de jonction
            await CategorieType.destroy({ where: { idType: req.params.id } });
            await type.destroy();
            res.status(200).json({ message: 'Type supprimé avec succès' });
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la suppression du type',
                error: error.message
            });
        }
    }
}

module.exports = new TypeController();