/**
 * Récupère la liste des membres d'une équipe de boutique
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON avec la liste des membres
 */
exports.getShopMembers = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Vérifier si l'utilisateur a le droit de voir les membres
        const canViewMembers = await shopService.canViewShopMembers(id, userId);

        if (!canViewMembers) {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'êtes pas autorisé à voir les membres de cette boutique',
                error: 'FORBIDDEN'
            });
        }

        // Options de pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        // Récupérer les membres
        const result = await shopService.getShopMembers(id, {
            page,
            limit,
            includeDetails: true
        });

        return res.status(200).json({
            success: true,
            data: result.members,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des membres de la boutique:', error);

        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des membres de la boutique',
            error: 'SERVER_ERROR'
        });
    }
};

