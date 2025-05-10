/**
 * Récupère les invitations en attente pour une boutique
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON avec la liste des invitations
 */
exports.getShopInvitations = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Vérifier si l'utilisateur a le droit de voir les invitations
        const canManageMembers = await shopService.canManageShopMembers(id, userId);

        if (!canManageMembers) {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'êtes pas autorisé à voir les invitations de cette boutique',
                error: 'FORBIDDEN'
            });
        }

        // Options de pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        // Récupérer les invitations
        const result = await shopService.getShopInvitations(id, {
            page,
            limit,
            includeDetails: true
        });

        return res.status(200).json({
            success: true,
            data: result.invitations,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des invitations de la boutique:', error);

        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des invitations de la boutique',
            error: 'SERVER_ERROR'
        });
    }
};
