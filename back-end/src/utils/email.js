import nodemailer from 'nodemailer';
import { logger } from './logger.js';
import dotenv from 'dotenv';

dotenv.config();



/**
 * Envoie un email
 * @async
 * @param {Object} options - Options pour l'envoi d'email
 * @param {string} options.to - Destinataire
 * @param {string} options.subject - Sujet de l'email
 * @param {string} options.html - Contenu HTML de l'email
 * @param {string} options.text - Contenu texte de l'email
 * @returns {Promise<Object>} Résultat de l'envoi
 */
export const sendEmail = async (options) => {
    logger.info('Initialisation du processus d\'envoi d\'email');

    // Vérifier la configuration email
    const emailService = process.env.EMAIL_SERVICE || 'smtp';
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const emailFrom = process.env.EMAIL_FROM;
    const emailFromName = process.env.EMAIL_FROM_NAME || 'Mon App Ecommerce';

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword || !emailFrom) {
        const message = 'Configuration email incomplète. Vérifiez vos variables d\'environnement.';
        logger.error('Configuration email manquante', { message });
        
        // En mode développement, simuler un envoi réussi
        if (process.env.NODE_ENV === 'development') {
            logger.info('Mode développement : simulation d\'envoi d\'email', {
                to: options.to,
                subject: options.subject
            });
            return {
                messageId: `dev-${Date.now()}`,
                simulated: true
            };
        }
        
        throw new Error(message);
    }

    try {
        // Créer un transporteur
        const transporter = nodemailer.createTransport({
            service: emailService === 'smtp' ? null : emailService,
            host: emailService === 'smtp' ? smtpHost : undefined,
            port: emailService === 'smtp' ? parseInt(smtpPort, 10) : undefined,
            secure: emailService === 'smtp' ? smtpPort === '465' : undefined,
            auth: {
                user: smtpUser,
                pass: smtpPassword
            }
        });

        // Envoyer l'email
        const info = await transporter.sendMail({
            from: `"${emailFromName}" <${emailFrom}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text
        });

        logger.info('Email envoyé avec succès', { 
            messageId: info.messageId,
            to: options.to
        });

        return info;
    } catch (error) {
        logger.error('Erreur lors de l\'envoi de l\'email', { 
            error: error.message, 
            stack: error.stack,
            to: options.to,
            subject: options.subject
        });
        throw error;
    }
};

/**
 * Génère un code OTP à 6 chiffres
 * @returns {string} Code OTP à 6 chiffres
 */
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Crée un OTP dans la base de données
 * @async
 * @param {Object} options - Options pour la création d'OTP
 * @param {string} options.userId - ID de l'utilisateur
 * @param {string} options.type - Type d'OTP (EMAIL_VERIFICATION, PHONE_VERIFICATION, PASSWORD_RESET)
 * @param {number} [options.expiresInMinutes=15] - Durée de validité en minutes
 * @returns {Promise<{code: string}>} Le code OTP généré
 */
export const createOTP = async ({ userId, type, expiresInMinutes = 15 }) => {
    try {
        // Générer un code OTP à 6 chiffres
        const code = generateOTP();
        
        // Importer prisma dynamiquement pour éviter les dépendances circulaires
        const { default: prisma } = await import('../config/prisma.js');
        
        // Stocker l'OTP dans la base de données
        await prisma.OTP.create({
            data: {
                userId,
                code: code,
                type,
                expiresAt: new Date(Date.now() + expiresInMinutes * 60 * 1000),
                used: false
            }
        });
        
        logger.info(`Code OTP généré pour ${type}`, { 
            userId,
            type,
            // Ne pas logger le code OTP en production
            ...(process.env.NODE_ENV === 'development' && { code })
        });
        
        return { code };
    } catch (error) {
        logger.error(`Erreur lors de la création d'OTP pour ${type}`, { 
            error: error.message, 
            stack: error.stack,
            userId
        });
        
        throw error;
    }
};

/**
 * Vérifie un code OTP
 * @async
 * @param {Object} options - Options pour la vérification d'OTP
 * @param {string} options.userId - ID de l'utilisateur
 * @param {string} options.code - Code OTP à vérifier
 * @param {string} options.type - Type d'OTP (EMAIL_VERIFICATION, PHONE_VERIFICATION, PASSWORD_RESET)
 * @param {boolean} [options.markAsUsed=true] - Marquer l'OTP comme utilisé si valide
 * @returns {Promise<{valid: boolean, message: string}>} Résultat de la vérification
 */
