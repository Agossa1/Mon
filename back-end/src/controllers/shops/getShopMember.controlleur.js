/**
 * Récupère les détails d'un membre spécifique d'une équipe de boutique
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON avec les détails du membre
 */
exports.getShopMember = async (req, res) => {
    try {
        const { id, memberId } = req.params;
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

        // Récupérer le membre
        const member = await shopService.getShopMemberById(id, memberId);

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Membre non trouvé',
                error: 'MEMBER_NOT_FOUND'
            });
        }

        return res.status(200).json({
            success: true,
            data: member
        });
    } catch (error) {
        console.error('Erreur lors de la récupération du membre de la boutique:', error);

        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du membre de la boutique',
            error: 'SERVER_ERROR'
        });
    }
};
