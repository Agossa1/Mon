import prisma from '../../config/prisma.js';
import bcrypt from 'bcryptjs';
import { generateAuthTokens, verifyToken } from '../../utils/paseto.js';
import { logger } from '../../utils/logger.js';
import { validateLoginInput } from '../../validators/auth.js';

/**
 * Contrôleur pour l'authentification des utilisateurs
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON avec les informations utilisateur et tokens
 */
export const login = async (req, res) => {
  try {
    // 1. Valider les données d'entrée
    const { error, value } = validateLoginInput(req.body);
    if (error) {
      logger.warn('Tentative de connexion avec des données invalides', { 
        error: error.details,
        ip: req.ip
      });
      return res.status(400).json({ 
        success: false,
        message: 'Données de connexion invalides',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { email, password, rememberMe = false } = value;

    // 2. Rechercher l'utilisateur
    const user = await prisma.user.findUnique({ 
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        fullName: true,  // Remplacé 'name' par 'fullName'
        role: true,
        emailVerified: true,
        loginAttempts: true,
        lockedUntil: true
      }
    });

    // 3. Vérifier si l'utilisateur existe
    if (!user) {
      logger.info('Tentative de connexion avec un email inexistant', { 
        email,
        ip: req.ip
      });
      return res.status(401).json({ 
        success: false,
        message: 'Identifiants incorrects'
      });
    }

    // 4. Vérifier si le compte est verrouillé
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const remainingTime = Math.ceil((new Date(user.lockedUntil) - new Date()) / 1000 / 60);
      
      logger.warn('Tentative de connexion sur un compte verrouillé', { 
        userId: user.id,
        ip: req.ip,
        remainingTime
      });
      
      return res.status(403).json({
        success: false,
        message: `Compte temporairement verrouillé. Réessayez dans ${remainingTime} minute(s).`,
        lockedUntil: user.lockedUntil
      });
    }

    // 5. Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    // 6. Gérer les tentatives de connexion échouées
    if (!isPasswordValid) {
      // Incrémenter le compteur de tentatives échouées
      const MAX_LOGIN_ATTEMPTS = 5;
      const loginAttempts = (user.loginAttempts || 0) + 1;
      
      // Déterminer si le compte doit être verrouillé
      let updateData = { loginAttempts };
      
      if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        // Verrouiller le compte pour 15 minutes
        const lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        updateData.lockedUntil = lockedUntil;
        
        logger.warn('Compte verrouillé après tentatives multiples', { 
          userId: user.id,
          attempts: loginAttempts,
          ip: req.ip,
          lockedUntil
        });
      }
      
      // Mettre à jour le compteur de tentatives
      await prisma.user.update({
        where: { id: user.id },
        data: updateData
      });
      
      return res.status(401).json({ 
        success: false,
        message: 'Identifiants incorrects',
        remainingAttempts: MAX_LOGIN_ATTEMPTS - loginAttempts
      });
    }

    // 7. Vérifier si l'email est vérifié (si nécessaire)
    if (!user.emailVerified) {
      logger.info('Tentative de connexion avec un email non vérifié', { 
        userId: user.id,
        ip: req.ip
      });
      
      return res.status(403).json({
        success: false,
        message: 'Veuillez vérifier votre adresse email avant de vous connecter',
        requiresVerification: true
      });
    }

    // 8. Réinitialiser le compteur de tentatives de connexion
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        loginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date()
      }
    });

    // 9. Générer les tokens d'authentification
    const userData = {
      id: user.id,
      email: user.email,
      role: user.role
    };
    
    const { accessToken, refreshToken, accessTokenExpiry, refreshTokenExpiry } = await generateAuthTokens(userData, { rememberMe });

    // 10. Enregistrer l'activité de connexion
    logger.info('Connexion réussie', { 
      userId: user.id,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    // 11. Envoyer la réponse
    return res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      user: {
        id: user.id,
        name: user.fullName,  // Utilisez fullName mais renvoyez-le comme 'name' pour la compatibilité
        email: user.email,
        role: user.role
      },
      tokens: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresAt: accessTokenExpiry,
        refreshExpiresAt: refreshTokenExpiry
      }
    });
    
  } catch (error) {
    // Gestion des erreurs
    logger.error('Erreur lors de la connexion', { 
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la connexion',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Rafraîchit le token d'accès à l'aide du token de rafraîchissement
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON avec le nouveau token d'accès
 */
export const refreshToken = async (req, res) => {
  try {
    // 1. Récupérer le token de rafraîchissement
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token de rafraîchissement manquant',
        error: 'MISSING_TOKEN'
      });
    }

    // 2. Vérifier et décoder le token
    let payload;
    try {
      payload = await verifyToken(token, {
        audience: 'app:refresh',
        purpose: 'refresh'
      });
    } catch (error) {
      logger.warn('Tentative de rafraîchissement avec un token invalide', {
        error: error.message,
        ip: req.ip
      });

      return res.status(401).json({
        success: false,
        message: 'Token de rafraîchissement invalide ou expiré',
        error: 'INVALID_TOKEN'
      });
    }

    // 3. Vérifier si l'utilisateur existe toujours
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        role: true,
        emailVerified: true
      }
    });

    if (!user) {
      logger.warn('Tentative de rafraîchissement pour un utilisateur inexistant', {
        userId: payload.id,
        ip: req.ip
      });

      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
        error: 'USER_NOT_FOUND'
      });
    }

    // 4. Vérifier si l'email est vérifié
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Veuillez vérifier votre adresse email',
        error: 'EMAIL_NOT_VERIFIED'
      });
    }

    // 5. Générer un nouveau token d'accès
    const userData = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    const { accessToken, accessTokenExpiry } = await generateAuthTokens(userData, {
      refreshToken: token,
      generateRefreshToken: false
    });

    // 6. Enregistrer l'activité
    logger.info('Token rafraîchi avec succès', {
      userId: user.id,
      ip: req.ip
    });

    // 7. Envoyer la réponse
    return res.status(200).json({
      success: true,
      message: 'Token rafraîchi avec succès',
      accessToken,
      tokenType: 'Bearer',
      expiresAt: accessTokenExpiry
    });

  } catch (error) {
    // Gestion des erreurs
    logger.error('Erreur lors du rafraîchissement du token', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });

    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors du rafraîchissement du token',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Déconnecte l'utilisateur en invalidant son token de rafraîchissement
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON confirmant la déconnexion
 */
