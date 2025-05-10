/**
 * Contrôleur pour la vérification d'email par OTP
 * @module controllers/auth/verifyEmailController
 */

import prisma from '../../config/prisma.js';
import { logger } from '../../utils/logger.js';

/**
 * Vérifie l'adresse email d'un utilisateur avec un code OTP
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON confirmant la vérification
 */
export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Adresse email et code de vérification requis',
        error: 'MISSING_PARAMETERS'
      });
    }
    
    // Rechercher l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
        error: 'USER_NOT_FOUND'
      });
    }

    // Rechercher l'OTP valide
    const otp = await prisma.oTP.findFirst({
      where: {
        userId: user.id,
        code,
        type: 'EMAIL_VERIFICATION',
        used: false,
        expiresAt: {
          gt: new Date()
        }
      }
    });
    
    if (!otp) {
      logger.warn('Tentative de vérification avec un code OTP invalide ou expiré', {
        email,
        ip: req.ip
      });
      
      return res.status(400).json({
        success: false,
        message: 'Code de vérification invalide ou expiré',
        error: 'INVALID_CODE'
      });
    }
    
    // Marquer l'OTP comme utilisé
    await prisma.OTP.update({
      where: { id: otp.id },
      data: { used: true }
    });
    
    // Mettre à jour le statut de vérification de l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });
    
    logger.info('Email vérifié avec succès via code OTP', { 
      userId: updatedUser.id,
      email: updatedUser.email,
      ip: req.ip
    });
    
    return res.status(200).json({
      success: true,
      message: 'Adresse email vérifiée avec succès',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt
      }
    });
    
  } catch (error) {
    logger.error('Erreur lors de la vérification de l\'email avec code OTP', { 
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la vérification de l\'email',
      error: process.env.NODE_ENV === 'development' ? error.message : 'SERVER_ERROR'
    });
  }
};

/**
 * Renvoie un email de vérification avec un nouveau code OTP
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON confirmant l'envoi
 */
export const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Adresse email requise',
        error: 'MISSING_EMAIL'
      });
    }
    
    // Rechercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        fullName: true,
        emailVerified: true
      }
    });
    
    if (!user) {
      // Pour des raisons de sécurité, ne pas révéler si l'email existe ou non
      return res.status(200).json({
        success: true,
        message: 'Si cette adresse email est associée à un compte, un code de vérification a été envoyé'
      });
    }
    
    // Vérifier si l'email est déjà vérifié
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Cette adresse email est déjà vérifiée',
        error: 'EMAIL_ALREADY_VERIFIED'
      });
    }
    
    // Générer un nouveau code OTP à 6 chiffres
    const generateOTP = () => {
      return Math.floor(100000 + Math.random() * 900000).toString();
    };
    
    const newCode = generateOTP();
    
    // Enregistrer le nouveau code OTP
    await prisma.oTP.create({
      data: {
        userId: user.id,
        code: newCode,
        type: 'EMAIL_VERIFICATION',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      }
    });
    
    // Importer dynamiquement pour éviter les dépendances circulaires
    const { sendVerificationEmail } = await import('../../utils/email.js');
    
    // Envoyer l'email avec le nouveau code
    await sendVerificationEmail(user.email, newCode, user.fullName);
    
    logger.info('Nouveau code de vérification envoyé', { 
      userId: user.id,
      email: user.email,
      ip: req.ip
    });
    
    return res.status(200).json({
      success: true,
      message: 'Un nouveau code de vérification a été envoyé à votre adresse email'
    });
    
  } catch (error) {
    logger.error('Erreur lors de l\'envoi du nouveau code de vérification', { 
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de l\'envoi du code de vérification',
      error: process.env.NODE_ENV === 'development' ? error.message : 'SERVER_ERROR'
    });
  }
};