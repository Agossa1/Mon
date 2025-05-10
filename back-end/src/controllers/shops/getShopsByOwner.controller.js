/**
 * Récupère la liste des boutiques d'un propriétaire
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON avec la liste des boutiques
 */
exports.getShopsByOwner = async (req, res) => {
    try {
        const ownerId = req.params.userId || req.user.id;

        // Vérifier si l'utilisateur demande ses propres boutiques ou s'il est admin
        const isSelfOrAdmin = req.user.id === ownerId || req.user.role === 'ADMIN';

        // Options de pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Options de filtrage
        const status = isSelfOrAdmin ? req.query.status : 'ACTIVE'; // Si non propriétaire, uniquement les boutiques actives

        // Appeler le service
        const result = await shopService.getShopsByOwner(ownerId, {
            page,
            limit,
            status,
            includeStats: true
        });

        return res.status(200).json({
            success: true,
            data: result.shops,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des boutiques:', error);

        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des boutiques',
            error: 'SERVER_ERROR'
        });
    }
};

