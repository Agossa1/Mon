import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Définir les niveaux de log personnalisés
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
  fatal: 5
};

// Format pour la console (coloré et lisible)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => {
      // Extraction des propriétés standard
      const { timestamp, level, message, stack, ...rest } = info;
      
      // Message de base
      let logMessage = `${timestamp} ${level}: ${message}`;
      
      // Ajouter la stack trace si disponible
      if (stack) {
        logMessage += `\n${stack}`;
      }
      
      // Ajouter les autres propriétés si présentes, en évitant les structures circulaires
      if (Object.keys(rest).length > 0) {
        try {
          // Utiliser un replacer pour éviter les structures circulaires
          const getCircularReplacer = () => {
            const seen = new WeakSet();
            return (key, value) => {
              // Si c'est un objet et qu'il a déjà été vu, retourner '[Circular]'
              if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                  return '[Circular]';
                }
                seen.add(value);
              }
              return value;
            };
          };
          
          logMessage += `\n${JSON.stringify(rest, getCircularReplacer(), 2)}`;
        } catch (error) {
          logMessage += `\n[Impossible de sérialiser les métadonnées: ${error.message}]`;
        }
      }
      
      return logMessage;
    }
  )
);

// Format pour les fichiers (sans couleurs)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => {
      // Même logique que pour consoleFormat mais sans couleurs
      const { timestamp, level, message, stack, ...rest } = info;
      
      let logMessage = `${timestamp} ${level}: ${message}`;
      
      if (stack) {
        logMessage += `\n${stack}`;
      }
      
      if (Object.keys(rest).length > 0) {
        try {
          const getCircularReplacer = () => {
            const seen = new WeakSet();
            return (key, value) => {
              if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                  return '[Circular]';
                }
                seen.add(value);
              }
              return value;
            };
          };
          
          logMessage += `\n${JSON.stringify(rest, getCircularReplacer(), 2)}`;
        } catch (error) {
          logMessage += `\n[Impossible de sérialiser les métadonnées: ${error.message}]`;
        }
      }
      
      return logMessage;
    }
  )
);

// Configuration des transports
const transports = [
  // Console pour le développement
  new winston.transports.Console({
    format: consoleFormat
  }),
  
  // Fichier rotatif pour les erreurs
  new winston.transports.DailyRotateFile({
    filename: path.join(__dirname, '../../logs/error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '14d',
    format: fileFormat
  }),
  
  // Fichier rotatif pour tous les logs
  new winston.transports.DailyRotateFile({
    filename: path.join(__dirname, '../../logs/combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    format: fileFormat
  })
];

// Créer le logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  levels,
  transports,
  // Ne pas quitter en cas d'erreur non gérée
  exitOnError: false
});

// Ajouter une méthode de fermeture propre
logger.shutdown = () => {
  return new Promise((resolve, reject) => {
    try {
      // Fermer tous les transports
      logger.clear();
      logger.close();
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

// Fonction utilitaire pour logger en toute sécurité
logger.safeLog = (level, message, meta = {}) => {
  try {
    logger[level](message, meta);
  } catch (error) {
    console.error(`Erreur lors du logging (${level}): ${error.message}`);
    // Essayer de logger avec un message simplifié
    try {
      logger[level](message);
    } catch (innerError) {
      console.error(`Échec complet du logging: ${innerError.message}`);
    }
  }
};

// Exporter à la fois comme export par défaut et comme export nommé
export { logger };
export default logger;