const { Couleur } = require('../models');

class CouleurController {
 
  async create(req, res, next) {
    try {
      const { nom, ref } = req.body;

      // Validation
      if (!nom || nom.trim() === '') {
        const error = new Error("Le nom de la couleur est requis");
        error.code = "VALIDATION_ERROR";
        return next(error);
      }

      // Vérifier si la référence existe déjà (si fournie)
      if (ref) {
        const existingRef = await Couleur.findOne({ where: { ref } });
        if (existingRef) {
          const error = new Error("Cette référence de couleur existe déjà");
          error.code = "DUPLICATE_REF";
          return next(error);
        }
      }

      const couleur = await Couleur.create({ 
        nom: nom.trim(),
        ref: ref ? ref.trim() : null 
      });

      res.status(201).json(couleur);
    } catch (err) {
      next(err);
    }
  }

  
  async getAll(req, res, next) {
    try {
      const couleurs = await Couleur.findAll({
        order: [['nom', 'ASC']]
      });
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
      const { nom, ref } = req.body;
      
      const couleur = await Couleur.findByPk(req.params.id);
      
      if (!couleur) {
        const error = new Error("Couleur non trouvée");
        error.code = "NOT_FOUND";
        return next(error);
      }

      // Validation
      if (nom !== undefined && (!nom || nom.trim() === '')) {
        const error = new Error("Le nom de la couleur ne peut pas être vide");
        error.code = "VALIDATION_ERROR";
        return next(error);
      }

      // Vérifier si la nouvelle référence existe déjà (si modifiée)
      if (ref && ref !== couleur.ref) {
        const existingRef = await Couleur.findOne({ 
          where: { ref } 
        });
        
        if (existingRef && existingRef.idCouleur !== couleur.idCouleur) {
          const error = new Error("Cette référence de couleur existe déjà");
          error.code = "DUPLICATE_REF";
          return next(error);
        }
      }

      // Mise à jour
      const updateData = {};
      if (nom !== undefined) updateData.nom = nom.trim();
      if (ref !== undefined) updateData.ref = ref ? ref.trim() : null;

      await couleur.update(updateData);
      
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
      
      res.status(200).json({ 
        message: "Couleur supprimée avec succès",
        idCouleur: couleur.idCouleur 
      });
    } catch (err) {
      next(err);
    }
  }


}

module.exports = new CouleurController();