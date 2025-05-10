/**
 * Change le statut d'une boutique (ACTIVE, INACTIVE, SUSPENDED, etc.)
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON confirmant le changement de statut
 */
exports.changeShopStatus = async (req, res) => {
    try {
        // Vérifier que l'utilisateur est un administrateur
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'êtes pas autorisé à modifier le statut des boutiques',
                error: 'FORBIDDEN'
            });
        }

        const { id } = req.params;
        const { status, reason } = req.body;

        // Valider le statut
        const validStatuses = ['PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Statut invalide. Les valeurs acceptées sont: ${validStatuses.join(', ')}`,
                error: 'INVALID_STATUS'
            });
        }

        // Si le statut est SUSPENDED ou BANNED, une raison est requise
        if ((status === 'SUSPENDED' || status === 'BANNED') && !reason) {
            return res.status(400).json({
                success: false,
                message: 'Une raison est requise pour suspendre ou bannir une boutique',
                error: 'REASON_REQUIRED'
            });
        }

        // Mettre à jour le statut
        const updatedShop = await shopService.updateShopStatus(id, status, reason);

        if (!updatedShop) {
            return res.status(404).json({
                success: false,
                message: 'Boutique non trouvée',
                error: 'SHOP_NOT_FOUND'
            });
        }

        return res.status(200).json({
            success: true,
            message: `Statut de la boutique mis à jour avec succès: ${status}`,
            data: {
                id: updatedShop.id,
                name: updatedShop.name,
                status: updatedShop.status
            }
        });
    } catch (error) {
        console.error('Erreur lors du changement de statut de la boutique:', error);

        return res.status(500).json({
            success: false,
            message: 'Erreur lors du changement de statut de la boutique',
            error: 'SERVER_ERROR'
        });
    }
};
