const { Couleur } = require('../models');
class CouleurController {
  async create(req, res, next) {
    try {
      const { nom } = req.body;
      const couleur = await Couleur.create({ nom });
      res.status(201).json(couleur);
    } catch (err) {
      next(err);
    }
  }
  async getAll(req, res, next) {
    try {
      const couleurs = await Couleur.findAll();
      res.status(200).json(couleurs);
    } catch (err) {
      next(err);
    }
  }
  async getById(req, res, next) {
    try {
      const couleur = await Couleur.findByPk(req.params.id);
      if (!couleur) {
        const error = new Error("Couleur non trouvée");
        error.code = "NOT_FOUND";
        return next(error);
      }
      res.status(200).json(couleur);
    } catch (err) {
      next(err);
    }
  }
  async edit(req, res, next) {
    try {
      const couleur = await Couleur.findByPk(req.params.id);
      if (!couleur) {
        const error = new Error("Couleur non trouvée");
        error.code = "NOT_FOUND";
        return next(error);
      }
      await couleur.update({ nom: req.body.nom });
      res.status(200).json(couleur);
    } catch (err) {
      next(err);
    }
  }
  async delete(req, res, next) {
    try {
      const couleur = await Couleur.findByPk(req.params.id);
      if (!couleur) {
        const error = new Error("Couleur non trouvée");
        error.code = "NOT_FOUND";
        return next(error);
      }
      await couleur.destroy();
      res.status(200).json({ message: "Couleur supprimée" });
    } catch (err) {
      next(err);
    }
  }
}
module.exports = new CouleurController();