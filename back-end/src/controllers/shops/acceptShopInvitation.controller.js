/**
 * Accepte une invitation à rejoindre l'équipe d'une boutique
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON confirmant l'acceptation de l'invitation
 */
exports.acceptShopInvitation = async (req, res) => {
    try {
        const { invitationId } = req.params;
        const userId = req.user.id;

        // Accepter l'invitation
        const result = await shopService.acceptShopInvitation(invitationId, userId);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Invitation non trouvée ou expirée',
                error: 'INVITATION_NOT_FOUND'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Invitation acceptée avec succès',
            data: {
                shopId: result.shopId,
                shopName: result.shopName,
                role: result.role
            }
        });
    } catch (error) {
        console.error('Erreur lors de l\'acceptation de l\'invitation:', error);

        if (error.message.includes('n\'appartient pas')) {
            return res.status(403).json({
                success: false,
                message: error.message,
                error: 'INVALID_INVITATION'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'acceptation de l\'invitation',
            error: 'SERVER_ERROR'
        });
    }
};


