/**
 * Contrôleur pour l'inscription des utilisateurs
 * @module controllers/auth/registerController
 */

import prisma from '../../config/prisma.js';
import bcrypt from 'bcryptjs';
import { generateAuthTokens } from '../../utils/paseto.js';
import { logger } from '../../utils/logger.js';
import { validateRegisterInput } from '../../validators/auth.js';
import { sendOTPByEmail } from '../../utils/email.js';

/**
 * Gère l'inscription d'un nouvel utilisateur
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON avec les informations utilisateur et tokens
 */
export const register = async (req, res) => {
  try {
    // 1. Valider les données d'entrée
    const { error, value } = validateRegisterInput(req.body);
    if (error) {
      logger.warn('Tentative d\'inscription avec des données invalides', { 
        error: error.details,
        ip: req.ip
      });
      
      return res.status(400).json({ 
        success: false,
        message: 'Données d\'inscription invalides',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { email, phone, password, fullName } = value;

    // Vérifier qu'au moins un identifiant est fourni (email ou téléphone)
    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Vous devez fournir un email ou un numéro de téléphone',
        error: 'MISSING_IDENTIFIER'
      });
    }

    // 2. Vérifier si l'email ou le téléphone est déjà utilisé
    const existingConditions = [];
    if (email) {
      existingConditions.push({ email: { equals: email.toLowerCase(), mode: 'insensitive' } });
    }
    if (phone) {
      existingConditions.push({ phone });
    }

    const userExists = await prisma.user.findFirst({
      where: { 
        OR: existingConditions
      },
    });
    
    if (userExists) {
      let field = 'identifiant';
      if (email && userExists.email?.toLowerCase() === email.toLowerCase()) {
        field = 'email';
      } else if (phone && userExists.phone === phone) {
        field = 'numéro de téléphone';
      }
      
      logger.info(`Tentative d'inscription avec un ${field} déjà utilisé`, { 
        ...(email && { email }),
        ...(phone && { phone }),
        ip: req.ip
      });
      
      return res.status(409).json({ 
        success: false,
        message: `Ce ${field} est déjà utilisé`,
        error: 'DUPLICATE_ACCOUNT',
        field: field === 'email' ? 'email' : 'phone'
      });
    }

    // 3. Hacher le mot de passe
    const saltRounds = 12; // Niveau de sécurité recommandé
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Créer l'utilisateur
    const user = await prisma.user.create({
      data: { 
        fullName,
        ...(email && { email: email.toLowerCase() }),
        ...(phone && { phone }),
        password: hashedPassword,
        role: 'USER',
        emailVerified: !email, // Si inscription par téléphone, pas besoin de vérifier l'email
        phoneVerified: !phone, // Si inscription par email, pas besoin de vérifier le téléphone
        createdAt: new Date(),
        profile:{
          create:{}
        }
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        profile: true
      }
    });

    // 5. Générer un code OTP et envoyer la vérification
    let verificationSent = false;
    
    // Dans la fonction register, remplacez le code de génération et d'envoi d'OTP par :

// Si l'utilisateur s'inscrit avec un email, envoyer un email avec code OTP
if (email) {
  const otpResult = await sendOTPByEmail({
    userId: user.id,
    email: user.email,
    name: user.fullName || 'Utilisateur',
    type: 'EMAIL_VERIFICATION'
  });
  
  verificationSent = otpResult.success;
  
  if (verificationSent) {
    logger.info('Code OTP envoyé pour vérification email', { 
      userId: user.id,
      email: user.email
    });
  } else {
    logger.error('Échec de l\'envoi du code OTP pour vérification email', { 
      userId: user.id,
      email: user.email,
      error: otpResult.message
    });
  }
}

// Si l'utilisateur s'inscrit avec un téléphone, créer un OTP pour la vérification
if (phone) {
  try {
    const { code } = await createOTP({
      userId: user.id,
      type: 'PHONE_VERIFICATION'
    });
    
    // TODO: Implémenter l'envoi de SMS avec le code OTP
    // await sendSMS(phone, `Votre code de vérification est: ${code}`);
    
    logger.info('Code OTP généré pour vérification téléphone', { 
      userId: user.id,
      phone: user.phone,
      ...(process.env.NODE_ENV === 'development' && { code })
    });
    
    verificationSent = true;
  } catch (error) {
    logger.error('Erreur lors de la génération du code OTP pour téléphone', {
      userId: user.id,
      phone: user.phone,
      error: error.message
    });
    
    verificationSent = false;
  }
}

    // 7. Générer les tokens d'authentification
    const userData = {
      id: user.id,
      ...(email && { email: user.email }),
      ...(phone && { phone: user.phone }),
      role: user.role
    };
    
    const { accessToken, refreshToken } = await generateAuthTokens(userData);

    // 8. Enregistrer l'activité d'inscription
    logger.info('Nouvel utilisateur inscrit', { 
      userId: user.id,
      fullName: user.fullName,
      ...(email && { email: user.email }),
      ...(phone && { phone: user.phone }),
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    // 9. Envoyer la réponse
    return res.status(201).json({
      success: true,
      message: email 
        ? 'Inscription réussie. Veuillez vérifier votre adresse email.'
        : 'Inscription réussie. Veuillez vérifier votre numéro de téléphone.',
      user: {
        id: user.id,
        fullName: user.fullName,
        ...(email && { email: user.email }),
        ...(phone && { phone: user.phone }),
        role: user.role,
        ...(email && { emailVerified: user.emailVerified }),
        ...(phone && { phoneVerified: user.phoneVerified }),
        createdAt: user.createdAt,
        profile: user.profile,
      },
      tokens: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer'
      },
      verification: {
        required: true,
        sent: verificationSent,
        method: email ? 'email' : 'phone'
      }
    });
    
  } catch (error) {
    // Gestion des erreurs
    logger.error('Erreur lors de l\'inscription', { 
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    
    // Gérer les erreurs spécifiques de Prisma
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Un compte avec ces informations existe déjà',
        error: 'DUPLICATE_ACCOUNT'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de l\'inscription',
      error: process.env.NODE_ENV === 'development' ? error.message : 'SERVER_ERROR'
    });
  }
};
/**
 * Vérifie l'adresse email d'un utilisateur
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON confirmant la vérification
 */
