import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Définir les niveaux de log et les couleurs
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
  fatal: 5
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
  fatal: 'red'
};

// Ajouter les couleurs à winston
winston.addColors(colors);

// Format de log pour la console
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message} ${info.stack ? '\n' + info.stack : ''} ${
      Object.keys(info).filter(key => !['timestamp', 'level', 'message', 'stack'].includes(key)).length > 0 
        ? '\n' + JSON.stringify(info, null, 2) 
        : ''
    }`
  )
);

// Format de log pour les fichiers
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.json()
);

// Créer les transports pour les fichiers de log
const fileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(__dirname, '../../logs/application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: fileFormat
});

const errorFileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(__dirname, '../../logs/error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'error',
  format: fileFormat
});

// Créer le logger
export const logger = winston.createLogger({
  levels,
  level: process.env.LOG_LEVEL || 'info',
  format: fileFormat,
  transports: [
    new winston.transports.Console({
      format: consoleFormat
    }),
    fileTransport,
    errorFileTransport
  ],
  exceptionHandlers: [
    new winston.transports.Console({
      format: consoleFormat
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/exceptions.log'),
      format: fileFormat
    })
  ],
  rejectionHandlers: [
    new winston.transports.Console({
      format: consoleFormat
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/rejections.log'),
      format: fileFormat
    })
  ],
  exitOnError: false
});

// Créer le dossier logs s'il n'existe pas
try {
  const fs = await import('fs');
  const logsDir = path.join(__dirname, '../../logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
} catch (error) {
  console.error('Erreur lors de la création du dossier logs:', error);
}

export default logger;