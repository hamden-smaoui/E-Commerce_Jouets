const { Taille } = require('../models');
class TailleController {
  async create(req, res, next) {
    try {
      const { nom } = req.body;
      const taille = await Taille.create({ nom });
      res.status(201).json(taille);
    } catch (error) {
      error.message = "Erreur création taille : " + error.message;
      error.code = "VALIDATION_ERROR";
      next(error);
    }
  }
  async getAll(req, res, next) {
    try {
      const tailles = await Taille.findAll();
      res.status(200).json(tailles);
    } catch (error) {
      error.message = "Erreur récupération tailles : " + error.message;
      error.code = "FETCH_ERROR";
      next(error);
    }
  }
  async getById(req, res, next) {
    try {
      const taille = await Taille.findByPk(req.params.id);
      if (!taille) {
        const error = new Error("Taille non trouvée");
        error.code = "NOT_FOUND";
        return next(error);
      }
      res.status(200).json(taille);
    } catch (error) {
      error.message = "Erreur récupération taille : " + error.message;
      error.code = "FETCH_ERROR";
      next(error);
    }
  }
  async edit(req, res, next) {
    try {
      const taille = await Taille.findByPk(req.params.id);
      if (!taille) {
        const error = new Error("Taille non trouvée");
        error.code = "NOT_FOUND";
        return next(error);
      }
      await taille.update({ nom: req.body.nom });
      res.status(200).json(taille);
    } catch (error) {
      error.message = "Erreur modification taille : " + error.message;
      error.code = "UPDATE_ERROR";
      next(error);
    }
  }
  async delete(req, res, next) {
    try {
      const taille = await Taille.findByPk(req.params.id);
      if (!taille) {
        const error = new Error("Taille non trouvée");
        error.code = "NOT_FOUND";
        return next(error);
      }
      await taille.destroy();
      res.status(200).json({ message: "Taille supprimée" });
    } catch (error) {
      error.message = "Erreur suppression taille : " + error.message;
      error.code = "DELETE_ERROR";
      next(error);
    }
  }
}
module.exports = new TailleController();