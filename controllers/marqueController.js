const { Marque, Produit } = require('../models');
const upload = require('../multerConfig');
const path = require('path');
const fs = require('fs').promises;

class MarqueController {
  static uploadLogo = upload.single('logo');

  static async createMarque(req, res, next) {
    MarqueController.uploadLogo(req, res, async (err) => {
      if (err) {
        const error = new Error('Erreur lors du téléchargement du logo');
        error.code = "VALIDATION_ERROR";
        return next(error);
      }
      try {
        const { nom, description } = req.body;
        const logoUrl = req.file ? `/uploads/${req.file.filename}` : null;
        const marque = await Marque.create({ nom, description, logoUrl });
        res.status(201).json({ message: 'Marque créée avec succès', data: marque });
      } catch (error) {
        next(error);
      }
    });
  }

  static async getAllMarques(req, res, next) {
    try {
      const marques = await Marque.findAll({
        include: [{
          model: Produit,
          as: 'produits',
          attributes: ['idProduit', 'nom', 'prix'],
        }],
      });
      res.status(200).json(marques);
    } catch (error) {
      next(error);
    }
  }

  static async getMarqueById(req, res, next) {
    try {
      const marque = await Marque.findByPk(req.params.id, {
        include: [{
          model: Produit,
          as: 'produits',
          attributes: ['idProduit', 'nom', 'prix'],
        }],
      });
      if (!marque) {
        const error = new Error('Marque non trouvée');
        error.code = "NOT_FOUND";
        return next(error);
      }
      res.status(200).json(marque);
    } catch (error) {
      next(error);
    }
  }

  static async updateMarque(req, res, next) {
    MarqueController.uploadLogo(req, res, async (err) => {
      if (err) {
        const error = new Error('Erreur lors du téléchargement du logo');
        error.code = "VALIDATION_ERROR";
        return next(error);
      }
      try {
        const marque = await Marque.findByPk(req.params.id);
        if (!marque) {
          const error = new Error('Marque non trouvée');
          error.code = "NOT_FOUND";
          return next(error);
        }
        const oldLogoUrl = marque.logoUrl;
        const { nom, description } = req.body;
        const logoUrl = req.file ? `/uploads/${req.file.filename}` : marque.logoUrl;
        const updatedMarque = await marque.update({ nom, description, logoUrl });

        // Delete old logo if a new one was uploaded
        if (req.file && oldLogoUrl) {
          const oldLogoPath = path.join(__dirname, '..', oldLogoUrl);
          try {
            await fs.unlink(oldLogoPath);
          } catch (err) {}
        }
        res.status(200).json({ message: 'Marque mise à jour avec succès', data: updatedMarque });
      } catch (error) {
        next(error);
      }
    });
  }

  static async deleteMarque(req, res, next) {
    try {
      const marque = await Marque.findByPk(req.params.id);
      if (!marque) {
        const error = new Error('Marque non trouvée');
        error.code = "NOT_FOUND";
        return next(error);
      }
      const logoUrl = marque.logoUrl;
      await marque.destroy();
      // Delete logo file if it exists
      if (logoUrl) {
        const logoPath = path.join(__dirname, '..', logoUrl);
        try {
          await fs.unlink(logoPath);
        } catch (err) {}
      }
      res.status(200).json({ message: 'Marque supprimée avec succès' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MarqueController;