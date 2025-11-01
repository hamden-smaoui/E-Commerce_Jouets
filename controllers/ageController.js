const { Age, Produit,Categorie, Marque,Image} = require('../models');
const validator = require('validator');

function validateAge({ minAge, maxAge, minTypeAge, maxTypeAge, label }) {
  // Validation des âges
  if (!validator.isInt(minAge + '', { min: 0, max: 100 })) {
    return "Âge minimum invalide";
  }
  if (!validator.isInt(maxAge + '', { min: 0, max: 100 })) {
    return "Âge maximum invalide";
  }

  // Validation des types d'âge
  if (minTypeAge !== 'mois' && minTypeAge !== 'ans') {
    return "Type d'âge minimum invalide (doit être 'mois' ou 'ans')";
  }
  if (maxTypeAge !== 'mois' && maxTypeAge !== 'ans') {
    return "Type d'âge maximum invalide (doit être 'mois' ou 'ans')";
  }

  // Validation de la cohérence des âges
  // Convertir tout en mois pour comparer
  const minAgeInMonths = minTypeAge === 'ans' ? parseInt(minAge) * 12 : parseInt(minAge);
  const maxAgeInMonths = maxTypeAge === 'ans' ? parseInt(maxAge) * 12 : parseInt(maxAge);

  if (minAgeInMonths >= maxAgeInMonths) {
    return "L'âge minimum doit être inférieur à l'âge maximum";
  }

  // Validation du label
  if (!validator.isLength(label, { min: 2, max: 50 })) {
    return "Label doit être entre 2 et 50 caractères";
  }
  if (!validator.matches(label, /^[A-Za-zÀ-ÿ0-9\s\-]+$/)) {
    return "Label contient des caractères invalides";
  }

  return null;
}

class AgeController {
  async create(req, res, next) {
    try {
      let { minAge, maxAge, minTypeAge, maxTypeAge, label } = req.body;
      label = validator.escape(label);

      const errorMsg = validateAge({ minAge, maxAge, minTypeAge, maxTypeAge, label });
      if (errorMsg) {
        const error = new Error(errorMsg);
        error.code = "VALIDATION_ERROR";
        return next(error);
      }

      // Vérifier si le label existe déjà
      const existingAge = await Age.findOne({ where: { label } });
      if (existingAge) {
        const error = new Error("Une tranche d'âge avec ce label existe déjà");
        error.code = "DUPLICATE_ENTRY";
        return next(error);
      }

      const age = await Age.create({ minAge, maxAge, minTypeAge, maxTypeAge, label });
      res.status(201).json(age);
    } catch (err) {
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const ages = await Age.findAll({
        order: [
          ['minTypeAge', 'ASC'], // mois avant ans
          ['minAge', 'ASC']      // ordre croissant
        ]
      });
      res.status(200).json(ages);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const age = await Age.findByPk(req.params.id, {
        include: [{
          model: Produit,
          as: 'produits',
          attributes: ['idProduit', 'nom', 'prix', 'quantiteStock']
        }]
      });

      if (!age) {
        const error = new Error("Tranche d'âge non trouvée");
        error.code = "NOT_FOUND";
        return next(error);
      }

      res.status(200).json(age);
    } catch (err) {
      next(err);
    }
  }

  async edit(req, res, next) {
    try {
      const age = await Age.findByPk(req.params.id);
      if (!age) {
        const error = new Error("Tranche d'âge non trouvée");
        error.code = "NOT_FOUND";
        return next(error);
      }

      let { minAge, maxAge, minTypeAge, maxTypeAge, label } = req.body;
      label = validator.escape(label);

      const errorMsg = validateAge({ minAge, maxAge, minTypeAge, maxTypeAge, label });
      if (errorMsg) {
        const error = new Error(errorMsg);
        error.code = "VALIDATION_ERROR";
        return next(error);
      }

      // Vérifier si le label existe déjà (sauf pour l'élément actuel)
      const existingAge = await Age.findOne({ 
        where: { 
          label,
          idAge: { [require('sequelize').Op.ne]: req.params.id }
        } 
      });
      if (existingAge) {
        const error = new Error("Une tranche d'âge avec ce label existe déjà");
        error.code = "DUPLICATE_ENTRY";
        return next(error);
      }

      await age.update({ minAge, maxAge, minTypeAge, maxTypeAge, label });
      res.status(200).json(age);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const age = await Age.findByPk(req.params.id);
      if (!age) {
        const error = new Error("Tranche d'âge non trouvée");
        error.code = "NOT_FOUND";
        return next(error);
      }

      // Vérifier si des produits utilisent cette tranche d'âge
      const produitsCount = await Produit.count({ where: { idAge: req.params.id } });
      if (produitsCount > 0) {
        const error = new Error(
          `Impossible de supprimer cette tranche d'âge car ${produitsCount} produit(s) l'utilisent`
        );
        error.code = "CONSTRAINT_ERROR";
        return next(error);
      }

      await age.destroy();
      res.status(200).json({ message: "Tranche d'âge supprimée avec succès" });
    } catch (err) {
      next(err);
    }
  }

  // Nouvelle méthode pour obtenir les produits d'une tranche d'âge
  async getProductsByAge(req, res, next) {
    try {
      const age = await Age.findByPk(req.params.id);
      if (!age) {
        const error = new Error("Tranche d'âge non trouvée");
        error.code = "NOT_FOUND";
        return next(error);
      }

      const produits = await Produit.findAll({
        where: { idAge: req.params.id },
        include: [
          { model: Categorie, as: 'categorie' },
          { model: Marque, as: 'marque' },
          { model: Image, as: 'images' }
        ]
      });

      res.status(200).json({
        age: age,
        produits: produits,
        total: produits.length
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AgeController();