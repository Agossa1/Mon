// controllers/shops/shop.controller.js
import { logger } from '../../utils/logger.js';
import shopService from '../services/shop.service.js';
import { createShopSchema, validateWithSchema } from '../../validators/shop.js';

/**
 * Crée une nouvelle boutique
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON avec les détails de la boutique créée
 */
export const createShop = async (req, res) => {
  try {
    // Valider les données d'entrée
    const { error, value } = validateWithSchema(createShopSchema, req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        error: 'INVALID_DATA',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    // Appeler le service
    const shop = await shopService.createShop(req.user.id, value);
    
    // Journaliser la création
    logger.info('Nouvelle boutique créée', {
      shopId: shop.id,
      userId: req.user.id,
      shopName: shop.name
    });
    
    // Répondre avec succès
    return res.status(201).json({
      success: true,
      message: 'Boutique créée avec succès',
      data: shop
    });
  } catch (error) {
    // Journaliser l'erreur
    logger.error('Erreur lors de la création de la boutique', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      requestData: req.body
    });
    
    // Gérer les erreurs spécifiques
    if (error.message.includes('existe déjà')) {
      return res.status(409).json({
        success: false,
        message: error.message,
        error: 'SHOP_ALREADY_EXISTS'
      });
    }
    
    if (error.message.includes('droits')) {
      return res.status(403).json({
        success: false,
        message: error.message,
        error: 'INSUFFICIENT_PERMISSIONS'
      });
    }
    
    // Erreur générique
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la création de la boutique',
      error: process.env.NODE_ENV === 'development' ? error.message : 'SERVER_ERROR'
    });
  }
};

