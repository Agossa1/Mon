import prisma from '../../config/prisma.js';
import { logger } from '../../utils/logger.js';

/**
 * Récupère le profil de l'utilisateur connecté
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON avec les informations du profil
 */
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Récupérer le profil avec les informations de base de l'utilisateur
    // Utiliser select pour spécifier tous les champs, y compris la relation profile
    const userWithProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        profile: true  // Ceci sélectionnera automatiquement la relation profile
      }
    });

    if (!userWithProfile) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
        error: 'USER_NOT_FOUND'
      });
    }

    // Si l'utilisateur n'a pas encore de profil, en créer un vide
    if (!userWithProfile.profile) {
      const profile = await prisma.profile.create({
        data: {
          userId: userId
        }
      });

      userWithProfile.profile = profile;
    }

    return res.status(200).json({
      success: true,
      profile: userWithProfile
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération du profil', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id
    });

    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération du profil',
      error: process.env.NODE_ENV === 'development' ? error.message : 'SERVER_ERROR'
    });
  }
};

/**
 * Met à jour le profil de l'utilisateur connecté
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON avec le profil mis à jour
 */
export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      bio,
      avatar,
      coverImage,
      address,
      city,
      state,
      postalCode,
      country,
      phoneNumber,
      countryCode,
      dateOfBirth,
      gender,
      website,
      socialLinks,
      preferences
    } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
        error: 'USER_NOT_FOUND'
      });
    }

    // Vérifier que la valeur de gender est valide
    let validatedGender = null;
    if (gender) {
      const upperGender = gender.toUpperCase();
      if (['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'].includes(upperGender)) {
        validatedGender = upperGender;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Valeur de genre invalide',
          error: 'INVALID_GENDER_VALUE'
        });
      }
    }

    // Préparer les données à mettre à jour
    const profileData = {
      bio,
      avatar,
      coverImage,
      address,
      city,
      state,
      postalCode,
      country,
      phoneNumber,
      countryCode,
      website,
      ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
      ...(gender && { gender: validatedGender }),
      ...(socialLinks && { socialLinks: typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks }),
      ...(preferences && { preferences: typeof preferences === 'string' ? JSON.parse(preferences) : preferences })
    };

    // Filtrer les valeurs undefined
    Object.keys(profileData).forEach(key => 
      profileData[key] === undefined && delete profileData[key]
    );

    // Mettre à jour ou créer le profil
    const updatedProfile = await prisma.profile.upsert({
      where: {
        userId: userId
      },
      update: profileData,
      create: {
        userId: userId,
        ...profileData
      }
    });

    // Récupérer les informations utilisateur mises à jour
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true
      }
    });

    logger.info('Profil utilisateur mis à jour', {
      userId: userId
    });

    return res.status(200).json({
      success: true,
      message: 'Profil mis à jour avec succès',
      profile: {
        ...updatedUser,
        profile: updatedProfile
      }
    });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour du profil', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id
    });

    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la mise à jour du profil',
      error: process.env.NODE_ENV === 'development' ? error.message : 'SERVER_ERROR'
    });
  }
};
/**
 * Met à jour les informations de base de l'utilisateur connecté
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON avec les informations mises à jour
 */
export const updateUserInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, phone } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
        error: 'USER_NOT_FOUND'
      });
    }

    // Préparer les données à mettre à jour
    const userData = {};
    if (fullName !== undefined) userData.fullName = fullName;
    if (phone !== undefined) userData.phone = phone;

    // Si aucune donnée à mettre à jour, retourner une erreur
    if (Object.keys(userData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucune donnée à mettre à jour',
        error: 'NO_DATA_PROVIDED'
      });
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: userData,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true
      }
    });

    // Si le numéro de téléphone a été modifié, marquer comme non vérifié
    if (phone !== undefined && phone !== user.phone) {
      await prisma.user.update({
        where: { id: userId },
        data: { phoneVerified: false }
      });
      
      updatedUser.phoneVerified = false;
    }

    logger.info('Informations utilisateur mises à jour', {
      userId: userId,
      updatedFields: Object.keys(userData)
    });

    return res.status(200).json({
      success: true,
      message: 'Informations mises à jour avec succès',
      user: updatedUser
    });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour des informations utilisateur', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id
    });

    // Gérer les erreurs spécifiques
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Ce numéro de téléphone est déjà utilisé par un autre compte',
        error: 'DUPLICATE_PHONE'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la mise à jour des informations',
      error: process.env.NODE_ENV === 'development' ? error.message : 'SERVER_ERROR'
    });
  }
};

