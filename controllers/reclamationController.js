const { Reclamation, Utilisateur } = require('../models');
const validator = require('validator');

function validateReclamation(data) {
  if (!data.idUtilisateur) {
    if (!data.nom || !validator.isLength(data.nom, { min: 2, max: 50 }) || !validator.matches(data.nom, /^[A-Za-zÀ-ÿ\s\-]+$/))
      return "Nom invalide";
    if (!data.prenom || !validator.isLength(data.prenom, { min: 2, max: 50 }) || !validator.matches(data.prenom, /^[A-Za-zÀ-ÿ\s\-]+$/))
      return "Prénom invalide";
    if (!data.email || !validator.isEmail(data.email)) return "Email invalide";
    if (!data.telephone || !validator.isLength(data.telephone, { min: 6, max: 20 })) return "Téléphone invalide";
  }
  if (!data.sujet || !validator.isLength(data.sujet, { min: 5, max: 100 })) return "Sujet invalide";
  if (!data.message || !validator.isLength(data.message, { min: 10,max:1000 })) return "Message invalide";
  return null;
}

class ReclamationController {
  async createReclamation(req, res, next) {
    try {
      const { sujet, message, idUtilisateur, nom, prenom, email, telephone } = req.body;
      const cleanSujet = validator.escape(sujet || "");
      const cleanMessage = validator.escape(message || "");
      const cleanNom = nom ? validator.escape(nom) : "";
      const cleanPrenom = prenom ? validator.escape(prenom) : "";
      const cleanEmail = email ? validator.normalizeEmail(email) : "";
      const cleanTelephone = telephone ? validator.escape(telephone) : "";

      const validationError = validateReclamation({
        sujet: cleanSujet,
        message: cleanMessage,
        nom: cleanNom,
        prenom: cleanPrenom,
        email: cleanEmail,
        telephone: cleanTelephone,
        idUtilisateur
      });
      if (validationError) {
        const error = new Error(validationError);
        error.code = "VALIDATION_ERROR";
        return next(error);
      }

      let reclamationData = {
        sujet: cleanSujet,
        message: cleanMessage,
        telephone: cleanTelephone,
      };

      if (idUtilisateur) {
        const utilisateur = await Utilisateur.findByPk(idUtilisateur);
        if (!utilisateur) {
          const error = new Error('Utilisateur non trouvé');
          error.code = "NOT_FOUND";
          return next(error);
        }
        reclamationData.idUtilisateur = idUtilisateur;
      } else {
        const tempUser = await Utilisateur.create({
          nom: cleanNom,
          prenom: cleanPrenom,
          email: cleanEmail,
          telephone: cleanTelephone,
          role: 'client'
        });
        reclamationData.idUtilisateur = tempUser.idUtilisateur;
      }

      const reclamation = await Reclamation.create(reclamationData);

      res.status(201).json({
        message: 'Réclamation créée avec succès',
        data: reclamation,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllReclamations(req, res, next) {
    try {
      const reclamations = await Reclamation.findAll({
        include: [{
          model: Utilisateur,
          as: 'utilisateur',
          attributes: ['idUtilisateur', 'prenom', 'nom', 'email', 'telephone'],
        }],
      });
      res.status(200).json(reclamations);
    } catch (error) {
      next(error);
    }
  }

  async getReclamationById(req, res, next) {
    try {
      const reclamation = await Reclamation.findByPk(req.params.id, {
        include: [{
          model: Utilisateur,
          as: 'utilisateur',
          attributes: ['idUtilisateur', 'prenom', 'nom', 'email', 'telephone'],
        }],
      });
      if (!reclamation) {
        const error = new Error('Réclamation non trouvée');
        error.code = "NOT_FOUND";
        return next(error);
      }
      res.status(200).json(reclamation);
    } catch (error) {
      next(error);
    }
  }

  async updateReclamation(req, res, next) {
    try {
      const { sujet, message, statut } = req.body;
      const reclamation = await Reclamation.findByPk(req.params.id);
      if (!reclamation) {
        const error = new Error('Réclamation non trouvée');
        error.code = "NOT_FOUND";
        return next(error);
      }
      await reclamation.update({ sujet, message, statut });
      res.status(200).json({
        message: 'Réclamation mise à jour avec succès',
        data: reclamation,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteReclamation(req, res, next) {
    try {
      const reclamation = await Reclamation.findByPk(req.params.id);
      if (!reclamation) {
        const error = new Error('Réclamation non trouvée');
        error.code = "NOT_FOUND";
        return next(error);
      }
      await reclamation.destroy();
      res.status(200).json({ message: 'Réclamation supprimée avec succès' });
    } catch (error) {
      next(error);
    }
  }

  async getReclamationsByUser(req, res, next) {
    try {
      const utilisateur = await Utilisateur.findByPk(req.params.idUtilisateur);
      if (!utilisateur) {
        const error = new Error('Utilisateur non trouvé');
        error.code = "NOT_FOUND";
        return next(error);
      }
      const reclamations = await Reclamation.findAll({
        where: { idUtilisateur: req.params.idUtilisateur },
        include: [{
          model: Utilisateur,
          as: 'utilisateur',
          attributes: ['idUtilisateur', 'prenom', 'nom', 'email'],
        }],
      });
      res.status(200).json(reclamations);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReclamationController();