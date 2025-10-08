const { Age } = require('../models');
const validator = require('validator');

function validateAge({ minAge, maxAge, typeAge, label }) {
  if (!validator.isInt(minAge + '', { min: 0, max: 100 })) return "Âge minimum invalide";
  if (!validator.isInt(maxAge + '', { min: 0, max: 100 })) return "Âge maximum invalide";
  if (parseInt(minAge) >= parseInt(maxAge)) return "Âge minimum doit être inférieur à l'âge maximum";
  if (typeAge !== 'mois' && typeAge !== 'ans') return "Type d'âge invalide";
  if (!validator.isLength(label, { min: 2, max: 50 })) return "Label doit être entre 2 et 50 caractères";
  if (!validator.matches(label, /^[A-Za-zÀ-ÿ0-9\s\-]+$/)) return "Label contient des caractères invalides";
  return null;
}

class AgeController {
  async create(req, res, next) {
    try {
      let { minAge, maxAge, typeAge, label } = req.body;
      label = validator.escape(label);

      const errorMsg = validateAge({ minAge, maxAge, typeAge, label });
      if (errorMsg) {
        const error = new Error(errorMsg);
        error.code = "VALIDATION_ERROR";
        return next(error);
      }

      const age = await Age.create({ minAge, maxAge, typeAge, label });
      res.status(201).json(age);
    } catch (err) {
      next(err);
    }
  }
  async getAll(req, res, next) {
    try {
      const ages = await Age.findAll();
      res.status(200).json(ages);
    } catch (err) {
      next(err);
    }
  }
  async getById(req, res, next) {
    try {
      const age = await Age.findByPk(req.params.id);
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
      let { minAge, maxAge, typeAge, label } = req.body;
      label = validator.escape(label);

      const errorMsg = validateAge({ minAge, maxAge, typeAge, label });
      if (errorMsg) {
        const error = new Error(errorMsg);
        error.code = "VALIDATION_ERROR";
        return next(error);
      }

      await age.update({ minAge, maxAge, typeAge, label });
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
      await age.destroy();
      res.status(200).json({ message: "Tranche d'âge supprimée" });
    } catch (err) {
      next(err);
    }
  }
}
module.exports = new AgeController();