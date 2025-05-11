import express from 'express';
import { Prisma } from '@prisma/client';
import logger from './src/utils/logger.js';
import { ValidationError } from './src/utils/errors.js';
import { verifyToken } from './src/utils/paseto.js';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();
// Import des routes

import AdminRoutes from "./src/routes/AdminRoutes.js";
import {authRoutes} from "./src/routes/authRoutes.js";
import {sellerRoutes} from "./src/routes/sellerRoutes.js";

// Configuration ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware de base - Ces middlewares doivent être appliqués avant les routes
// Middleware pour le parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    }
  }
}));

// Middleware de compression
app.use(compression());

// Cors 
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Ajoutez l'origine de votre frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware de limitation de débit
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite à 100 requêtes par fenêtre
  standardHeaders: true, // Retourne les headers standard de rate limit
  legacyHeaders: false, // Désactive les headers X-RateLimit-*
  message: {
    success: false,
    message: 'Trop de requêtes, veuillez réessayer plus tard.',
    error: 'RATE_LIMIT_EXCEEDED'
  }
}));

// Middleware de journalisation des requêtes HTTP avec Morgan
app.use(morgan('combined', {
  skip: (req, res) => res.statusCode < 400,
  stream: {
    write: (message) => {
      try {
        logger.error(message.trim());
      } catch (err) {
        console.error('Erreur lors du logging Morgan:', err);
      }
    }
  }
}));

// Middleware pour la journalisation des requêtes
app.use((req, res, next) => {
  try {
    logger.info('Requête entrante', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
  } catch (err) {
    console.error('Erreur lors du logging de requête:', err);
  }
  next();
});

// Middleware pour décoder les tokens d'authentification PASETO
app.use(async (req, res, next) => {
  try {
    // Vérifier si le header d'autorisation existe
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    // Extraire le token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return next();
    }

    // Vérifier et décoder le token PASETO
    const payload = await verifyToken(token, {
      audience: 'app:api'
    });

    // Attacher les données utilisateur à la requête
    req.user = payload;
    next();
  } catch (error) {
    // Ne pas renvoyer d'erreur, simplement continuer sans authentification
    try {
      logger.warn('Erreur d\'authentification', {
        error: error.message,
        ip: req.ip
      });
    } catch (logErr) {
      console.error('Erreur lors du logging d\'authentification:', logErr);
    }
    next();
  }
});

// Middleware pour la gestion des fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Redirection pour corriger l'URL incorrecte
app.use('/api/users/users', (req, res, next) => {
  // Rediriger /api/users/users/xxx vers /api/users/xxx
  const newPath = req.path.replace(/^\//, '');
  res.redirect(307, `/api/users/${newPath}`);
});

// Routes
app.use('/api/users', authRoutes)
app.use('/api/admin', AdminRoutes)
app.use('/api/shops', sellerRoutes)

// Route 404 pour les chemins non trouvés
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ressource non trouvée',
    error: 'NOT_FOUND'
  });
});

// Middleware pour gérer les erreurs - Ces middlewares doivent être appliqués après les routes
// Middleware pour gérer les erreurs de validation
app.use((err, req, res, next) => {
  if (err instanceof ValidationError) {
    try {
      logger.warn('Erreur de validation', {
        error: err.message,
        stack: err.stack,
        ip: req.ip
      });
    } catch (logErr) {
      console.error('Erreur lors du logging de validation:', logErr);
    }
    return res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors: err.errors || [err.message],
      error: 'VALIDATION_ERROR'
    });
  }
  next(err);
});

// Middleware pour gérer les erreurs de Prisma
app.use((err, req, res, next) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    try {
      logger.error('Erreur de requête Prisma', {
        code: err.code,
        error: err.message,
        meta: err.meta,
        ip: req.ip
      });
    } catch (logErr) {
      console.error('Erreur lors du logging Prisma:', logErr);
    }
    
    // Gérer les erreurs spécifiques de Prisma
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Un enregistrement avec ces données existe déjà',
        error: 'DUPLICATE_ENTRY'
      });
    }
    
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Enregistrement non trouvé',
        error: 'RECORD_NOT_FOUND'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue avec la base de données',
      error: 'DATABASE_ERROR'
    });
  }
  next(err);
});

// Middleware pour gérer les erreurs générales
app.use((err, req, res, next) => {
  try {
    logger.error('Erreur non gérée', {
      error: err.message,
      stack: err.stack,
      ip: req.ip
    });
  } catch (logErr) {
    console.error('Erreur lors du logging d\'erreur:', logErr);
  }
  
  res.status(500).json({
    success: false,
    message: 'Une erreur interne est survenue',
    error: process.env.NODE_ENV === 'development' ? err.message : 'SERVER_ERROR'
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  try {
    logger.info(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  } catch (err) {
    console.error('Erreur lors du logging de démarrage:', err);
  }
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});

// IMPORTANT: Supprimer les gestionnaires d'événements dupliqués
// Garder uniquement ces gestionnaires d'événements pour éviter les doublons

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  try {
    logger.fatal('Erreur non capturée', {
      error: error.message,
      stack: error.stack
    });
  } catch (logErr) {
    console.error('Erreur lors du logging d\'exception:', logErr);
  }
  console.error('ERREUR NON CAPTURÉE:', error);
  
  // Attendre un peu avant de quitter pour permettre au logger d'écrire
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Gestion des promesses rejetées non gérées
process.on('unhandledRejection', (reason, promise) => {
  try {
    logger.fatal('Promesse rejetée non gérée', {
      reason: reason.message || reason,
      stack: reason.stack || 'No stack trace'
    });
  } catch (logErr) {
    console.error('Erreur lors du logging de rejet:', logErr);
  }
  console.error('PROMESSE REJETÉE NON GÉRÉE:', reason);
});

// Ajouter une gestion propre de l'arrêt de l'application
process.on('SIGINT', async () => {
  console.log('Arrêt en cours...');
  try {
    if (typeof logger.shutdown === 'function') {
      await logger.shutdown();
      console.log('Logger fermé avec succès');
    }
  } catch (err) {
    console.error('Erreur lors de la fermeture du logger:', err);
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Signal de terminaison reçu, arrêt en cours...');
  try {
    if (typeof logger.shutdown === 'function') {
      await logger.shutdown();
      console.log('Logger fermé avec succès');
    }
  } catch (err) {
    console.error('Erreur lors de la fermeture du logger:', err);
  }
  process.exit(0);
});

export default app;