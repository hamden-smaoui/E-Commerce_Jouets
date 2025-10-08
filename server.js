const express = require('express');
const http = require('http');
const sequelize = require('./config/database'); 
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const SchedulerService = require('./services/SchedulerService');
const jouetsRoutes = require('./routes/jouetsRoutes');
const authRoutes = require('./routes/auth');
const panierRoutes = require('./routes/panier');
const favoriRoutes = require('./routes/favori');
const reclamationRoutes  = require('./routes/reclamation');
const storeInfoRoutes = require('./routes/storeInfo');
const avisRoutes = require('./routes/avis');
const commentaireRoutes = require('./routes/commentaire');
const factureRoutes = require('./routes/facture');
const fournisseurRoutes = require('./routes/fournisseur');
const codePromoRoutes = require('./routes/code-promo');
const ageRoutes = require('./routes/age');
const tailleRoutes = require('./routes/taille');
const couleurRoutes = require('./routes/couleur');
const typeRoutes = require('./routes/type');
const marqueRoutes = require('./routes/marque');
const categorieRoutes = require('./routes/categorie');
const produitRoutes = require('./routes/produit');
const commandeRoutes = require('./routes/commande');
const promotionRoutes = require('./routes/promotion');
const newsletterRoutes = require('./routes/newsletter');
const utilisateurRoutes = require('./routes/utilisateur');      

const errorHandler = require('./middlewares/errorHandler');
const app = express();
const server = http.createServer(app);

app.use(cookieParser());
// Middleware CORS avec configuration pour les cookies
app.use(cors({
  origin:process.env.FRONTEND_URL || 'http://localhost:3000', // ✅ URL exacte du frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie'],
  preflightContinue: false, // ✅ Ajouter
  optionsSuccessStatus: 204 // ✅ Ajouter
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// **Accueil**
app.get('/', (req, res) => {
  res.send('🚀 Bienvenue dans le microservice unifié Gestion Centre et Réservation');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/panier', panierRoutes);
app.use('/api/favoris', favoriRoutes);
app.use('/api/reclamations', reclamationRoutes);
app.use('/api/store-info', storeInfoRoutes);
app.use('/api/avis', avisRoutes);
app.use('/api/commentaires', commentaireRoutes);
app.use('/api/factures', factureRoutes);
app.use('/api/ages', ageRoutes);
app.use('/api/tailles', tailleRoutes);
app.use('/api/couleurs', couleurRoutes);
app.use('/api/types', typeRoutes);
app.use('/api/marques', marqueRoutes);
app.use('/api/categories', categorieRoutes);
app.use('/api/produits', produitRoutes);
app.use('/api/commandes', commandeRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/utilisateurs', utilisateurRoutes);
app.use('/api/fournisseurs', fournisseurRoutes);
app.use('/api/codes-promo', codePromoRoutes);

// Handler 404
app.use((req, res, next) => {
  const error = new Error('Route non trouvée');
  error.code = "NOT_FOUND";
  next(error);
});

// Handler d’erreur centralisé
app.use(errorHandler);

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