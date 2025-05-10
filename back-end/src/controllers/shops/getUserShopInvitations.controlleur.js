/**
 * Récupère les invitations reçues par l'utilisateur connecté
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON avec la liste des invitations
 */
exports.getUserShopInvitations = async (req, res) => {
    try {
        const userId = req.user.id;
        const email = req.user.email;

        // Options de pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        // Récupérer les invitations
        const result = await shopService.getUserInvitations({
            userId,
            email,
            page,
            limit,
            includeShopDetails: true
        });

        return res.status(200).json({
            success: true,
            data: result.invitations,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des invitations:', error);

        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des invitations',
            error: 'SERVER_ERROR'
        });
    }
};
