import bcrypt from 'bcryptjs';
import { logger } from '../../utils/logger.js';
import prisma from '../../config/prisma.js';
import { sendOTPByEmail, verifyOTP } from '../../utils/email.js';
import { generateOneTimeToken, verifyToken } from '../../utils/paseto.js';
import {
  validateForgotPasswordInput,
  validateResetPasswordInput,
  validateVerifyOTPInput
} from '../../validators/auth.js';

/**
 * Gère la demande de réinitialisation de mot de passe
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON avec le statut de la demande
 */
export const forgotPassword = async (req, res) => {
  try {
    // 1. Valider l'email
    const { error, value } = validateForgotPasswordInput(req.body);
    if (error) {
      logger.warn('Tentative de réinitialisation avec des données invalides', {
        error: error.details,
        ip: req.ip
      });

      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { email } = value;

    // 2. Vérifier si l'utilisateur existe
    const user = await prisma.user.findFirst({
      where: {
        email: { equals: email.toLowerCase(), mode: 'insensitive' }
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        emailVerified: true
      }
    });

    // 3. Si l'utilisateur n'existe pas, renvoyer une réponse générique pour éviter les fuites d'information
    if (!user) {
      logger.info('Tentative de réinitialisation pour un email inexistant', {
        email,
        ip: req.ip
      });

      // Réponse générique pour éviter les attaques par énumération
      return res.status(200).json({
        success: true,
        message: 'Si cette adresse email est associée à un compte, vous recevrez un email avec un code de vérification'
      });
    }

    // 4. Vérifier si l'email est vérifié
    if (!user.emailVerified) {
      logger.info('Tentative de réinitialisation pour un email non vérifié', {
        userId: user.id,
        email: user.email,
        ip: req.ip
      });

      return res.status(403).json({
        success: false,
        message: 'Veuillez vérifier votre adresse email avant de réinitialiser votre mot de passe',
        requiresVerification: true
      });
    }

    // 5. Envoyer l'email avec le code OTP
    const emailSent = await sendOTPByEmail({
      userId: user.id,
      email: user.email,
      name: user.fullName || 'Utilisateur',
      type: 'PASSWORD_RESET'
    });

    if (!emailSent.success) {
      logger.error('Échec de l\'envoi de l\'email de réinitialisation', {
        userId: user.id,
        email: user.email,
        error: emailSent.message
      });

      return res.status(500).json({
        success: false,
        message: 'Une erreur est survenue lors de l\'envoi de l\'email de réinitialisation',
        error: 'EMAIL_SEND_FAILED'
      });
    }

    // 6. Enregistrer l'activité
    logger.info('Demande de réinitialisation de mot de passe', {
      userId: user.id,
      email: user.email,
      ip: req.ip
    });

    // 7. Renvoyer une réponse générique
    return res.status(200).json({
      success: true,
      message: 'Si cette adresse email est associée à un compte, vous recevrez un email avec un code de vérification'
    });

  } catch (error) {
    // Gestion des erreurs
    logger.error('Erreur lors de la demande de réinitialisation', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });

    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la demande de réinitialisation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const resetPassword = async (req, res) => {
  try {

    logger.info('Tentative de réinitialisation de mot de passe', {
      hasPassword: !!req.body.password,
      hasConfirmPassword: !!req.body.confirmPassword,
      hasToken: !!req.body.token,
      tokenLength: req.body.token ? req.body.token.length : 0,
      tokenValue: req.body.token ? req.body.token.substring(0, 20) + '...' : 'absent',
      ip: req.ip
    });

    // 1. Valider les données d'entrée
    const { error, value } = validateResetPasswordInput(req.body);
    if (error) {
      logger.warn('Tentative de réinitialisation avec des données invalides', {
        error: error.details,
        ip: req.ip
      });

      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { password, confirmPassword, token } = value;

    // Vérification supplémentaire que les mots de passe correspondent
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Les mots de passe ne correspondent pas',
        error: 'PASSWORDS_DO_NOT_MATCH'
      });
    }

    // Vérification du format du token PASETO
    if (!token || typeof token !== 'string' || !token.startsWith('v3.local.')) {
      logger.warn('Token invalide fourni pour la réinitialisation', {
        tokenLength: token ? token.length : 0,
        tokenPrefix: token ? token.substring(0, 10) : 'absent'
      });
      return res.status(400).json({
        success: false,
        message: 'Token de réinitialisation invalide',
        error: 'INVALID_TOKEN_FORMAT'
      });
    }

    // Vérification du token PASETO
    let payload;
    try {
      payload = await verifyToken(token, 'password_reset');
    } catch (verifyError) {
      logger.warn('Échec de la vérification du token PASETO', {
        error: verifyError.message,
        ip: req.ip
      });
      return res.status(400).json({
        success: false,
        message: 'Token de réinitialisation invalide ou expiré',
        error: 'INVALID_OR_EXPIRED_TOKEN'
      });
    }

    // Utilisation du payload pour réinitialiser le mot de passe
    const userId = payload.sub;

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true }
    });

    if (!user) {
      logger.warn('Tentative de réinitialisation pour un utilisateur inexistant', {
        userId,
        ip: req.ip
      });
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
        error: 'USER_NOT_FOUND'
      });
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Mettre à jour le mot de passe de l'utilisateur
    await prisma.user.update({
      where: { id: userId },
      data: { 
        password: hashedPassword,
        updatedAt: new Date()
      }
    });

    // Enregistrer l'activité
    logger.info('Mot de passe réinitialisé avec succès', {
      userId,
      ip: req.ip
    });

    // Renvoyer une réponse de succès
    return res.status(200).json({
      success: true,
      message: 'Votre mot de passe a été réinitialisé avec succès'
    });

  } catch (error) {
    // Gestion des erreurs
    logger.error('Erreur lors de la réinitialisation du mot de passe', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });

    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la réinitialisation du mot de passe',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
