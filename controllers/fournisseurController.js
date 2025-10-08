const { Fournisseur } = require('../models');

class FournisseurController {
  static async createFournisseur(req, res, next) {
    try {
      const { prenom, nom, email, telephone } = req.body;
      const fournisseur = await Fournisseur.create({
        prenom,
        nom,
        email,
        telephone,
      });
      res.status(201).json({
        message: 'Fournisseur créé avec succès',
        data: fournisseur,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllFournisseurs(req, res, next) {
    try {
      const fournisseurs = await Fournisseur.findAll();
      res.status(200).json(fournisseurs);
    } catch (error) {
      next(error);
    }
  }

  static async getFournisseurById(req, res, next) {
    try {
      const fournisseur = await Fournisseur.findByPk(req.params.id);
      if (!fournisseur) {
        const error = new Error('Fournisseur non trouvé');
        error.code = "NOT_FOUND";
        return next(error);
      }
      res.status(200).json(fournisseur);
    } catch (error) {
      next(error);
    }
  }

  static async updateFournisseur(req, res, next) {
    try {
      const fournisseur = await Fournisseur.findByPk(req.params.id);
      if (!fournisseur) {
        const error = new Error('Fournisseur non trouvé');
        error.code = "NOT_FOUND";
        return next(error);
      }
      const { prenom, nom, email, telephone } = req.body;
      const updatedFournisseur = await fournisseur.update({ prenom, nom, email, telephone });
      res.status(200).json({ 
        message: 'Fournisseur mis à jour avec succès', 
        data: updatedFournisseur 
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteFournisseur(req, res, next) {
    try {
      const fournisseur = await Fournisseur.findByPk(req.params.id);
      if (!fournisseur) {
        const error = new Error('Fournisseur non trouvé');
        error.code = "NOT_FOUND";
        return next(error);
      }
      await fournisseur.destroy();
      res.status(200).json({ message: 'Fournisseur supprimé avec succès' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FournisseurController;