/**
 * Quitte une équipe de boutique
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON confirmant le départ de l'équipe
 */
exports.leaveShopTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Vérifier que l'utilisateur n'est pas le propriétaire
        const shop = await shopService.getShopById(id, { basic: true });

        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Boutique non trouvée',
                error: 'SHOP_NOT_FOUND'
            });
        }

        if (shop.ownerId === userId) {
            return res.status(400).json({
                success: false,
                message: 'Le propriétaire ne peut pas quitter sa propre boutique',
                error: 'OWNER_CANNOT_LEAVE'
            });
        }

        // Quitter l'équipe
        const result = await shopService.removeShopMember(id, userId);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Vous n\'êtes pas membre de cette boutique',
                error: 'NOT_A_MEMBER'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Vous avez quitté l\'équipe de la boutique avec succès'
        });
    } catch (error) {
        console.error('Erreur lors du départ de l\'équipe de la boutique:', error);

        return res.status(500).json({
            success: false,
            message: 'Erreur lors du départ de l\'équipe de la boutique',
            error: 'SERVER_ERROR'
        });
    }
};
