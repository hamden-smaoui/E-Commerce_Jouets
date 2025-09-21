const { Age } = require('../models');
class AgeController {
  async create(req, res) {
    try {
      const { minAge, maxAge, typeAge, label } = req.body;
      const age = await Age.create({ minAge, maxAge, typeAge, label });
      res.status(201).json(age);
    } catch (err) {
      res.status(500).json({ message: "Erreur création tranche d'âge", error: err.message });
    }
  }
  async getAll(req, res) {
    try {
      const ages = await Age.findAll();
      res.status(200).json(ages);
    } catch (err) {
      res.status(500).json({ message: "Erreur récupération tranches d'âge", error: err.message });
    }
  }
  async getById(req, res) {
    try {
      const age = await Age.findByPk(req.params.id);
      if (!age) return res.status(404).json({ message: "Tranche d'âge non trouvée" });
      res.status(200).json(age);
    } catch (err) {
      res.status(500).json({ message: "Erreur récupération tranche d'âge", error: err.message });
    }
  }
  async edit(req, res) {
    try {
      const age = await Age.findByPk(req.params.id);
      if (!age) return res.status(404).json({ message: "Tranche d'âge non trouvée" });
      const { minAge, maxAge, typeAge, label } = req.body;
      await age.update({ minAge, maxAge, typeAge, label });
      res.status(200).json(age);
    } catch (err) {
      res.status(500).json({ message: "Erreur modification tranche d'âge", error: err.message });
    }
  }
  async delete(req, res) {
    try {
      const age = await Age.findByPk(req.params.id);
      if (!age) return res.status(404).json({ message: "Tranche d'âge non trouvée" });
      await age.destroy();
      res.status(200).json({ message: "Tranche d'âge supprimée" });
    } catch (err) {
      res.status(500).json({ message: "Erreur suppression tranche d'âge", error: err.message });
    }
  }
}
module.exports = new AgeController();