/**
 * Vérifie le code OTP pour la réinitialisation de mot de passe
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON avec le statut de la vérification
 */
export const invalidateAllOTPsOfType = async (userId, type) => {
  try {
    await prisma.oTP.updateMany({
      where: {
        userId: userId,
        type: type,
        used: false,
        expiresAt: { gt: new Date() }
      },
      data: {
        used: true
      }
    });
    logger.info(`Tous les OTP de type ${type} ont été invalidés pour l'utilisateur ${userId}`);
  } catch (error) {
    logger.error(`Erreur lors de l'invalidation des OTP de type ${type} pour l'utilisateur ${userId}`, {
      error: error.message,
      stack: error.stack
    });
  }
};

export const verifyPasswordResetOTP = async (req, res) => {
  try {
    // 1. Valider les données d'entrée
    const { error, value } = validateVerifyOTPInput(req.body);
    if (error) {
      logger.warn('Tentative de vérification OTP avec des données invalides', { 
        error: error.details,
        ip: req.ip
      });
      
      return res.status(400).json({ 
        success: false,
        message: 'Données invalides',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { email, code } = value;

    // 2. Vérifier si l'utilisateur existe
    const user = await prisma.user.findFirst({
      where: { 
        email: { equals: email.toLowerCase(), mode: 'insensitive' }
      },
      select: {
        id: true,
        email: true
      }
    });

    if (!user) {
      logger.warn('Tentative de vérification OTP pour un email inexistant', { 
        email,
        ip: req.ip
      });
      
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
        error: 'USER_NOT_FOUND'
      });
    }

    // 3. Vérifier le code OTP
const otpResult = await verifyOTP({
  userId: user.id,
  code,
  type: 'PASSWORD_RESET',
  markAsUsed: false
});

if (!otpResult.valid) {
  logger.warn('Échec de vérification du code OTP', { 
    userId: user.id,
    email: user.email,
    ip: req.ip,
    reason: otpResult.message,
    providedCode: code
  });
  
  return res.status(400).json({
    success: false,
    message: 'Code de vérification invalide ou expiré',
    error: 'INVALID_OTP',
    details: otpResult.message // Ajouter plus de détails sur la raison de l'échec
  });
}

    // 4. Générer un token de réinitialisation de mot de passe
       // 4. Générer un token de réinitialisation de mot de passe
    const resetToken = await generateOneTimeToken(
      user.id.toString(),
      'password_reset',
      '15m' // Le token expire après 15 minutes
    );

    // 5. Marquer le code OTP comme utilisé
    await verifyOTP({
      userId: user.id,
      code,
      type: 'PASSWORD_RESET',
      markAsUsed: true
    });
    await invalidateAllOTPsOfType(user.id, 'PASSWORD_RESET');

    // 6. Enregistrer l'activité
    logger.info('Code OTP vérifié avec succès pour la réinitialisation de mot de passe', {
      userId: user.id,
      email: user.email,
      ip: req.ip
    });

    // 7. Renvoyer le token de réinitialisation
    return res.status(200).json({
      success: true,
      message: 'Code de vérification validé avec succès',
      resetToken
    });

  } catch (error) {
    // Gestion des erreurs
    logger.error('Erreur lors de la vérification du code OTP', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });

    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la vérification du code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updatePassword = async (req, res) => {
  try {
    // Valide les entrées de données 
    const { error, value } = validateUpdatePasswordInput(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { currentPassword, newPassword } = value;

    // Vérifie si le mot de passe actuel est correct
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        password: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé',
        error: 'USER_NOT_FOUND'
      });
    }

    // Vérifie si le mot de passe actuel est correct
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      logger.warn('Tentative de changement de mot de passe avec un mot de passe actuel incorrect', {
        userId: user.id,
        ip: req.ip
      });
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe actuel est incorrect',
        error: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // Hache le nouveau mot de passe
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Met à jour le mot de passe dans la base de données
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date()
      }
    });

    // Enregistre l'activité
    logger.info('Mot de passe mis à jour avec succès', {
      userId: user.id,
      ip: req.ip
    });

    // Renvoie une réponse de succès
    return res.status(200).json({
      success: true,
      message: 'Votre mot de passe a été mis à jour avec succès'
    });

  } catch (error) {
    // Gestion des erreurs
    logger.error('Erreur lors de la mise à jour du mot de passe', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      ip: req.ip
    });

    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la mise à jour du mot de passe',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};