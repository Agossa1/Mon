/**
 * Récupère les statistiques d'une boutique
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON avec les statistiques
 */
exports.getShopStats = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Vérifier si l'utilisateur a le droit de voir les statistiques
        const shop = await shopService.getShopById(id, { basic: true });

        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Boutique non trouvée',
                error: 'SHOP_NOT_FOUND'
            });
        }

        const canViewStats = userId === shop.ownerId ||
            req.user.role === 'ADMIN' ||
            await shopService.isShopMember(id, userId);

        if (!canViewStats) {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'êtes pas autorisé à voir les statistiques de cette boutique',
                error: 'FORBIDDEN'
            });
        }

        // Paramètres de période
        const { period = 'month', startDate, endDate } = req.query;

        // Récupérer les statistiques
        const stats = await shopService.getShopStatistics(id, {
            period,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined
        });

        return res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques de la boutique:', error);

        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques de la boutique',
            error: 'SERVER_ERROR'
        });
    }
};

