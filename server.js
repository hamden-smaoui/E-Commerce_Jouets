const express = require('express');
const http = require('http');
const sequelize = require('./config/database'); 
const cors = require('cors');
require('dotenv').config();

const jouetsRoutes = require('./routes/jouetsRoutes');
const authRoutes = require('./routes/auth');
const panierRoutes = require('./routes/panier');
const favoriRoutes = require('./routes/favori');
const reclamationRoutes  = require('./routes/reclamation');
const storeInfoRoutes = require('./routes/storeInfo');
const avisRoutes = require('./routes/avis');
const commentaireRoutes = require('./routes/commentaire');
const factureRoutes = require('./routes/facture');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static('uploads'));
app.use((req, res, next) => {
  next();
});

// Routes
app.use('/api/jouets', jouetsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/panier', panierRoutes);
app.use('/api/favoris', favoriRoutes);
app.use('/api/reclamations', reclamationRoutes);
app.use('/api/store-info', storeInfoRoutes);
app.use('/api/avis', avisRoutes);
app.use('/api/commentaires', commentaireRoutes);
app.use('/api/factures', factureRoutes);


app.get('/', (req, res) => {
  res.send('🚀 Bienvenue dans le microservice unifié Gestion Centre et Réservation');
});

// 404 Error handling
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Server error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur serveur interne' });
});

const waitForDatabase = async (maxRetries = 30, delay = 3000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await sequelize.authenticate();
      console.log('Connexion réussie à centre-db');
      return true;
    } catch (err) {
      console.log(`Tentative ${i + 1}/${maxRetries} : centre-db non prête, nouvelle tentative dans ${delay/1000} secondes...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Impossible de se connecter à centre-db après plusieurs tentatives');
};

const startServer = async () => {
  try {
    await waitForDatabase();

    const PORT = process.env.PORT || 3001;
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Microservice Gestion Centre running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Erreur lors du démarrage du microservice :', err);
    process.exit(1);
  }
};

startServer();