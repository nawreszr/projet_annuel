const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const winston = require('winston');

// Charger les variables d'environnement
dotenv.config();

// Configuration des logs
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Initialiser l'application Express
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Route de santé
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    service: 'User Service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Routes API
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));

// Route 404
app.use('*', (_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Gestion des erreurs
app.use((err, _req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Connexion à MongoDB avec plus de logs
console.log('Tentative de connexion  a MongoDB...');
console.log('URI:', process.env.MONGODB_URI);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:mongodb123@mongodb:27017/users?authSource=admin';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // 30 secondes
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('MongoDB connecté avec succès!');
  console.log('Base de données:', mongoose.connection.db.databaseName);
})
.catch(err => {
  console.error(' ERREUR MongoDB:', err.message);
  console.error(' Stack:', err.stack);
  process.exit(1);
});

// Démarrer le serveur
const PORT = process.env.PORT || 8002;
app.listen(PORT, () => {
  logger.info(` User Service running on port ${PORT}`);
  console.log(` User Service running on port ${PORT}`);
  console.log(` MongoDB URI: ${MONGODB_URI}`);
});