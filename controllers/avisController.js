const { Avis, Utilisateur, Produit } = require('../models');
const { Sequelize } = require('sequelize');

class AvisController {
  async createOrUpdateAvis(req, res, next) {
    try {
      const { idProduit, note } = req.body;
      const idUtilisateur = req.user.idUtilisateur;

      const produit = await Produit.findByPk(idProduit);
      if (!produit) {
        const error = new Error('Produit non trouvé');
        error.code = "NOT_FOUND";
        return next(error);
      }

      const avisExistant = await Avis.findOne({ where: { idUtilisateur, idProduit } });

      let avis;
      if (avisExistant) {
        await avisExistant.update({ note });
        avis = avisExistant;
      } else {
        avis = await Avis.create({ idUtilisateur, idProduit, note });
      }

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
      next(error);
    }
  }

  async getAvisByProduit(req, res, next) {
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
      next(error);
    }
  }

  async getAvisStatistiques(req, res, next) {
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
        attributes: [[Sequelize.fn('AVG', Sequelize.col('note')), 'moyenne']]
      });

      const stats = {
        totalAvis,
        moyenneNote: moyenneNote ? parseFloat(moyenneNote.dataValues.moyenne).toFixed(1) : 0,
        repartition: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };

      statistiques.forEach(stat => {
        stats.repartition[stat.note] = parseInt(stat.dataValues.count);
      });

      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }

  async getMonAvis(req, res, next) {
    try {
      const { idProduit } = req.params;
      const idUtilisateur = req.user.idUtilisateur;

      const avis = await Avis.findOne({
        where: { idUtilisateur, idProduit }
      });

      res.status(200).json(avis);
    } catch (error) {
      next(error);
    }
  }

  async deleteAvis(req, res, next) {
    try {
      const { idAvis } = req.params;
      const idUtilisateur = req.user.idUtilisateur;

      const avis = await Avis.findOne({
        where: { idAvis, idUtilisateur }
      });

      if (!avis) {
        const error = new Error('Avis non trouvé ou non autorisé');
        error.code = "NOT_FOUND";
        return next(error);
      }

      await avis.destroy();
      res.status(200).json({ message: 'Avis supprimé avec succès' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AvisController();