/**
 * Récupère un profil utilisateur public par son ID
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON avec les informations publiques du profil
 */
export const getPublicProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    // Récupérer uniquement les informations publiques du profil
    const publicProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        profile: {
          select: {
            bio: true,
            avatar: true,
            coverImage: true,
            website: true,
            gender: true,
            socialLinks: true
          }
        }
      }
    });

    if (!publicProfile) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
        error: 'USER_NOT_FOUND'
      });
    }

    return res.status(200).json({
      success: true,
      profile: publicProfile
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération du profil public', {
      error: error.message,
      stack: error.stack,
      profileId: req.params.userId,
      requesterId: req.user?.id
    });

    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération du profil',
      error: process.env.NODE_ENV === 'development' ? error.message : 'SERVER_ERROR'
    });
  }
};

/**
 * Télécharge et met à jour l'avatar de l'utilisateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON avec l'URL de l'avatar mis à jour
 */
export const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Vérifier si un fichier a été téléchargé
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier téléchargé',
        error: 'NO_FILE_UPLOADED'
      });
    }

    // Construire l'URL de l'avatar avec le chemin complet
    const avatarUrl = `${req.protocol}://${req.get('host')}/${req.file.path.replace(/\\/g, '/')}`;

    // Récupérer le profil actuel pour vérifier s'il y a déjà un avatar
    const currentProfile = await prisma.profile.findUnique({
      where: { userId },
      select: { avatar: true }
    });

    // Si un avatar existe déjà, essayer de le supprimer
    if (currentProfile?.avatar) {
      try {
        await deleteFile(currentProfile.avatar);
      } catch (error) {
        logger.warn('Échec de la suppression de l\'ancien avatar', {
          error: error.message,
          userId,
          oldAvatar: currentProfile.avatar
        });
        // Continuer malgré l'échec de suppression
      }
    }

    // Mettre à jour le profil avec l'URL de l'avatar
    const updatedProfile = await prisma.profile.upsert({
      where: { userId },
      update: { avatar: avatarUrl },
      create: { userId, avatar: avatarUrl }
    });

    logger.info('Avatar utilisateur mis à jour', {
      userId,
      avatarUrl
    });

    return res.status(200).json({
      success: true,
      message: 'Avatar mis à jour avec succès',
      avatar: avatarUrl
    });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour de l\'avatar', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id
    });

    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la mise à jour de l\'avatar',
      error: process.env.NODE_ENV === 'development' ? error.message : 'SERVER_ERROR'
    });
  }
};

/**
 * Télécharge et met à jour l'image de couverture de l'utilisateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON avec l'URL de l'image de couverture mise à jour
 */
export const uploadCover = async (req, res) => {
  try {
    const userId = req.user.id;

    // Vérifier si un fichier a été téléchargé
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier téléchargé',
        error: 'NO_FILE_UPLOADED'
      });
    }

    // Construire l'URL de l'image de couverture
    const coverImageUrl = `${req.protocol}://${req.get('host')}/${req.file.path}`;

    // Récupérer le profil actuel pour vérifier s'il y a déjà une image de couverture
    const currentProfile = await prisma.profile.findUnique({
      where: { userId },
      select: { coverImage: true }
    });

    // Si une image de couverture existe déjà, la supprimer
    if (currentProfile?.coverImage) {
      await deleteFile(currentProfile.coverImage);
    }

    // Mettre à jour le profil avec l'URL de l'image de couverture
    const updatedProfile = await prisma.profile.upsert({
      where: { userId },
      update: { coverImage: coverImageUrl },
      create: { userId, coverImage: coverImageUrl }
    });

    logger.info('Image de couverture utilisateur mise à jour', {
      userId,
      coverImageUrl
    });

    return res.status(200).json({
      success: true,
      message: 'Image de couverture mise à jour avec succès',
      coverImage: coverImageUrl
    });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour de l\'image de couverture', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id
    });

    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la mise à jour de l\'image de couverture',
      error: process.env.NODE_ENV === 'development' ? error.message : 'SERVER_ERROR'
    });
  }
};