/**
 * Récupère les détails d'une boutique par son ID ou son slug
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON avec les détails de la boutique
 */
exports.getShop = async (req, res) => {
    try {
        const { idOrSlug } = req.params;

        // Déterminer si l'identifiant est un ID ou un slug
        const isId = /^[0-9a-fA-F]{24}$/.test(idOrSlug) || /^[a-z0-9]{25}$/.test(idOrSlug);

        // Récupérer la boutique
        const shop = await shopService.getShopByIdOrSlug(
            idOrSlug,
            isId ? 'id' : 'slug',
            { includeOwner: true, includeStats: true }
        );

        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Boutique non trouvée',
                error: 'SHOP_NOT_FOUND'
            });
        }

        // Vérifier si la boutique est active ou si l'utilisateur est autorisé à la voir
        const isOwnerOrAdmin = req.user && (
            req.user.id === shop.ownerId ||
            req.user.role === 'ADMIN'
        );

        if (shop.status !== 'ACTIVE' && !isOwnerOrAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Cette boutique n\'est pas active',
                error: 'SHOP_NOT_ACTIVE'
            });
        }

        return res.status(200).json({
            success: true,
            data: shop
        });
    } catch (error) {
        console.error('Erreur lors de la récupération de la boutique:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de la boutique',
            error: 'SERVER_ERROR'
        });
    }
};

