const { Commentaire, Utilisateur, Produit } = require('../models');

class CommentaireController {
  async createCommentaire(req, res, next) {
    try {
      const { idProduit, contenu } = req.body;
      const idUtilisateur = req.user.idUtilisateur;
      const produit = await Produit.findByPk(idProduit);
      if (!produit) {
        const error = new Error('Produit non trouvé');
        error.code = "NOT_FOUND";
        return next(error);
      }
      const commentaire = await Commentaire.create({ idUtilisateur, idProduit, contenu });
      const commentaireComplet = await Commentaire.findByPk(commentaire.idCommentaire, {
        include: [
          {
            model: Utilisateur,
            as: 'utilisateur',
            attributes: ['idUtilisateur', 'prenom', 'nom']
          }
        ]
      });
      res.status(201).json({ message: 'Commentaire créé avec succès', data: commentaireComplet });
    } catch (error) {
      next(error);
    }
  }

  async getCommentairesByProduit(req, res, next) {
    try {
      const { idProduit } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      const { count, rows: commentaires } = await Commentaire.findAndCountAll({
        where: { idProduit },
        include: [
          {
            model: Utilisateur,
            as: 'utilisateur',
            attributes: ['idUtilisateur', 'prenom', 'nom']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      res.status(200).json({
        data: commentaires,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          hasNext: page * limit < count,
          hasPrev: page > 1,
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCommentaire(req, res, next) {
    try {
      const { idCommentaire } = req.params;
      const { contenu } = req.body;
      const idUtilisateur = req.user.idUtilisateur;
      const commentaire = await Commentaire.findOne({ where: { idCommentaire, idUtilisateur } });
      if (!commentaire) {
        const error = new Error('Commentaire non trouvé ou non autorisé');
        error.code = "NOT_FOUND";
        return next(error);
      }
      await commentaire.update({ contenu });
      const commentaireMisAJour = await Commentaire.findByPk(idCommentaire, {
        include: [
          {
            model: Utilisateur,
            as: 'utilisateur',
            attributes: ['idUtilisateur', 'prenom', 'nom']
          }
        ]
      });
      res.status(200).json({ message: 'Commentaire mis à jour avec succès', data: commentaireMisAJour });
    } catch (error) {
      next(error);
    }
  }

  async deleteCommentaire(req, res, next) {
    try {
      const { idCommentaire } = req.params;
      const idUtilisateur = req.user.idUtilisateur;
      const commentaire = await Commentaire.findOne({ where: { idCommentaire, idUtilisateur } });
      if (!commentaire) {
        const error = new Error('Commentaire non trouvé ou non autorisé');
        error.code = "NOT_FOUND";
        return next(error);
      }
      await commentaire.destroy();
      res.status(200).json({ message: 'Commentaire supprimé avec succès' });
    } catch (error) {
      next(error);
    }
  }

  async getCommentairesByUtilisateur(req, res, next) {
    try {
      const idUtilisateur = req.user.idUtilisateur;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      const { count, rows: commentaires } = await Commentaire.findAndCountAll({
        where: { idUtilisateur },
        include: [
          {
            model: Produit,
            as: 'produit',
            attributes: ['idProduit', 'nom']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      res.status(200).json({
        data: commentaires,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          hasNext: page * limit < count,
          hasPrev: page > 1,
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CommentaireController();