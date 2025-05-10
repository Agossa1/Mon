/**
 * Refuse une invitation à rejoindre l'équipe d'une boutique
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON confirmant le refus de l'invitation
 */
exports.declineShopInvitation = async (req, res) => {
    try {
        const { invitationId } = req.params;
        const userId = req.user.id;

        // Refuser l'invitation
        const result = await shopService.declineShopInvitation(invitationId, userId);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Invitation non trouvée ou expirée',
                error: 'INVITATION_NOT_FOUND'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Invitation refusée avec succès'
        });
    } catch (error) {
        console.error('Erreur lors du refus de l\'invitation:', error);

        if (error.message.includes('n\'appartient pas')) {
            return res.status(403).json({
                success: false,
                message: error.message,
                error: 'INVALID_INVITATION'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Erreur lors du refus de l\'invitation',
            error: 'SERVER_ERROR'
        });
    }
};
