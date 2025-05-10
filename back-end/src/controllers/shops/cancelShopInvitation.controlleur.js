/**
 * Annule une invitation à rejoindre l'équipe d'une boutique
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON confirmant l'annulation de l'invitation
 */
const shopService = require("../services/shop.service.js");

exports.cancelShopInvitation = async (req, res) => {
    try {
        const { id, invitationId } = req.params;
        const userId = req.user.id;

        // Vérifier si l'utilisateur a le droit d'annuler des invitations
        const canManageMembers = await shopService.canManageShopMembers(id, userId);

        if (!canManageMembers) {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'êtes pas autorisé à annuler des invitations pour cette boutique',
                error: 'FORBIDDEN'
            });
        }

        // Annuler l'invitation
        const result = await shopService.cancelShopInvitation(id, invitationId);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Invitation non trouvée',
                error: 'INVITATION_NOT_FOUND'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Invitation annulée avec succès'
        });
    } catch (error) {
        console.error('Erreur lors de l\'annulation de l\'invitation:', error);

        return res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'annulation de l\'invitation',
            error: 'SERVER_ERROR'
        });
    }
};

