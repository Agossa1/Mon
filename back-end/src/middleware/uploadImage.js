import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger.js';

/**
 * Crée un middleware multer configuré pour un type spécifique d'upload
 * @param {string} uploadType - Type d'upload (profiles, products, etc.)
 * @param {number} maxSize - Taille maximale en octets (par défaut 5MB)
 * @returns {Object} Middleware multer configuré
 */
export const createUploader = (uploadType = 'general', maxSize = 5 * 1024 * 1024) => {
  // Créer le dossier d'upload s'il n'existe pas
  const uploadDir = `uploads/${uploadType}`;
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    logger.info(`Dossier d'upload créé: ${uploadDir}`);
  }

  // Configuration du stockage
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      // Nettoyer le nom de fichier original
      const originalName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9]/g, '');
      const timestamp = Date.now();
      const uniqueSuffix = Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname).toLowerCase();
      
      cb(null, `${originalName}-${timestamp}-${uniqueSuffix}${extension}`);
    }
  });

  // Configuration de multer
  return multer({
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: (req, file, cb) => {
      // Vérifier le type MIME
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Seules les images sont acceptées (JPEG, PNG, GIF, etc.)'), false);
      }
    }
  });
};

/**
 * Middleware pour gérer les erreurs d'upload
 */
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Erreur Multer
    logger.warn('Erreur Multer lors de l\'upload', {
      error: err.message,
      code: err.code,
      field: err.field,
      userId: req.user?.id
    });

    let message = 'Erreur lors du téléchargement du fichier';
    let statusCode = 400;

    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'Le fichier est trop volumineux';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Type de fichier non attendu';
        break;
      default:
        message = `Erreur d'upload: ${err.message}`;
    }

    return res.status(statusCode).json({
      success: false,
      message,
      error: err.code
    });
  } else if (err) {
    // Autre erreur
    logger.error('Erreur lors de l\'upload de fichier', {
      error: err.message,
      stack: err.stack,
      userId: req.user?.id
    });

    return res.status(500).json({
      success: false,
      message: err.message || 'Une erreur est survenue lors du téléchargement du fichier',
      error: 'UPLOAD_ERROR'
    });
  }
  
  next();
};

/**
 * Middleware pour l'upload d'une seule image de profil
 */
export const uploadProfileImage = createUploader('profiles').single('avatar');

/**
 * Middleware pour l'upload d'une image de couverture
 */
export const uploadCoverImage = createUploader('profiles').single('coverImage');

/**
 * Middleware pour l'upload d'images de produit (jusqu'à 5)
 */
export const uploadProductImages = createUploader('products', 10 * 1024 * 1024).array('productImages', 5);

/**
 * Middleware pour l'upload d'une image de catégorie
 */
export const uploadCategoryImage = createUploader('categories').single('categoryImage');

/**
 * Fonction utilitaire pour supprimer un fichier
 * @param {string} filePath - Chemin du fichier à supprimer
 * @returns {Promise<boolean>} - True si supprimé avec succès, false sinon
 */

export const deleteFile = async (filePath) => {
  try {
    if (!filePath) return false;
    
    // Si le chemin est une URL, extraire le chemin relatif
    let relativePath = filePath;
    
    if (filePath.includes('://')) {
      const urlObj = new URL(filePath);
      // Enlever le premier slash pour obtenir un chemin relatif
      relativePath = urlObj.pathname.startsWith('/') 
        ? urlObj.pathname.substring(1) 
        : urlObj.pathname;
    }
    
    // Vérifier si le fichier existe
    if (fs.existsSync(relativePath)) {
      fs.unlinkSync(relativePath);
      logger.info(`Fichier supprimé: ${relativePath}`);
      return true;
    } else {
      logger.warn(`Fichier non trouvé pour suppression: ${relativePath}`);
      return false;
    }
  } catch (error) {
    logger.error('Erreur lors de la suppression du fichier', {
      error: error.message,
      stack: error.stack,
      filePath
    });
    return false;
  }
};