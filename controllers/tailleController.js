const { Taille } = require('../models');
class TailleController {
  async create(req, res) {
    try {
      const { nom } = req.body;
      const taille = await Taille.create({ nom });
      res.status(201).json(taille);
    } catch (err) {
      res.status(500).json({ message: "Erreur création taille", error: err.message });
    }
  }
  async getAll(req, res) {
    try {
      const tailles = await Taille.findAll();
      res.status(200).json(tailles);
    } catch (err) {
      res.status(500).json({ message: "Erreur récupération tailles", error: err.message });
    }
  }
  async getById(req, res) {
    try {
      const taille = await Taille.findByPk(req.params.id);
      if (!taille) return res.status(404).json({ message: "Taille non trouvée" });
      res.status(200).json(taille);
    } catch (err) {
      res.status(500).json({ message: "Erreur récupération taille", error: err.message });
    }
  }
  async edit(req, res) {
    try {
      const taille = await Taille.findByPk(req.params.id);
      if (!taille) return res.status(404).json({ message: "Taille non trouvée" });
      await taille.update({ nom: req.body.nom });
      res.status(200).json(taille);
    } catch (err) {
      res.status(500).json({ message: "Erreur modification taille", error: err.message });
    }
  }
  async delete(req, res) {
    try {
      const taille = await Taille.findByPk(req.params.id);
      if (!taille) return res.status(404).json({ message: "Taille non trouvée" });
      await taille.destroy();
      res.status(200).json({ message: "Taille supprimée" });
    } catch (err) {
      res.status(500).json({ message: "Erreur suppression taille", error: err.message });
    }
  }
}
module.exports = new TailleController();