import prisma from '../config/prisma.js';
import { logger } from '../utils/logger.js';
import { verifyToken } from '../utils/paseto.js';

/**
 * Middleware pour vérifier si l'utilisateur est authentifié
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
export const requireAuth = async (req, res, next) => {
  try {
    // Vérifier si le header d'autorisation existe
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise',
        error: 'UNAUTHORIZED'
      });
    }

    // Extraire le token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant',
        error: 'MISSING_TOKEN'
      });
    }

    // Vérifier et décoder le token PASETO
    const payload = await verifyToken(token, {
      audience: process.env.TOKEN_AUDIENCE || 'app:api'
    });

    // Vérifier si l'utilisateur existe toujours dans la base de données
    // Utiliser payload.id qui est maintenant correctement défini
    const userId = payload.id; // Ou payload.sub si vous préférez utiliser directement sub
    
    if (!userId) {
      logger.warn('ID utilisateur manquant dans le payload du token', {
        payload: { ...payload, id: payload.id, sub: payload.sub }
      });
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification invalide',
        error: 'INVALID_TOKEN'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        emailVerified: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé',
        error: 'USER_NOT_FOUND'
      });
    }

    // Vérifier si l'email est vérifié (si nécessaire)
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Veuillez vérifier votre adresse email',
        error: 'EMAIL_NOT_VERIFIED'
      });
    }

    // Attacher les données utilisateur à la requête
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    logger.warn('Erreur d\'authentification', {
      error: error.message,
      ip: req.ip
    });

    return res.status(401).json({
      success: false,
      message: 'Session expirée ou invalide',
      error: 'INVALID_TOKEN'
    });
  }
};

/**
 * Middleware pour vérifier si l'utilisateur a un rôle spécifique
 * @param {string[]} roles - Tableau des rôles autorisés
 * @returns {Function} Middleware Express
 */
export const requireRole = (roles) => {
  return (req, res, next) => {
    // Vérifier si l'utilisateur est authentifié
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise',
        error: 'UNAUTHORIZED'
      });
    }

    // Vérifier si l'utilisateur a le rôle requis
    if (!roles.includes(req.user.role)) {
      logger.warn('Tentative d\'accès non autorisé', {
        userId: req.user.id,
        requiredRoles: roles,
        userRole: req.user.role,
        ip: req.ip,
        path: req.originalUrl
      });

      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas les permissions nécessaires',
        error: 'FORBIDDEN'
      });
    }

    next();
  };
};

/**
 * Middleware pour les routes accessibles uniquement aux administrateurs
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
export const requireAdmin = (req, res, next) => {
  requireRole(['ADMIN'])(req, res, next);
};

/**
 * Middleware pour les routes accessibles aux administrateurs et aux vendeurs
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
export const requireAdminOrSeller = (req, res, next) => {
  requireRole(['ADMIN', 'SELLER'])(req, res, next);
};

/**
 * Middleware pour vérifier si l'utilisateur est le propriétaire de la ressource
 * @param {Function} getResourceUserId - Fonction qui extrait l'ID utilisateur de la ressource
 * @returns {Function} Middleware Express
 */
export const requireOwnership = (getResourceUserId) => {
  return async (req, res, next) => {
    try {
      // Vérifier si l'utilisateur est authentifié
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise',
          error: 'UNAUTHORIZED'
        });
      }

      // Si l'utilisateur est un administrateur, autoriser l'accès
      if (req.user.role === 'ADMIN') {
        return next();
      }

      // Obtenir l'ID utilisateur de la ressource
      const resourceUserId = await getResourceUserId(req);

      // Vérifier si l'utilisateur est le propriétaire
      if (req.user.id !== resourceUserId) {
        logger.warn('Tentative d\'accès à une ressource non autorisée', {
          userId: req.user.id,
          resourceUserId,
          ip: req.ip,
          path: req.originalUrl
        });

        return res.status(403).json({
          success: false,
          message: 'Vous n\'avez pas les permissions nécessaires',
          error: 'FORBIDDEN'
        });
      }

      next();
    } catch (error) {
      logger.error('Erreur lors de la vérification de propriété', {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id,
        ip: req.ip
      });

      return res.status(500).json({
        success: false,
        message: 'Une erreur est survenue lors de la vérification des permissions',
        error: process.env.NODE_ENV === 'development' ? error.message : 'SERVER_ERROR'
      });
    }
  };
};