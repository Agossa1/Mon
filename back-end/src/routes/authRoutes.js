import express from 'express';
import { login, refreshToken } from '../controllers/auth/loginController.js';
import { logout } from '../controllers/auth/logoutControlleur.js';
import { register } from '../controllers/auth/registerController.js';
import { verifyEmail, resendVerificationCode } from '../controllers/auth/verifyEmailController.js';
import {
    forgotPassword,
    resetPassword,
    updatePassword,
    verifyPasswordResetOTP
} from '../controllers/auth/passwordController.js';
import { getMyProfile, updateMyProfile, updateUserInfo, getPublicProfile } from '../controllers/auth/profileController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { uploadProfileImage, uploadCoverImage, handleUploadError } from '../middleware/uploadImage.js';
import { uploadAvatar, uploadCover } from '../controllers/auth/profileController.js';
const router = express.Router();

/**
 * Routes d'inscription et de connexion
 */
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', requireAuth, logout);

/**
 * Routes de vérification d'email
 */
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationCode);

/**
 * Routes de gestion de mot de passe
 */
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-password-otp', verifyPasswordResetOTP)
router.post('/update-password', requireAuth, updatePassword);

/**
 * Routes de profil utilisateur
 */
// Obtenir le profil complet de l'utilisateur connecté
router.get('/me', requireAuth, getMyProfile);

// Mettre à jour le profil de l'utilisateur connecté
router.put('/profile', requireAuth, updateMyProfile);

// Mettre à jour les informations de base de l'utilisateur connecté
router.patch('/profile/info', requireAuth, updateUserInfo);

// Obtenir le profil public d'un utilisateur
router.get('/profile/:userId', getPublicProfile);


// Route pour télécharger un avatar
router.post('/profile/avatar', requireAuth, uploadProfileImage, handleUploadError, uploadAvatar);

// Route pour télécharger une image de couverture
router.post('/profile/cover', requireAuth, uploadCoverImage, handleUploadError, uploadCover);

// Exporter le routeur
export { router as authRoutes };