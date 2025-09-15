const { Commentaire, Utilisateur, Produit } = require('../models');

class CommentaireController {
  // Créer un commentaire
  async createCommentaire(req, res) {
    try {
      const { idProduit, contenu } = req.body;
      const idUtilisateur = req.user.idUtilisateur; // À partir du middleware d'authentification

      // Vérifier que le produit existe
      const produit = await Produit.findByPk(idProduit);
      if (!produit) {
        return res.status(404).json({ message: 'Produit non trouvé' });
      }

      // Créer le commentaire
      const commentaire = await Commentaire.create({
        idUtilisateur,
        idProduit,
        contenu
      });

      // Récupérer le commentaire avec les informations utilisateur
      const commentaireComplet = await Commentaire.findByPk(commentaire.idCommentaire, {
        include: [
          {
            model: Utilisateur,
            as: 'utilisateur',
            attributes: ['idUtilisateur', 'prenom', 'nom']
          }
        ]
      });

      res.status(201).json({
        message: 'Commentaire créé avec succès',
        data: commentaireComplet
      });
    } catch (error) {
      console.error('Create commentaire error:', error);
      res.status(500).json({
        message: 'Erreur lors de la création du commentaire',
        error: error.message
      });
    }
  }

  // Récupérer tous les commentaires d'un produit
  async getCommentairesByProduit(req, res) {
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
      console.error('Get commentaires by produit error:', error);
      res.status(500).json({
        message: 'Erreur lors de la récupération des commentaires',
        error: error.message
      });
    }
  }

  // Mettre à jour un commentaire
  async updateCommentaire(req, res) {
    try {
      const { idCommentaire } = req.params;
      const { contenu } = req.body;
      const idUtilisateur = req.user.idUtilisateur;

      const commentaire = await Commentaire.findOne({
        where: { idCommentaire, idUtilisateur }
      });

      if (!commentaire) {
        return res.status(404).json({ message: 'Commentaire non trouvé ou non autorisé' });
      }

      await commentaire.update({ contenu });

      // Récupérer le commentaire mis à jour avec les informations utilisateur
      const commentaireMisAJour = await Commentaire.findByPk(idCommentaire, {
        include: [
          {
            model: Utilisateur,
            as: 'utilisateur',
            attributes: ['idUtilisateur', 'prenom', 'nom']
          }
        ]
      });

      res.status(200).json({
        message: 'Commentaire mis à jour avec succès',
        data: commentaireMisAJour
      });
    } catch (error) {
      console.error('Update commentaire error:', error);
      res.status(500).json({
        message: 'Erreur lors de la mise à jour du commentaire',
        error: error.message
      });
    }
  }

  // Supprimer un commentaire
  async deleteCommentaire(req, res) {
    try {
      const { idCommentaire } = req.params;
      const idUtilisateur = req.user.idUtilisateur;

      const commentaire = await Commentaire.findOne({
        where: { idCommentaire, idUtilisateur }
      });

      if (!commentaire) {
        return res.status(404).json({ message: 'Commentaire non trouvé ou non autorisé' });
      }

      await commentaire.destroy();
      res.status(200).json({ message: 'Commentaire supprimé avec succès' });
    } catch (error) {
      console.error('Delete commentaire error:', error);
      res.status(500).json({
        message: 'Erreur lors de la suppression du commentaire',
        error: error.message
      });
    }
  }

  // Récupérer les commentaires d'un utilisateur
  async getCommentairesByUtilisateur(req, res) {
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
      console.error('Get commentaires by utilisateur error:', error);
      res.status(500).json({
        message: 'Erreur lors de la récupération de vos commentaires',
        error: error.message
      });
    }
  }
}

module.exports = new CommentaireController();