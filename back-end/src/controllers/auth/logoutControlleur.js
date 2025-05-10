import { logger } from '../../utils/logger.js';

/**
 * Contrôleur pour la déconnexion des utilisateurs
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON confirmant la déconnexion
 */
export const logout = async (req, res) => {
  try {
    // Si vous utilisez une liste de révocation de tokens, ajoutez le token ici
    // await revokeToken(req.token);
    
    // Récupérer le token d'autorisation
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      // Ici, vous pourriez ajouter le token à une liste noire
      // await addToBlacklist(token, req.user.id);
    }
    
    logger.info('Déconnexion réussie', { 
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    return res.status(200).json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    logger.error('Erreur lors de la déconnexion', { 
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      ip: req.ip
    });
    
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la déconnexion',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};