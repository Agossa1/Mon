/**
 * Configuration du client Prisma
 * Ce module exporte une instance unique de PrismaClient pour toute l'application
 */

import { logger } from '../utils/logger.js';

// Utilisation d'un import dynamique avec gestion d'erreur
let prisma;

try {
  // Importer depuis le chemin généré spécifié dans schema.prisma
  // Notez que le chemin est relatif à ce fichier (src/config/prisma.js)
  const { PrismaClient } = await import('../../src/generated/prisma/index.js');
  
  // Initialisation du client Prisma avec des options de journalisation
  prisma = new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'info',
      },
      {
        emit: 'event',
        level: 'warn',
      },
    ],
  });

  // Configuration des événements de journalisation
  prisma.$on('query', (e) => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Prisma Query', {
        query: e.query,
        params: e.params,
        duration: `${e.duration}ms`,
      });
    }
  });

  prisma.$on('error', (e) => {
    logger.error('Prisma Error', {
      message: e.message,
      target: e.target,
    });
  });

  prisma.$on('info', (e) => {
    logger.info('Prisma Info', {
      message: e.message,
      target: e.target,
    });
  });

  prisma.$on('warn', (e) => {
    logger.warn('Prisma Warning', {
      message: e.message,
      target: e.target,
    });
  });

  // Connexion à la base de données au démarrage
  await prisma.$connect();
  logger.info('Successfully connected to the database');

  // Gestion de la fermeture propre de la connexion
  process.on('SIGINT', async () => {
    await prisma.$disconnect();
    logger.info('Disconnected from the database due to application termination');
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    logger.info('Disconnected from the database due to application termination');
    process.exit(0);
  });

} catch (error) {
  logger.error('Failed to initialize Prisma client', {
    error: error.message,
    stack: error.stack,
  });
  
  // Créer un client Prisma factice pour éviter les erreurs dans le reste de l'application
  prisma = createMockPrismaClient();
  
  logger.warn('Using mock Prisma client. Database operations will not work!');
}

/**
 * Crée un client Prisma factice pour éviter les erreurs
 * @returns {Object} Client Prisma factice
 */
function createMockPrismaClient() {
  const mockMethod = async () => {
    logger.error('Database operation attempted with mock client');
    return null;
  };
  
  const mockArrayMethod = async () => {
    logger.error('Database operation attempted with mock client');
    return [];
  };

  return {
    $connect: async () => {},
    $disconnect: async () => {},
    $on: () => {},
    user: {
      findUnique: mockMethod,
      findFirst: mockMethod,
      findMany: mockArrayMethod,
      create: mockMethod,
      update: mockMethod,
      delete: mockMethod,
      count: async () => 0,
    },
    oTP: {
      findUnique: mockMethod,
      findFirst: mockMethod,
      findMany: mockArrayMethod,
      create: mockMethod,
      update: mockMethod,
      delete: mockMethod,
      count: async () => 0,
    },
    // Ajoutez d'autres modèles selon votre schéma
  };
}

export default prisma;