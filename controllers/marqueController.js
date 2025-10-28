const { Marque, Produit } = require('../models');
const upload = require('../multerConfig');
const { cloudinary } = require('../config/cloudinary'); // ✅ NOUVEAU

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
        
        // ✅ MODIFIÉ : Utiliser Cloudinary URL
        const logoUrl = req.file ? req.file.path : null;
        const logoPublicId = req.file ? req.file.filename : null;
        
        const marque = await Marque.create({ 
          nom, 
          description, 
          logoUrl,
          logoPublicId // ✅ NOUVEAU : Sauvegarder le publicId
        });
        
        res.status(201).json({ message: 'Marque créée avec succès', data: marque });
      } catch (error) {
        // ✅ NOUVEAU : En cas d'erreur, supprimer le logo de Cloudinary
        if (req.file) {
          try {
            await cloudinary.uploader.destroy(req.file.filename);
          } catch (deleteErr) {
            console.error('Erreur suppression logo Cloudinary:', deleteErr);
          }
        }
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
    // ✅ AJOUTER le wrapper "data" pour être cohérent avec create/update
    res.status(200).json({ data: marque });
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
        
        const oldLogoPublicId = marque.logoPublicId;
        const { nom, description } = req.body;
        
        // ✅ MODIFIÉ : Utiliser Cloudinary URL
        const logoUrl = req.file ? req.file.path : marque.logoUrl;
        const logoPublicId = req.file ? req.file.filename : marque.logoPublicId;
        
        const updatedMarque = await marque.update({ 
          nom, 
          description, 
          logoUrl,
          logoPublicId 
        });

        // ✅ MODIFIÉ : Supprimer l'ancien logo de Cloudinary
        if (req.file && oldLogoPublicId) {
          try {
            await cloudinary.uploader.destroy(oldLogoPublicId);
          } catch (cloudErr) {
            console.error('Erreur suppression ancien logo Cloudinary:', cloudErr);
          }
        }
        
        res.status(200).json({ message: 'Marque mise à jour avec succès', data: updatedMarque });
      } catch (error) {
        // ✅ NOUVEAU : En cas d'erreur, supprimer le nouveau logo uploadé
        if (req.file) {
          try {
            await cloudinary.uploader.destroy(req.file.filename);
          } catch (deleteErr) {
            console.error('Erreur suppression logo Cloudinary:', deleteErr);
          }
        }
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
      
      const logoPublicId = marque.logoPublicId;
      
      await marque.destroy();
      
      // ✅ MODIFIÉ : Supprimer le logo de Cloudinary
      if (logoPublicId) {
        try {
          await cloudinary.uploader.destroy(logoPublicId);
        } catch (cloudErr) {
          console.error('Erreur suppression logo Cloudinary:', cloudErr);
        }
      }
      
      res.status(200).json({ message: 'Marque supprimée avec succès' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MarqueController;