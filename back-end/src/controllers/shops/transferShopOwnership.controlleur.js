/**
 * Transfère la propriété d'une boutique à un autre membre
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON confirmant le transfert de propriété
 */
import shopService from '../services/shop.service.js';

exports.transferShopOwnership = async (req, res) => {
    try {
        const { id } = req.params;
        const { newOwnerId, confirmationPassword } = req.body;
        const currentOwnerId = req.user.id;

        // Vérifier que l'utilisateur est bien le propriétaire actuel
        const shop = await shopService.getShopById(id, { basic: true });

        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Boutique non trouvée',
                error: 'SHOP_NOT_FOUND'
            });
        }

        if (shop.ownerId !== currentOwnerId) {
            return res.status(403).json({
                success: false,
                message: 'Seul le propriétaire peut transférer la propriété de la boutique',
                error: 'FORBIDDEN'
            });
        }

        // Valider les données
        if (!newOwnerId) {
            return res.status(400).json({
                success: false,
                message: 'L\'identifiant du nouveau propriétaire est requis',
                error: 'MISSING_PARAMETERS'
            });
        }

        if (!confirmationPassword) {
            return res.status(400).json({
                success: false,
                message: 'Le mot de passe de confirmation est requis',
                error: 'MISSING_PARAMETERS'
            });
        }

        // Vérifier le mot de passe
        const passwordValid = await userService.verifyPassword(currentOwnerId, confirmationPassword);

        if (!passwordValid) {
            return res.status(401).json({
                success: false,
                message: 'Mot de passe incorrect',
                error: 'INVALID_PASSWORD'
            });
        }

        // Transférer la propriété
        const updatedShop = await shopService.transferShopOwnership(id, newOwnerId);

        return res.status(200).json({
            success: true,
            message: 'Propriété de la boutique transférée avec succès',
            data: {
                id: updatedShop.id,
                name: updatedShop.name,
                newOwnerId: updatedShop.ownerId
            }
        });
    } catch (error) {
        console.error('Erreur lors du transfert de propriété de la boutique:', error);

        if (error.message.includes('n\'est pas membre')) {
            return res.status(400).json({
                success: false,
                message: error.message,
                error: 'NOT_A_MEMBER'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Erreur lors du transfert de propriété de la boutique',
            error: 'SERVER_ERROR'
        });
    }
};