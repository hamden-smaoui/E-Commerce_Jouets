const { Avis, Utilisateur, Produit } = require('../models');
const { Sequelize } = require('sequelize');

class AvisController {
  // Créer ou mettre à jour un avis
  async createOrUpdateAvis(req, res) {
    try {
      const { idProduit, note } = req.body;
      const idUtilisateur = req.user.idUtilisateur; // À partir du middleware d'authentification

      // Vérifier que le produit existe
      const produit = await Produit.findByPk(idProduit);
      if (!produit) {
        return res.status(404).json({ message: 'Produit non trouvé' });
      }

      // Vérifier si l'avis existe déjà
      const avisExistant = await Avis.findOne({
        where: { idUtilisateur, idProduit }
      });

      let avis;
      if (avisExistant) {
        // Mettre à jour l'avis existant
        await avisExistant.update({ note });
        avis = avisExistant;
      } else {
        // Créer un nouvel avis
        avis = await Avis.create({
          idUtilisateur,
          idProduit,
          note
        });
      }

      // Récupérer l'avis avec les informations utilisateur
      const avisComplet = await Avis.findByPk(avis.idAvis, {
        include: [
          {
            model: Utilisateur,
            as: 'utilisateur',
            attributes: ['idUtilisateur', 'prenom', 'nom']
          }
        ]
      });

      res.status(200).json({
        message: avisExistant ? 'Avis mis à jour avec succès' : 'Avis créé avec succès',
        data: avisComplet
      });
    } catch (error) {
      console.error('Create/Update avis error:', error);
      res.status(500).json({
        message: 'Erreur lors de la création/mise à jour de l\'avis',
        error: error.message
      });
    }
  }

  // Récupérer tous les avis d'un produit
  async getAvisByProduit(req, res) {
    try {
      const { idProduit } = req.params;

      const avis = await Avis.findAll({
        where: { idProduit },
        include: [
          {
            model: Utilisateur,
            as: 'utilisateur',
            attributes: ['idUtilisateur', 'prenom', 'nom']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json(avis);
    } catch (error) {
      console.error('Get avis by produit error:', error);
      res.status(500).json({
        message: 'Erreur lors de la récupération des avis',
        error: error.message
      });
    }
  }

  // Récupérer les statistiques des avis d'un produit
  async getAvisStatistiques(req, res) {
    try {
      const { idProduit } = req.params;

      const statistiques = await Avis.findAll({
        where: { idProduit },
        attributes: [
          'note',
          [Sequelize.fn('COUNT', Sequelize.col('note')), 'count']
        ],
        group: ['note'],
        order: [['note', 'ASC']]
      });

      const totalAvis = await Avis.count({ where: { idProduit } });
      const moyenneNote = await Avis.findOne({
        where: { idProduit },
        attributes: [
          [Sequelize.fn('AVG', Sequelize.col('note')), 'moyenne']
        ]
      });

      const stats = {
        totalAvis,
        moyenneNote: moyenneNote ? parseFloat(moyenneNote.dataValues.moyenne).toFixed(1) : 0,
        repartition: {
          1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        }
      };

      statistiques.forEach(stat => {
        stats.repartition[stat.note] = parseInt(stat.dataValues.count);
      });

      res.status(200).json(stats);
    } catch (error) {
      console.error('Get avis statistiques error:', error);
      res.status(500).json({
        message: 'Erreur lors de la récupération des statistiques',
        error: error.message
      });
    }
  }

  // Récupérer l'avis d'un utilisateur pour un produit
  async getMonAvis(req, res) {
    try {
      const { idProduit } = req.params;
      const idUtilisateur = req.user.idUtilisateur;

      const avis = await Avis.findOne({
        where: { idUtilisateur, idProduit }
      });

      res.status(200).json(avis);
    } catch (error) {
      console.error('Get mon avis error:', error);
      res.status(500).json({
        message: 'Erreur lors de la récupération de votre avis',
        error: error.message
      });
    }
  }

  // Supprimer un avis
  async deleteAvis(req, res) {
    try {
      const { idAvis } = req.params;
      const idUtilisateur = req.user.idUtilisateur;

      const avis = await Avis.findOne({
        where: { idAvis, idUtilisateur }
      });

      if (!avis) {
        return res.status(404).json({ message: 'Avis non trouvé ou non autorisé' });
      }

      await avis.destroy();
      res.status(200).json({ message: 'Avis supprimé avec succès' });
    } catch (error) {
      console.error('Delete avis error:', error);
      res.status(500).json({
        message: 'Erreur lors de la suppression de l\'avis',
        error: error.message
      });
    }
  }
}

module.exports = new AvisController();