export const verifyOTP = async ({ userId, code, type, markAsUsed = true }) => {
    try {
        // Importer prisma dynamiquement pour éviter les dépendances circulaires
        const { default: prisma } = await import('../config/prisma.js');
        
        // Rechercher l'OTP valide le plus récent
        const otp = await prisma.OTP.findFirst({
            where: {
                userId,
                code: code,
                type,
                expiresAt: { gt: new Date() },
                used: false
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        
        if (!otp) {
            return { 
                valid: false, 
                message: 'Code OTP invalide ou expiré' 
            };
        }
        
        // Marquer l'OTP comme utilisé si demandé
        if (markAsUsed) {
            await prisma.OTP.update({
                where: { id: otp.id },
                data: { used: true }
            });
            
            logger.info(`Code OTP vérifié et marqué comme utilisé`, {
                userId,
                type,
                otpId: otp.id
            });
        }
        
        return { 
            valid: true, 
            message: 'Code OTP valide',
            otpId: otp.id
        };
    } catch (error) {
        logger.error(`Erreur lors de la vérification d'OTP pour ${type}`, { 
            error: error.message, 
            stack: error.stack,
            userId
        });
        
        return { 
            valid: false, 
            message: 'Erreur lors de la vérification du code OTP',
            error: error.message
        };
    }
};

/**
 * Crée un OTP et envoie un email de vérification
 * @async
 * @param {Object} options - Options pour l'envoi d'OTP par email
 * @param {string} options.userId - ID de l'utilisateur
 * @param {string} options.email - Email du destinataire
 * @param {string} [options.name] - Nom du destinataire
 * @param {string} [options.type='EMAIL_VERIFICATION'] - Type d'OTP
 * @returns {Promise<{success: boolean, code?: string}>} Résultat de l'opération
 */
export const sendOTPByEmail = async ({ userId, email, name, type = 'EMAIL_VERIFICATION' }) => {
    try {
        // Créer l'OTP
        const { code } = await createOTP({
            userId,
            type,
            expiresInMinutes: 15
        });
        
        // Déterminer la fonction d'envoi d'email appropriée selon le type
        let emailSent;
        
        if (type === 'PASSWORD_RESET') {
            emailSent = await sendPasswordResetOTPEmail(email, code, name);
        } else {
            // Par défaut, envoyer un email de vérification
            emailSent = await sendVerificationEmail(email, code, name);
        }
        
        return {
            success: true,
            messageId: emailSent.messageId,
            // Ne renvoyer le code qu'en développement
            ...(process.env.NODE_ENV === 'development' && { code })
        };
    } catch (error) {
        logger.error(`Erreur lors de l'envoi d'OTP par email pour ${type}`, { 
            error: error.message, 
            stack: error.stack,
            userId,
            email
        });
        
        return {
            success: false,
            message: error.message
        };
    }
};

/**
 * Envoie un email de vérification avec code OTP
 * @async
 * @param {string} email - Email du destinataire
 * @param {string} code - Code de vérification
 * @param {string} name - Nom du destinataire
 * @returns {Promise<Object>} Résultat de l'envoi
 */
export const sendVerificationEmail = async (email, code, name) => {
    try {
        return await sendEmail({
            to: email,
            subject: 'Vérification de votre adresse email',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Bonjour ${name || 'cher utilisateur'},</h2>
                    <p>Merci de vous être inscrit. Pour activer votre compte, veuillez utiliser le code de vérification ci-dessous :</p>
                    <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
                        ${code}
                    </div>
                    <p>Ce code est valable pendant 15 minutes. Si vous n'avez pas créé de compte, veuillez ignorer cet email.</p>
                    <p>Cordialement,<br>L'équipe Mon App Ecommerce</p>
                </div>
            `,
            text: `Bonjour ${name || 'cher utilisateur'},

Merci de vous être inscrit. Pour activer votre compte, veuillez utiliser le code de vérification ci-dessous :

${code}

Ce code est valable pendant 15 minutes. Si vous n'avez pas créé de compte, veuillez ignorer cet email.

Cordialement,
L'équipe Mon App Ecommerce`
        });
    } catch (error) {
        logger.error('Erreur lors de l\'envoi de l\'email de vérification', { 
            error: error.message, 
            stack: error.stack,
            email
        });
        throw error;
    }
};

/**
 * Envoie un email de réinitialisation de mot de passe avec code OTP
 * @async
 * @param {string} email - Email du destinataire
 * @param {string} code - Code de vérification
 * @param {string} name - Nom du destinataire
 * @returns {Promise<Object>} Résultat de l'envoi
 */
export const sendPasswordResetOTPEmail = async (email, code, name) => {
    try {
        return await sendEmail({
            to: email,
            subject: 'Réinitialisation de votre mot de passe',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Bonjour ${name || 'cher utilisateur'},</h2>
                    <p>Vous avez demandé la réinitialisation de votre mot de passe. Veuillez utiliser le code ci-dessous pour confirmer cette action :</p>
                    <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
                        ${code}
                    </div>
                    <p>Ce code est valable pendant 15 minutes. Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email et sécuriser votre compte.</p>
                    <p>Cordialement,<br>L'équipe Mon App Ecommerce</p>
                </div>
            `,
            text: `Bonjour ${name || 'cher utilisateur'},

Vous avez demandé la réinitialisation de votre mot de passe. Veuillez utiliser le code ci-dessous pour confirmer cette action :

${code}

Ce code est valable pendant 15 minutes. Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email et sécuriser votre compte.

Cordialement,
L'équipe Mon App Ecommerce`
        });
    } catch (error) {
        logger.error('Erreur lors de l\'envoi de l\'email de réinitialisation de mot de passe', { 
            error: error.message, 
            stack: error.stack,
            email
        });
        throw error;
    }
};

/**
 * Vérifie un code OTP et marque l'email de l'utilisateur comme vérifié
 * @async
 * @param {Object} options - Options pour la vérification
 * @param {string} options.userId - ID de l'utilisateur
 * @param {string} options.code - Code OTP à vérifier
 * @returns {Promise<{success: boolean, message: string}>} Résultat de la vérification
 */
export const verifyEmailWithOTP = async ({ userId, code }) => {
    try {
        // Vérifier le code OTP
        const otpResult = await verifyOTP({
            userId,
            code,
            type: 'EMAIL_VERIFICATION',
            markAsUsed: true
        });
        
        if (!otpResult.valid) {
            return otpResult;
        }
        
        // Importer prisma dynamiquement pour éviter les dépendances circulaires
        const { default: prisma } = await import('../config/prisma.js');
        
        // Marquer l'email comme vérifié
        await prisma.user.update({
            where: { id: userId },
            data: { emailVerified: true }
        });
        
        logger.info('Email vérifié avec succès', { userId });
        
        return {
            success: true,
            message: 'Adresse email vérifiée avec succès'
        };
    } catch (error) {
        logger.error('Erreur lors de la vérification de l\'email avec OTP', { 
            error: error.message, 
            stack: error.stack,
            userId
        });
        
        return {
            success: false,
            message: 'Erreur lors de la vérification de l\'email',
            error: error.message
        };
    }
};

/**
 * Vérifie un code OTP pour la réinitialisation de mot de passe
 * @async
 * @param {Object} options - Options pour la vérification
 * @param {string} options.userId - ID de l'utilisateur
 * @param {string} options.code - Code OTP à vérifier
 * @returns {Promise<{success: boolean, message: string}>} Résultat de la vérification
 */
export const verifyPasswordResetOTP = async ({ userId, code }) => {
    try {
        // Vérifier le code OTP sans le marquer comme utilisé
        // (il sera marqué comme utilisé lors de la réinitialisation effective du mot de passe)
        const otpResult = await verifyOTP({
            userId,
            code,
            type: 'PASSWORD_RESET',
            markAsUsed: false
        });
        
        return {
            success: otpResult.valid,
            message: otpResult.message,
            ...(otpResult.otpId && { otpId: otpResult.otpId })
        };
    } catch (error) {
        logger.error('Erreur lors de la vérification du code de réinitialisation de mot de passe', { 
            error: error.message, 
            stack: error.stack,
            userId
        });
        
        return {
            success: false,
            message: 'Erreur lors de la vérification du code',
            error: error.message
        };
    }
};