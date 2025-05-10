/**
 * Supprime une boutique
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON confirmant la suppression
 */
const shopService = require("../services/shop.service.js");

exports.deleteShop = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Vérifier si l'utilisateur est le propriétaire ou un administrateur
        const shop = await shopService.getShopById(id, { basic: true });

        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Boutique non trouvée',
                error: 'SHOP_NOT_FOUND'
            });
        }

        const isOwnerOrAdmin = userId === shop.ownerId || req.user.role === 'ADMIN';

        if (!isOwnerOrAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'êtes pas autorisé à supprimer cette boutique',
                error: 'FORBIDDEN'
            });
        }

        // Demander une confirmation supplémentaire via un code de confirmation
        const { confirmationCode } = req.body;

        if (!confirmationCode || confirmationCode !== 'DELETE-' + shop.name.toUpperCase()) {
            return res.status(400).json({
                success: false,
                message: 'Code de confirmation invalide. Pour confirmer la suppression, veuillez fournir le code: DELETE-' + shop.name.toUpperCase(),
                error: 'INVALID_CONFIRMATION'
            });
        }

        // Appeler le service pour supprimer la boutique
        await shopService.deleteShop(id);

        return res.status(200).json({
            success: true,
            message: 'Boutique supprimée avec succès'
        });
    } catch (error) {
        console.error('Erreur lors de la suppression de la boutique:', error);

        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de la boutique',
            error: 'SERVER_ERROR'
        });
    }
};
